// ============================================================================
// CeniVerse — shared front-end behaviour
//
// Data architecture:
//   window.CENIVERSE_INDEX -> lightweight search index, embedded directly in
//                              every page's <head>/<body> (see the inline
//                              <script> block above this file's <script> tag).
//   window.CENIVERSE_DB    -> full movie records keyed by id, embedded
//                              directly in movie.html only.
//
// Both are embedded INLINE (not loaded via <script src="data/...">) on
// purpose: fetch() of local files is blocked over file://, and even
// <script src> to a sibling file can fail if these pages are opened outside
// their original folder structure (e.g. a single file saved on its own).
// Inlining means the page is fully self-contained and always works.
// gen_data.py regenerates data/_inline_db.js / data/_inline_index.js, which
// then get spliced into index.html / movie.html — see that script.
// ============================================================================

(function movieDetailLoader() {
  const isMoviePage = !!document.getElementById('detailBackdrop');
  if (!isMoviePage) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id') || 'kaalayanam';

  const loadingEl = document.getElementById('loadingState');
  const contentEl = document.getElementById('movieContent');
  const tabSectionEl = document.getElementById('tabSection');
  const notFoundEl = document.getElementById('notFoundState');

  function showNotFound() {
    if (loadingEl) loadingEl.hidden = true;
    const titleEl = document.getElementById('notFoundTitle');
    if (titleEl) titleEl.textContent = `We couldn't find "${requestedId}"`;
    if (notFoundEl) notFoundEl.hidden = false;
  }

  const db = (typeof window.CENIVERSE_DB !== 'undefined') ? window.CENIVERSE_DB : null;
  const movie = db ? db[requestedId] : null;

  if (!movie) {
    showNotFound();
    return;
  }

  document.body.dataset.movieSlug = requestedId;
  window.CENIVERSE_CURRENT_MOVIE = movie;
  try {
    renderMovie(movie);
    if (loadingEl) loadingEl.hidden = true;
    if (contentEl) contentEl.hidden = false;
    if (tabSectionEl) tabSectionEl.hidden = false;
    initTabs();
    initReviewerOpinions(requestedId);
  } catch (e) {
    console.error('CeniVerse render error:', e);
    showNotFound();
  }

  // ------------------------------------------------------------------------
  function pill(text) { return `<span class="pill">${text}</span>`; }

  function set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? '';
  }
  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html ?? '';
  }
  function show(id, visible) {
    const el = document.getElementById(id);
    if (el) el.hidden = !visible;
  }
  function crewRow(role, name) {
    return `<div class="crew-item"><div class="cr-role">${role}</div><div class="cr-name">${name}</div></div>`;
  }

  function fmtDate(iso) {
    if (!iso) return null;
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderMovie(m) {
    // ---- head / SEO ----
    document.title = `${m.title} (${m.year}) — Cast, Crew, Review & Real Data | CeniVerse`;
    set('pageTitle', document.title);
    const metaDesc = m.synopsis ? m.synopsis.slice(0, 155) : `${m.title} (${m.year}) — verified cast, crew and release information on CeniVerse.`;
    document.getElementById('metaDescription')?.setAttribute('content', metaDesc);
    const canonicalUrl = `${window.location.origin}${window.location.pathname}?id=${m.id}`;
    document.getElementById('canonicalLink')?.setAttribute('href', canonicalUrl);
    document.getElementById('ogTitle')?.setAttribute('content', document.title);
    document.getElementById('ogDescription')?.setAttribute('content', metaDesc);
    document.getElementById('ogUrl')?.setAttribute('content', canonicalUrl);
    document.getElementById('twTitle')?.setAttribute('content', document.title);
    document.getElementById('twDescription')?.setAttribute('content', metaDesc);

    const schemaEl = document.getElementById('movieSchema');
    if (schemaEl) {
      schemaEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: m.title,
        genre: m.genres,
        datePublished: m.releaseDate || undefined,
        inLanguage: m.language,
        director: m.director ? { '@type': 'Person', name: m.director } : undefined,
        actor: (m.cast || []).map(c => ({ '@type': 'Person', name: c.name })),
        aggregateRating: m.ceniverseRating ? {
          '@type': 'AggregateRating', ratingValue: String(m.ceniverseRating), bestRating: '10',
        } : undefined,
        countryOfOrigin: 'India',
      });
    }

    // ---- hero ----
    const backdrop = document.getElementById('detailBackdrop');
    if (backdrop) backdrop.dataset.tone = m.backdropTone || m.posterTone || 1;
    const poster = document.getElementById('detailPoster');
    if (poster) {
      if (m.poster) {
        poster.classList.remove('ph-poster');
        poster.removeAttribute('data-tone');
        poster.innerHTML = `<img src="${m.poster}" alt="${m.title} poster" class="poster-img" loading="eager">`;
      } else {
        poster.classList.add('ph-poster');
        poster.dataset.tone = m.posterTone || 1;
        poster.innerHTML = `
          <div class="ph-mark">
            <div class="ph-glyph">${m.glyph || m.title[0].toUpperCase()}</div>
            <div class="ph-title">${m.title}</div>
            <div class="ph-industry">${m.language} · ${m.year}</div>
          </div>`;
      }
    }

    set('breadcrumbLang', m.language);
    set('breadcrumbTitle', `${m.title} (${m.year})`);
    set('detailTitle', m.title);

    const facts = [];
    (m.genres || []).forEach(g => facts.push(pill(g)));
    if (m.runtime) facts.push(pill(`<strong>${m.runtime} min</strong>`));
    facts.push(pill(m.language));
    if (m.releaseDate) facts.push(pill(fmtDate(m.releaseDate)));
    if (m.certification) facts.push(pill(m.certification));
    setHtml('detailFacts', facts.join(''));

    // Hero rating row: real CeniVerse rating if we've reviewed it, otherwise
    // real box office/budget, otherwise an honest "not yet reviewed" note.
    let ratingRow = '';
    if (m.ceniverseRating) {
      ratingRow += `<div class="rating-badge"><div class="num">${m.ceniverseRating}<small>/10</small></div><div class="lbl"><b>CeniVerse Rating</b>Editorial</div></div>`;
    }
    if (m.boxOffice) {
      ratingRow += `<div class="rating-badge"><div class="num" style="font-size:22px;">${m.boxOffice}</div><div class="lbl"><b>Worldwide Box Office</b>Verified figure</div></div>`;
    }
    if (m.imdbRating) {
      ratingRow += `<div class="rating-badge"><div class="num" style="color:var(--accent-2);">${m.imdbRating}<small>/10</small></div><div class="lbl"><b>IMDb Rating</b>External, real</div></div>`;
    }
    if (!ratingRow) {
      ratingRow = `<div class="rating-badge"><div class="lbl"><b>Not yet reviewed</b>CeniVerse hasn't published a score for this title</div></div>`;
    }
    setHtml('heroRatingRow', ratingRow);

    const trailerBtn = document.getElementById('trailerCta');
    if (trailerBtn) {
      trailerBtn.onclick = () => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(m.title + ' official trailer')}`, '_blank', 'noopener');
      };
    }

    // ---- overview tab ----
    set('synopsisText', m.synopsis || 'Synopsis not yet available.');
    show('awardsBlock', !!m.awards);
    set('awardsText', m.awards);
    show('finalVerdictOverviewBlock', !!m.finalVerdict);
    set('finalVerdictOverviewText', m.finalVerdict);
    show('notReviewedBlock', !m.review);

    // ---- review tab ----
    const hasReview = !!m.review;
    show('reviewHasContent', hasReview);
    show('reviewMissingBlock', !hasReview);
    if (hasReview) {
      setHtml('reviewParagraphs', Object.entries(m.review).map(([heading, text]) =>
        `<h3>${heading}</h3><p>${text}</p>`).join(''));
      setHtml('positivesList', (m.positives || []).map(p => `<li>${p}</li>`).join('') || '<li>None recorded.</li>');
      setHtml('negativesList', (m.negatives || []).map(n => `<li>${n}</li>`).join('') || '<li>None recorded.</li>');
      set('finalVerdictText', m.finalVerdict || '');
    }

    // ---- ratings tab ----
    const hasRating = !!m.ceniverseRating;
    show('ratingsHasContent', hasRating);
    show('ratingsMissingBlock', !hasRating);
    if (hasRating) setHtml('ceniverseRatingNum', `${m.ceniverseRating}<small>/10</small>`);
    const pubRatings = m.publicRatings || [];
    setHtml('publicRatingsGrid', pubRatings.map(r => crewRow(r.source, r.value)).join(''));
    show('publicRatingsEmpty', pubRatings.length === 0);
    show('imdbHeading', !!m.imdbRating);
    show('imdbRatingBlock', !!m.imdbRating);
    if (m.imdbRating) setHtml('imdbRatingNum', `${m.imdbRating}<small>/10</small>`);

    // ---- cast & crew tab ----
    const castHtml = (m.cast || []).map((c, i) => `
      <div class="cast-item">
        <div class="cast-photo ph-avatar" data-tone="${(i % 8) + 1}">${initials(c.name)}</div>
        <div class="c-name">${c.name}</div>
        ${c.character ? `<div class="c-role">${c.character}</div>` : ''}
      </div>`).join('');
    setHtml('castGrid', castHtml || '<p style="color:var(--text-muted);font-size:13.5px;">Full cast not yet catalogued.</p>');

    const crewRows = [];
    if (m.director) crewRows.push(['Director', m.director]);
    if (m.writer) crewRows.push(['Writer', m.writer]);
    (m.producers || []).forEach((p, i) => crewRows.push([i === 0 ? 'Producer' : ' ', p]));
    if (m.musicDirector) crewRows.push(['Music Director', m.musicDirector]);
    if (m.cinematographer) crewRows.push(['Cinematographer', m.cinematographer]);
    if (m.editor) crewRows.push(['Editor', m.editor]);
    setHtml('crewGrid', crewRows.map(([role, name]) => crewRow(role, name)).join('')
      || '<p style="color:var(--text-muted);font-size:13.5px;">Full crew not yet catalogued.</p>');

    // ---- more info tab ----
    const moreRows = [];
    if (m.originalTitle && m.originalTitle !== m.title) moreRows.push(['Original Title', m.originalTitle]);
    moreRows.push(['Country', m.country || 'India']);
    if (m.ottPlatform) moreRows.push(['OTT Platform', m.ottPlatform]);
    setHtml('moreInfoGrid', moreRows.map(([k, v]) => crewRow(k, v)).join(''));

    const prodRows = [];
    if (m.director) prodRows.push(['Director', m.director]);
    (m.productionCompanies || []).forEach((pc, i) => prodRows.push([i === 0 ? 'Production Company' : ' ', pc]));
    setHtml('productionGrid', prodRows.map(([role, name]) => crewRow(role, name)).join(''));

    const sourceBlock = document.getElementById('sourceNoteBlock');
    if (sourceBlock) {
      sourceBlock.innerHTML = m.sourceNote ? `
        <div class="side-card" style="margin:0;">
          <h4>Data Source</h4>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.7;">${m.sourceNote}. CeniVerse does not invent cast, crew, dates, box-office figures or reviews — anything we can't verify is simply left blank.</p>
        </div>` : '';
    }

    // ---- gallery tab (generated art only — see note in the tab itself) ----
    const galleryTones = Array.from({ length: 8 }, (_, i) => ((m.posterTone || 1) + i) % 8 + 1);
    setHtml('galleryGrid', galleryTones.map(t =>
      `<div class="ph-poster" data-tone="${t}" style="aspect-ratio:16/10;border-radius:6px;object-fit:cover;"></div>`).join(''));

    // ---- sidebar ----
    const infoRows = [];
    if (m.releaseDate) infoRows.push(['Release Date', fmtDate(m.releaseDate)]);
    if (m.runtime) infoRows.push(['Runtime', `${m.runtime} min`]);
    infoRows.push(['Language', m.language]);
    infoRows.push(['Genres', (m.genres || []).join(', ')]);
    if (m.certification) infoRows.push(['Certification', m.certification]);
    if (m.budget) infoRows.push(['Budget', m.budget]);
    if (m.boxOffice) infoRows.push(['Box Office', m.boxOffice]);
    setHtml('sidebarMovieInfo', infoRows.map(([k, v]) => `
      <div class="info-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join(''));

    // "You may also like" — same language, different id
    const idx = window.CENIVERSE_INDEX || [];
    const related = idx.filter(x => x.id !== m.id && x.language === m.language).slice(0, 2);
    if (related.length === 0) {
      idx.filter(x => x.id !== m.id).slice(0, 2).forEach(x => related.push(x));
    }
    setHtml('alsoLikeList', related.map(r => `
      <a href="movie.html?id=${r.id}" style="display:flex;gap:10px;align-items:center;">
        <div style="width:44px;height:64px;border-radius:4px;overflow:hidden;flex-shrink:0;" class="${r.poster ? '' : 'ph-poster'}" ${r.poster ? '' : `data-tone="${r.posterTone || 1}"`}>${r.poster ? `<img src="${r.poster}" alt="${r.title} poster" class="poster-img" loading="lazy">` : ''}</div>
        <div><div style="font-size:13px;font-weight:600;">${r.title}</div><div style="font-size:11.5px;color:var(--text-muted);font-family:var(--font-mono);">${r.year} · ${r.language}</div></div>
      </a>`).join(''));

    set('reviewCountLabel', 'No ratings yet');
  }

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function initTabs() {
    document.querySelectorAll('.tabbar button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
      });
    });
  }

  // --------------------------------------------------------------------
  // Reviewer opinions — real, user-submitted only. No pre-seeded reviews:
  // fabricating "reviewer" testimonials for real films would be exactly
  // the kind of fake content this rebuild is trying to get away from.
  // --------------------------------------------------------------------
  function initReviewerOpinions(slug) {
    const STORAGE_KEY = 'reviews:' + slug;
    const feedEl = document.getElementById('reviewerFeed');
    const emptyNote = document.getElementById('reviewerEmptyNote');
    const countLabel = document.getElementById('reviewCountLabel');
    if (!feedEl) return;

    const hasStorage = () => typeof window.storage !== 'undefined' && window.storage;

    async function loadReviews() {
      if (!hasStorage()) return [];
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        if (res && res.value) return JSON.parse(res.value);
      } catch (e) { /* not found yet */ }
      return [];
    }
    async function saveReviews(reviews) {
      if (!hasStorage()) return;
      try { await window.storage.set(STORAGE_KEY, JSON.stringify(reviews), true); } catch (e) {}
    }

    function timeAgo() { return 'just now'; }

    function renderFeed(reviews) {
      if (reviews.length === 0) {
        feedEl.innerHTML = '';
        if (emptyNote) emptyNote.hidden = false;
        if (countLabel) countLabel.textContent = 'No ratings yet';
        return;
      }
      if (emptyNote) emptyNote.hidden = true;
      if (countLabel) countLabel.textContent = `${reviews.length} rating${reviews.length === 1 ? '' : 's'}`;
      feedEl.innerHTML = reviews.map(r => `
        <div class="review-card-full">
          <div class="rcf-avatar ph-avatar" data-tone="${(r.name.length % 8) + 1}">${initials(r.name)}</div>
          <div class="rcf-body">
            <div class="rcf-head">
              <span class="rcf-name">${escapeHtml(r.name)}</span>
              <span class="rcf-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
              <span class="rcf-verdict ${r.verdict}">${r.verdict === 'love' ? 'Loved it' : r.verdict === 'okay' ? 'It was okay' : "Didn't like it"}</span>
              <span class="rcf-time">${r.time}</span>
            </div>
            <p class="rcf-text">${escapeHtml(r.text)}</p>
          </div>
        </div>`).join('');
    }

    function escapeHtml(s) {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    let reviews = [];
    loadReviews().then(r => { reviews = r; renderFeed(reviews); });

    // ---- star input ----
    const starInput = document.getElementById('starInput');
    let selectedStars = 0;
    if (starInput) {
      const stars = starInput.querySelectorAll('span');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          selectedStars = parseInt(star.dataset.star, 10);
          stars.forEach(s => s.classList.toggle('filled', parseInt(s.dataset.star, 10) <= selectedStars));
        });
      });
    }

    // ---- verdict chips ----
    const verdictChips = document.getElementById('verdictChips');
    let selectedVerdict = null;
    if (verdictChips) {
      verdictChips.querySelectorAll('.wr-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          verdictChips.querySelectorAll('.wr-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedVerdict = chip.dataset.verdict;
        });
      });
    }

    const postBtn = document.getElementById('postReviewBtn');
    const errorEl = document.getElementById('reviewError');
    const successEl = document.getElementById('reviewSuccess');

    postBtn?.addEventListener('click', async () => {
      const nameEl = document.getElementById('reviewName');
      const textEl = document.getElementById('reviewText');
      const name = nameEl?.value.trim();
      const text = textEl?.value.trim();

      if (!name || !text || !selectedStars || !selectedVerdict) {
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.textContent = 'Please add your name, a star rating, a verdict, and a short review before posting.';
        }
        return;
      }
      if (errorEl) errorEl.hidden = true;

      reviews = [{
        name, rating: selectedStars, verdict: selectedVerdict, text, time: timeAgo(),
      }, ...reviews];
      renderFeed(reviews);
      await saveReviews(reviews);

      if (successEl) {
        successEl.hidden = false;
        setTimeout(() => { successEl.hidden = true; }, 4000);
      }
      nameEl.value = '';
      textEl.value = '';
      selectedStars = 0;
      selectedVerdict = null;
      starInput?.querySelectorAll('span').forEach(s => s.classList.remove('filled'));
      verdictChips?.querySelectorAll('.wr-chip').forEach(c => c.classList.remove('selected'));
    });
  }
})();

// ============================================================================
// Site-wide search — powered by window.CENIVERSE_INDEX, works on every page.
// ============================================================================
function initSiteSearch() {
  const input = document.getElementById('searchInput');
  const suggestionsEl = document.getElementById('searchSuggestions');
  if (!input || !suggestionsEl) return;

  const index = window.CENIVERSE_INDEX || [];

  // Strips case, hyphens/underscores, punctuation and extra whitespace so
  // "Mana-Shankara", "mana   shankara", and "MANA SHANKARA!!" all match the
  // same way as "Mana Shankara".
  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[-_]+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function searchableText(m) {
    return normalize([
      m.title, m.director, m.language, m.year, m.musicDirector,
      ...(m.genres || []), ...(m.cast || []), ...(m.producers || []),
    ].join(' '));
  }

  function search(query) {
    const q = normalize(query);
    if (!q) return [];
    const words = q.split(' ').filter(Boolean);
    return index
      .map(m => ({ m, text: searchableText(m) }))
      .filter(({ text }) => words.every(w => text.includes(w)))
      .map(({ m }) => m)
      .slice(0, 8);
  }

  function render(results, query) {
    if (!query.trim()) {
      suggestionsEl.hidden = true;
      return;
    }
    if (results.length === 0) {
      suggestionsEl.innerHTML = `<div class="sg-empty">No matches for "${query}" in our database yet.</div>`;
      suggestionsEl.hidden = false;
      return;
    }
    suggestionsEl.innerHTML = results.map(m => `
      <a class="sg-item" href="movie.html?id=${m.id}">
        <div class="sg-thumb ${m.poster ? '' : 'ph-poster'}" ${m.poster ? '' : `data-tone="${m.posterTone || 1}"`}>${m.poster ? `<img src="${m.poster}" alt="${m.title} poster" class="poster-img" loading="lazy">` : ''}</div>
        <div>
          <div class="sg-title">${m.title} <span style="color:var(--text-muted);font-weight:500;">(${m.year})</span></div>
          <div class="sg-meta">${m.language} · ${m.director || 'Director TBA'}${(m.genres && m.genres.length) ? ' · ' + m.genres.join(', ') : ''}</div>
        </div>
      </a>`).join('');
    suggestionsEl.hidden = false;
  }

  input.addEventListener('input', () => render(search(input.value), input.value));
  input.addEventListener('focus', () => { if (input.value.trim()) render(search(input.value), input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = suggestionsEl.querySelector('.sg-item');
      if (first) window.location.href = first.getAttribute('href');
    }
  });
  document.addEventListener('click', (e) => {
    if (!suggestionsEl.contains(e.target) && e.target !== input) suggestionsEl.hidden = true;
  });
}

// ============================================================================
// General page behaviour (both pages)
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {

  initSiteSearch();

  // ---- language ranking tabs (Home page "Top Rated") ----
  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.lang;
      document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.lang-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + target)?.classList.add('active');
    });
  });

  // ---- search overlay open/close ----
  const searchBtn = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchBtn && searchOverlay) {
    const closeSearch = () => searchOverlay.classList.remove('open');
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('open');
      searchOverlay.querySelector('input')?.focus();
    });
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });
    document.getElementById('searchClose')?.addEventListener('click', closeSearch);
  }

  // ---- mobile nav ----
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }

  // ---- watchlist toggle ----
  document.querySelectorAll('[data-toggle="save"]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-saved');
      const label = btn.querySelector('.save-label');
      if (label) label.textContent = btn.classList.contains('is-saved') ? 'Saved' : 'Watchlist';
    });
  });

  // ---- hero carousel (Home page) ----
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hc-slide'));
    const dots = Array.from(document.querySelectorAll('#hcDots .hc-dot'));
    const prevBtn = document.getElementById('hcPrev');
    const nextBtn = document.getElementById('hcNext');
    const AUTOPLAY_MS = 5000;
    let current = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    let autoplayTimer = null;

    function goTo(index) {
      const total = slides.length;
      const target = ((index % total) + total) % total;
      if (target === current) return;
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      dots[current]?.setAttribute('aria-selected', 'false');
      current = target;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      dots[current]?.setAttribute('aria-selected', 'true');
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function startAutoplay() { stopAutoplay(); autoplayTimer = setInterval(next, AUTOPLAY_MS); }
    function stopAutoplay() { if (autoplayTimer) clearInterval(autoplayTimer); autoplayTimer = null; }

    prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });
    dots.forEach(dot => dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.slide, 10)); startAutoplay(); }));
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
      if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });
    let touchStartX = 0, touchDeltaX = 0;
    carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchDeltaX = 0; stopAutoplay(); }, { passive: true });
    carousel.addEventListener('touchmove', (e) => { touchDeltaX = e.touches[0].clientX - touchStartX; }, { passive: true });
    carousel.addEventListener('touchend', () => {
      if (touchDeltaX < -40) next(); else if (touchDeltaX > 40) prev();
      startAutoplay();
    });
    startAutoplay();
  }
});
