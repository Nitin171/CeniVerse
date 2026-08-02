// CeniVerse — shared front-end behaviour

/* ==========================================================================
   Dynamic movie page — movie.html only
   Reads ?id=<slug> from the URL, looks the movie up in MOVIES (movies.js),
   and renders the entire page from that single object. There is no
   per-movie HTML file — this is the only place a movie's markup gets built.
   Runs immediately (not on DOMContentLoaded) so that document.body's
   data-movie-slug and the rendered DOM both exist before the rest of this
   file (tabs, meters, reviewer opinions) runs further down.
   ========================================================================== */
(function () {
  const isMoviePage = !!document.getElementById('detailBackdrop');
  if (!isMoviePage) return;

  const LANG_CODES = { Telugu:'te', Tamil:'ta', Hindi:'hi', Malayalam:'ml', Kannada:'kn', Marathi:'mr', Bengali:'bn', Punjabi:'pa' };

  function scoreColor(pct){
    if (pct >= 70) return 'var(--success)';
    if (pct >= 50) return 'var(--accent-2)';
    return 'var(--accent)';
  }

  function pill(html){ return `<span class="pill">${html}</span>`; }

  function buildFacts(m){
    const parts = m.genres.map(g => pill(g));
    parts.push(pill(`<strong>${m.runtime}</strong>`));
    parts.push(pill(m.language));
    parts.push(pill(m.releaseDate));
    if (m.certification) parts.push(pill(m.certification));
    parts.push(pill(m.statusLabel));
    return parts.join('');
  }

  function buildRatingRow(m){
    let html = `
      <div class="rating-badge">
        <div class="num">${m.ceniverseScore}<small>/10</small></div>
        <div class="lbl"><b>CeniVerse Score</b>Critic + Editorial</div>
      </div>
      <div class="rating-badge">
        <div class="num" style="color:${scoreColor(m.audienceScore)};">${m.audienceScore}<small>%</small></div>
        <div class="lbl"><b>Audience Verdict</b>${m.audienceCount} ratings</div>
      </div>`;
    if (m.thirdBadge){
      html += `
      <div class="rating-badge">
        <div class="num" style="color:var(--text-primary);font-size:${m.thirdBadge.valueSize}px;">${m.thirdBadge.value}</div>
        <div class="lbl"><b>${m.thirdBadge.label}</b>${m.thirdBadge.sub}</div>
      </div>`;
    }
    return html;
  }

  function buildList(items){
    return items.map(i => `<li>${i}</li>`).join('');
  }

  function buildReviewParagraphs(review){
    return Object.entries(review).map(([heading, text]) => `<h3>${heading}</h3><p>${text}</p>`).join('');
  }

  function buildMeters(ratingsEntries){
    return ratingsEntries.map(([label, value]) => `
      <div class="meter-row">
        <span class="m-label">${label}</span>
        <div class="meter-track"><div class="meter-fill" data-value="${Math.round(value * 10)}"></div></div>
        <span class="meter-val">${value.toFixed(1)}</span>
      </div>`).join('');
  }

  function buildCast(cast){
    return cast.map(c => `
      <div class="cast-item">
        <div class="cast-photo ph-avatar" data-tone="${c.tone}">${c.initials}</div>
        <div class="c-name">${c.name}</div>
        <div class="c-role">${c.role}</div>
      </div>`).join('');
  }

  function buildCrewLike(items, roleKey, nameKey){
    return items.map(i => `
      <div class="crew-item">
        <div class="cr-role">${i[roleKey]}</div>
        <div class="cr-name">${i[nameKey]}</div>
      </div>`).join('');
  }

  function buildTimeline(timeline){
    return timeline.map(t => `
      <div class="timeline-item">
        <div class="t-date">${t.date}</div>
        <div class="t-desc">${t.desc}</div>
      </div>`).join('');
  }

  function buildFaqs(faqs){
    return faqs.map((f, i) => `
      <details class="faq-item"${i === 0 ? ' open' : ''}>
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`).join('');
  }

  function buildMovieCardLink(id, scoreLabel){
    const other = MOVIES[id];
    if (!other) return '';
    return `
      <a href="movie.html?id=${id}" class="m-card">
        <div class="m-poster ph-poster" data-tone="${other.posterTone}"><div class="m-score">★ ${other.overall}</div></div>
        <div class="m-title">${other.title}</div>
      </a>`;
  }

  function buildGallery(tones){
    return tones.map(t => `<div class="ph-poster" data-tone="${t}" style="aspect-ratio:16/10;border-radius:6px;"></div>`).join('');
  }

  function sidebarVerdictHeadline(m){
    const label = m.status === 'streaming' ? `Stream it on ${m.ottPlatform}` : 'Watch it in theatres';
    const skipLabel = m.status === 'streaming' ? `Skip it` : `Skip it`;
    if (m.verdictWord === 'yes') return `YES — ${label}`;
    if (m.verdictWord === 'wait') return `WAIT — Catch it on ${m.ottPlatform || 'OTT'}`;
    return `NO — ${skipLabel}`;
  }

  function buildWhereToWatchRows(m){
    let rows = (m.whereToWatch || []).map(r => `
      <div class="info-row"><span class="k">${r.label}</span><span class="v"${/now showing/i.test(r.value) ? ' style="color:var(--success);"' : ''}>${r.value}</span></div>`);
    const dateMatch = /from (.+)$/i.exec(m.ctaNote || '');
    rows.push(`<div class="info-row"><span class="k">${m.ottPlatform}</span><span class="v">${dateMatch ? 'From ' + dateMatch[1] : (m.ctaNote || '—')}</span></div>`);
    return rows.join('');
  }

  function buildSidebarInfo(m){
    const rows = [
      ['Release Date', m.releaseDate],
      ['Runtime', m.runtime],
      ['Language', m.language],
      ['Genres', m.genres.join(', ')],
      ['Certification', m.certification || '—'],
      ['Budget', m.budget || '—'],
    ];
    if (m.status === 'streaming') rows.push(['OTT Platform', m.ottPlatform]);
    else rows.push(['Worldwide Collection', m.worldwideCollection || '—'], ['OTT Platform', m.ottPlatform]);
    rows.push(['Production', m.productionCompany]);
    return rows.map(([k, v]) => `<div class="info-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');
  }

  function set(id, value){
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  function setHtml(id, html){
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function renderMoviePage(m){
    document.title = `${m.title} Movie Review — Story, Rating, Cast & Verdict | CeniVerse`;
    const metaEl = document.getElementById('metaDescription');
    if (metaEl) metaEl.setAttribute('content', m.metaDescription);

    const schemaEl = document.getElementById('movieSchema');
    if (schemaEl){
      let isoDate = '';
      const parsed = new Date(m.releaseDate);
      if (!isNaN(parsed)) isoDate = parsed.toISOString().slice(0, 10);
      schemaEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: m.title,
        genre: m.genres,
        datePublished: isoDate,
        inLanguage: LANG_CODES[m.language] || '',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: String(m.ceniverseScore),
          bestRating: '10',
          ratingCount: String(m.audienceCount).replace(/,/g, '')
        }
      });
    }

    // ---- hero ----
    const backdrop = document.getElementById('detailBackdrop');
    if (backdrop) backdrop.dataset.tone = m.backdropTone;
    const poster = document.getElementById('detailPoster');
    if (poster) poster.dataset.tone = m.posterTone;
    set('posterGlyph', m.glyph);
    set('posterTitle', m.title);
    set('posterIndustry', `${m.language} · ${m.year}`);

    const breadcrumbLang = document.getElementById('breadcrumbLang');
    if (breadcrumbLang) breadcrumbLang.textContent = m.breadcrumbLanguage;
    set('breadcrumbTitle', `${m.title} (${m.year})`);

    set('detailTitle', m.title);
    set('detailTagline', `"${m.tagline}"`);
    setHtml('detailFacts', buildFacts(m));
    setHtml('heroRatingRow', buildRatingRow(m));
    set('ctaNote', m.ctaNote);

    const trailerEmbed = document.getElementById('trailerCta2');
    if (trailerEmbed) trailerEmbed.dataset.tone = m.backdropTone;

    // ---- overview tab ----
    const verdictWordEl = document.getElementById('verdictWord');
    if (verdictWordEl){
      verdictWordEl.textContent = m.verdictWord.toUpperCase();
      verdictWordEl.className = 'vb-word ' + m.verdictWord;
    }
    set('verdictReason', m.verdictReason);
    setHtml('whoWatchList', buildList(m.whoShouldWatch));
    setHtml('whoSkipList', buildList(m.whoMaySkip));
    set('synopsisText', m.synopsis);
    setHtml('interestingFactsList', buildList(m.interestingFacts));

    // ---- review tab ----
    setHtml('reviewParagraphs', buildReviewParagraphs(m.review));
    setHtml('positivesList', buildList(m.positives));
    setHtml('negativesList', buildList(m.negatives));
    set('finalVerdictText', m.finalVerdict);

    // ---- ratings tab ----
    const ratingEntries = Object.entries(m.ratings);
    const half = Math.ceil(ratingEntries.length / 2);
    setHtml('ratingsColLeft', buildMeters(ratingEntries.slice(0, half)));
    setHtml('ratingsColRight', buildMeters(ratingEntries.slice(half)));
    const overallEl = document.getElementById('overallRatingNum');
    if (overallEl) overallEl.innerHTML = `${m.overall}<small>/10</small>`;

    // ---- cast & crew tab ----
    setHtml('castGrid', buildCast(m.cast));
    setHtml('crewGrid', buildCrewLike(m.crew, 'role', 'name'));

    // ---- more info tab ----
    set('productionTrivia', m.productionTrivia);
    setHtml('soundtrackGrid', buildCrewLike(m.soundtrack, 'label', 'name'));
    setHtml('timelineList', buildTimeline(m.timeline));
    setHtml('faqsList', buildFaqs(m.faqs));
    setHtml('similarMoviesGrid', m.similarMovies.map(id => buildMovieCardLink(id)).join(''));

    // ---- gallery tab ----
    setHtml('galleryGrid', buildGallery(m.galleryTones));
    setHtml('awardsGrid', buildCrewLike(m.awards, 'title', 'name'));

    // ---- sidebar ----
    setHtml('sidebarMovieInfo', buildSidebarInfo(m));
    const sidebarVerdictEl = document.getElementById('sidebarVerdictWord');
    if (sidebarVerdictEl){
      sidebarVerdictEl.textContent = sidebarVerdictHeadline(m);
      sidebarVerdictEl.className = 'vb-word ' + m.verdictWord;
    }
    set('sidebarQuickNote', m.quickVerdictNote);
    setHtml('whereToWatchRows', buildWhereToWatchRows(m));
    setHtml('alsoLikeList', (m.youMayAlsoLike || []).map(id => {
      const other = MOVIES[id];
      if (!other) return '';
      return `
        <a href="movie.html?id=${id}" style="display:flex;gap:10px;align-items:center;">
          <div style="width:44px;height:64px;border-radius:4px;overflow:hidden;flex-shrink:0;" class="ph-poster" data-tone="${other.posterTone}"></div>
          <div><div style="font-size:13px;font-weight:600;">${other.title}</div><div style="font-size:11.5px;color:var(--text-muted);font-family:var(--font-mono);">${other.overall} / 10</div></div>
        </a>`;
    }).join(''));
  }

  function renderMovieNotFound(requestedId){
    const container = document.querySelector('.detail-hero-inner');
    if (container){
      container.innerHTML = `
        <div></div>
        <div style="padding:40px 0;">
          <span class="eyebrow"><span class="dot"></span>Not found</span>
          <h1 class="detail-title" style="margin-top:8px;">We couldn't find "${requestedId}"</h1>
          <p style="color:var(--text-secondary);font-size:14.5px;margin-top:14px;max-width:520px;">That movie isn't in our library yet. Head back to the homepage to browse everything CeniVerse has reviewed.</p>
          <a href="index.html" class="btn btn-accent" style="margin-top:24px;">Back to Home</a>
        </div>`;
    }
    document.querySelectorAll('.tabbar, .block').forEach(el => {
      if (!el.closest('.detail-hero')) el.style.display = 'none';
    });
  }

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id') || 'kaalayanam';
  const movie = (typeof MOVIES !== 'undefined' && MOVIES[requestedId]) ? MOVIES[requestedId] : null;

  if (movie){
    document.body.dataset.movieSlug = movie.id;
    window.CENIVERSE_MOVIE = movie;
    renderMoviePage(movie);
  } else {
    document.body.dataset.movieSlug = 'not-found';
    renderMovieNotFound(requestedId);
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // ---- "Read Full Review" hero button jumps to the Review tab ----
  const readFullReviewBtn = document.getElementById('readFullReviewBtn');
  if (readFullReviewBtn){
    readFullReviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.tabbar button[data-tab="review"]')?.click();
    });
  }

  // ---- Language ranking tabs (Home page) ----
  const langTabs = document.querySelectorAll('.lang-tab');
  if (langTabs.length){
    langTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.lang;
        document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lang-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + target).classList.add('active');
      });
    });
  }

  // ---- Movie detail page tabs ----
  const tabBtns = document.querySelectorAll('.tabbar button');
  if (tabBtns.length){
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + target).classList.add('active');
        window.scrollTo({top: document.querySelector('.tabbar').offsetTop - 90, behavior:'smooth'});
      });
    });
  }

  // ---- Animate rating meters when they scroll into view ----
  const meters = document.querySelectorAll('.meter-fill');
  if (meters.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const el = entry.target;
          el.style.width = el.dataset.value + '%';
          io.unobserve(el);
        }
      });
    }, {threshold:.3});
    meters.forEach(m => io.observe(m));
  }

  // ---- Search overlay ----
  const searchBtn = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchBtn && searchOverlay){
    const closeSearch = () => searchOverlay.classList.remove('open');
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('open');
      searchOverlay.querySelector('input').focus();
    });
    searchOverlay.addEventListener('click', (e) => { if(e.target === searchOverlay) closeSearch(); });
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeSearch(); });
    const closeBtn = document.getElementById('searchClose');
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  }

  // ---- Mobile nav ----
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (mobileToggle && mobileNav){
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  // ---- Bookmark / watchlist toggle buttons ----
  document.querySelectorAll('[data-toggle="save"]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-saved');
      const label = btn.querySelector('.save-label');
      if (label) label.textContent = btn.classList.contains('is-saved') ? 'Saved' : 'Watchlist';
    });
  });

  // ---- Hero carousel ----
  const carousel = document.getElementById('heroCarousel');
  if (carousel){
    const slides = Array.from(carousel.querySelectorAll('.hc-slide'));
    const dots = Array.from(document.querySelectorAll('#hcDots .hc-dot'));
    const prevBtn = document.getElementById('hcPrev');
    const nextBtn = document.getElementById('hcNext');
    const AUTOPLAY_MS = 5000;
    let current = slides.findIndex(s => s.classList.contains('active'));
    if (current < 0) current = 0;
    let autoplayTimer = null;

    function goTo(index){
      const total = slides.length;
      const target = ((index % total) + total) % total; // wraps both directions — infinite loop
      if (target === current) return;
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      dots[current]?.setAttribute('aria-selected', 'false');
      current = target;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      dots[current]?.setAttribute('aria-selected', 'true');
    }

    function next(){ goTo(current + 1); }
    function prev(){ goTo(current - 1); }

    function startAutoplay(){
      stopAutoplay();
      autoplayTimer = setInterval(next, AUTOPLAY_MS);
    }
    function stopAutoplay(){
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.slide, 10));
        startAutoplay();
      });
    });

    // pause on hover, resume on mouse leave
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // keyboard support — left/right arrows (ignored while typing in a field)
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft'){ prev(); startAutoplay(); }
      if (e.key === 'ArrowRight'){ next(); startAutoplay(); }
    });

    // touch swipe support
    let touchStartX = 0;
    let touchDeltaX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
      stopAutoplay();
    }, {passive:true});
    carousel.addEventListener('touchmove', (e) => {
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, {passive:true});
    carousel.addEventListener('touchend', () => {
      if (touchDeltaX < -40) next();
      else if (touchDeltaX > 40) prev();
      startAutoplay();
    });

    startAutoplay();
  }

});

/* ==========================================================================
   CeniVerse — Reviewer Opinions system (movie.html only)

   Note on storage: raw localStorage does not work inside Claude.ai's
   artifact sandbox, so this uses Claude's artifact-persistence API
   (window.storage) instead — reviews and helpful-vote counts are stored
   "shared" so every visitor to this artifact sees the same review feed,
   while each visitor's own "have I voted" record is stored personally
   so they can't double-vote. If you take this file outside Claude.ai to
   host it yourself, swap loadReviews/saveReviews/loadVotes/saveVotes for
   a real backend (or localStorage) — window.storage only exists here.
   ========================================================================== */
(function () {
  const feed = document.getElementById('reviewerFeed');
  if (!feed) return; // only runs on movie detail pages

  const SLUG = document.body.dataset.movieSlug || 'kaalayanam';
  const STORAGE_KEY = 'reviews:' + SLUG;
  const VOTES_KEY = 'votes:' + SLUG;

  const SEEDS_BY_SLUG = {
    'kaalayanam': [
      { id: 'seed-1', name: 'Meera Pillai', role: 'CeniVerse Critic', tone: 5, rating: 5, verdict: 'love',
        date: '2026-07-24T00:00:00.000Z',
        text: "Loved it. The restraint in the writing is the whole point — this is a film confident enough to let silence do the work. My only complaint is a saggy middle stretch, but the final act more than makes up for it.",
        helpful: 212 },
      { id: 'seed-2', name: 'Nitin Manikonda', role: 'Verified Viewer', tone: 8, rating: 5, verdict: 'love',
        date: '2026-07-25T00:00:00.000Z',
        text: "This movie surprised me with its emotional depth. The screenplay remained engaging throughout, and the performances were outstanding. Definitely worth watching in theatres.",
        helpful: 145 },
      { id: 'seed-3', name: 'Ananya S.', role: 'Verified Viewer', tone: 2, rating: 4, verdict: 'love',
        date: '2026-07-29T00:00:00.000Z',
        text: "Loved it, mostly. The background score genuinely elevated scenes that would've felt flat otherwise. Agree with the review on the pacing though — I felt it drag around the hour-forty mark.",
        helpful: 89 },
      { id: 'seed-4', name: 'Rahul K.', role: 'Verified Viewer', tone: 7, rating: 4, verdict: 'okay',
        date: '2026-07-28T00:00:00.000Z',
        text: 'Watched it purely for the lead\'s performance and it delivered. One honest gripe: wouldn\'t call it an "action" film the way the trailers suggested — set your expectations accordingly and you\'ll enjoy it a lot more.',
        helpful: 54 },
      { id: 'seed-5', name: 'Divya K.', role: 'Verified Viewer', tone: 6, rating: 5, verdict: 'love',
        date: '2026-07-27T00:00:00.000Z',
        text: "One of the better theatre experiences I've had this year. The sound design alone is worth the ticket. Loved it front to back.",
        helpful: 31 },
      { id: 'seed-6', name: 'Vikram N.', role: 'Verified Viewer', tone: 3, rating: 2, verdict: 'skip',
        date: '2026-07-26T00:00:00.000Z',
        text: "Didn't work for me. I understand the intent behind the slow pacing, but at 2h 42m it tested my patience more than once, and the brother subplot goes nowhere. Strong performances, but I'd wait for OTT.",
        helpful: 12 }
    ],
    'nizhal-kaalam': [
      { id: 'seed-1', name: 'Anoop Varkey', role: 'CeniVerse Critic', tone: 2, rating: 5, verdict: 'love',
        date: '2026-07-04T00:00:00.000Z',
        text: "Rare to see a procedural this confident in its own silences. No hand-holding, no over-explained twist — just tight, patient filmmaking. One of the year's best thrillers.",
        helpful: 188 },
      { id: 'seed-2', name: 'Sneha Thomas', role: 'Verified Viewer', tone: 6, rating: 5, verdict: 'love',
        date: '2026-07-05T00:00:00.000Z',
        text: "Watched it not knowing what to expect and was floored. The interrogation scenes alone are worth the ticket price. Barely any background score and it still had me tense throughout.",
        helpful: 121 },
      { id: 'seed-3', name: 'Kiran Balan', role: 'Verified Viewer', tone: 4, rating: 4, verdict: 'love',
        date: '2026-07-06T00:00:00.000Z',
        text: "Genuinely one of the tightest scripts I've seen in a while. Only wish the female lead had more screen time — she's excellent in the little she gets.",
        helpful: 76 },
      { id: 'seed-4', name: 'Rohit S.', role: 'Verified Viewer', tone: 8, rating: 3, verdict: 'okay',
        date: '2026-07-07T00:00:00.000Z',
        text: "Well made, but a little emotionally cold for my taste. Admired it more than I enjoyed it, if that makes sense.",
        helpful: 39 }
    ],
    'veyyil': [
      { id: 'seed-1', name: 'Kavitha Raman', role: 'CeniVerse Critic', tone: 1, rating: 5, verdict: 'love',
        date: '2026-07-11T00:00:00.000Z',
        text: "The last thirty minutes destroyed me in the best way. Patient, unhurried filmmaking that trusts silence over dialogue — exactly the kind of family drama we don't get enough of anymore.",
        helpful: 164 },
      { id: 'seed-2', name: 'Bala Murugan', role: 'Verified Viewer', tone: 5, rating: 4, verdict: 'love',
        date: '2026-07-12T00:00:00.000Z',
        text: "Took my parents and we all cried at the same scene. That's rare. First half drags a bit but stick with it.",
        helpful: 98 },
      { id: 'seed-3', name: 'Priya D.', role: 'Verified Viewer', tone: 3, rating: 3, verdict: 'okay',
        date: '2026-07-13T00:00:00.000Z',
        text: "Beautifully shot, but I found the pace genuinely slow, not just deliberately slow. Your mileage will vary depending on how patient you are.",
        helpful: 42 }
    ],
    'prathidhwani': [
      { id: 'seed-1', name: 'Harika N.', role: 'CeniVerse Critic', tone: 6, rating: 5, verdict: 'love',
        date: '2024-03-15T00:00:00.000Z',
        text: "Still thinking about this one two years later. Emotionally precise in a way most films aren't brave enough to attempt — every scene earns the one after it.",
        helpful: 301 },
      { id: 'seed-2', name: 'Satya P.', role: 'Verified Viewer', tone: 2, rating: 5, verdict: 'love',
        date: '2024-03-16T00:00:00.000Z',
        text: "Rewatched this recently and it holds up completely. A genuinely underrated film that deserved a bigger release.",
        helpful: 210 }
    ],
    'kadal-meen': [
      { id: 'seed-1', name: 'Dinesh Kumaran', role: 'CeniVerse Critic', tone: 8, rating: 5, verdict: 'love',
        date: '2026-06-20T00:00:00.000Z',
        text: "A coastal crime drama with actual teeth. The OTT format hasn't dulled the ambition here at all — sharp writing, sharper performances.",
        helpful: 176 },
      { id: 'seed-2', name: 'Aishwarya V.', role: 'Verified Viewer', tone: 4, rating: 4, verdict: 'love',
        date: '2026-06-21T00:00:00.000Z',
        text: "Binged it in one sitting. The lead's performance in the second half is something else.",
        helpful: 94 },
      { id: 'seed-3', name: 'Karthik R.', role: 'Verified Viewer', tone: 7, rating: 4, verdict: 'okay',
        date: '2026-06-22T00:00:00.000Z',
        text: "Strong first half, the resolution felt slightly rushed. Still very much worth your time.",
        helpful: 47 }
    ],
    'dilkash': [
      { id: 'seed-1', name: 'Neha Kapoor', role: 'CeniVerse Critic', tone: 2, rating: 3, verdict: 'okay',
        date: '2026-07-18T00:00:00.000Z',
        text: "Pleasant enough for a Sunday watch. The chemistry between the leads carries scenes the script doesn't earn on its own.",
        helpful: 88 },
      { id: 'seed-2', name: 'Aditya M.', role: 'Verified Viewer', tone: 6, rating: 3, verdict: 'okay',
        date: '2026-07-19T00:00:00.000Z',
        text: "Cute, forgettable. Fine for OTT, wouldn't have paid theatre prices for it honestly.",
        helpful: 51 },
      { id: 'seed-3', name: 'Simran K.', role: 'Verified Viewer', tone: 4, rating: 2, verdict: 'skip',
        date: '2026-07-20T00:00:00.000Z',
        text: "Too many convenient coincidences for me to take the central conflict seriously. Waited for OTT and that felt like the right call.",
        helpful: 33 }
    ],
    'kaadu-kanasu': [
      { id: 'seed-1', name: 'Manjunath G.', role: 'CeniVerse Critic', tone: 7, rating: 4, verdict: 'love',
        date: '2026-06-27T00:00:00.000Z',
        text: "Refreshing to see an adventure film that cares about its people as much as its landscapes. Grounded where the trailers suggested spectacle, and better for it.",
        helpful: 102 },
      { id: 'seed-2', name: 'Deepa Hegde', role: 'Verified Viewer', tone: 3, rating: 4, verdict: 'love',
        date: '2026-06-28T00:00:00.000Z',
        text: "Took the whole family, everyone enjoyed it. Visually stunning without ever feeling like a travel ad.",
        helpful: 67 }
    ],
    'ottamuri': [
      { id: 'seed-1', name: 'Reshma Nair', role: 'CeniVerse Critic', tone: 4, rating: 4, verdict: 'love',
        date: '2026-05-23T00:00:00.000Z',
        text: "Small in scale, big in feeling. A quiet character study that rewards patience — exactly the kind of film that gets overlooked in a crowded OTT release week.",
        helpful: 84 },
      { id: 'seed-2', name: 'Vinod C.', role: 'Verified Viewer', tone: 8, rating: 4, verdict: 'love',
        date: '2026-05-24T00:00:00.000Z',
        text: "Almost skipped this one, glad I didn't. The lead performance is doing a lot of quiet, unshowy work.",
        helpful: 45 }
    ],
    'shehar-ka-shor': [
      { id: 'seed-1', name: 'Tarun Bhatia', role: 'CeniVerse Critic', tone: 3, rating: 2, verdict: 'skip',
        date: '2026-07-04T00:00:00.000Z',
        text: "Loud where it should be sharp. A few individual gags land, but the film mistakes volume and pace for actual wit.",
        helpful: 58 },
      { id: 'seed-2', name: 'Priyanka J.', role: 'Verified Viewer', tone: 5, rating: 2, verdict: 'skip',
        date: '2026-07-05T00:00:00.000Z',
        text: "Wanted to like this more than I did. Felt like the same joke repeated for two hours.",
        helpful: 29 },
      { id: 'seed-3', name: 'Manish T.', role: 'Verified Viewer', tone: 7, rating: 3, verdict: 'okay',
        date: '2026-07-06T00:00:00.000Z',
        text: "Not as bad as I'd been told, but definitely a wait-for-OTT rather than a theatre watch.",
        helpful: 21 }
    ]
  };

  const SEED_REVIEWS = SEEDS_BY_SLUG[SLUG] || SEEDS_BY_SLUG['kaalayanam'];

  let reviews = [];
  let votedIds = new Set();
  let newestId = null;

  const hasStorage = () => typeof window.storage !== 'undefined' && window.storage;

  async function loadReviews() {
    if (hasStorage()) {
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        reviews = res && res.value ? JSON.parse(res.value) : SEED_REVIEWS.slice();
        return;
      } catch (e) { /* key not found yet, or storage unavailable */ }
    }
    reviews = SEED_REVIEWS.slice();
  }

  async function saveReviews() {
    if (!hasStorage()) return;
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(reviews), true); }
    catch (e) { /* degrade silently — feed still works in-memory this session */ }
  }

  async function loadVotes() {
    if (hasStorage()) {
      try {
        const res = await window.storage.get(VOTES_KEY, false);
        votedIds = new Set(res && res.value ? JSON.parse(res.value) : []);
        return;
      } catch (e) { /* no votes recorded yet */ }
    }
    votedIds = new Set();
  }

  async function saveVotes() {
    if (!hasStorage()) return;
    try { await window.storage.set(VOTES_KEY, JSON.stringify([...votedIds]), false); }
    catch (e) { /* degrade silently */ }
  }

  function initials(name) {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function verdictLabel(v) {
    return v === 'love' ? 'Loved It' : v === 'okay' ? 'It Was Okay' : "Didn't Like It";
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function sortReviews() {
    reviews.sort((a, b) => (b.helpful - a.helpful) || (new Date(b.date) - new Date(a.date)));
  }

  function renderReviews() {
    // FLIP step 1 — capture current positions before reordering
    const oldRects = {};
    feed.querySelectorAll('.review-card-full').forEach(card => {
      oldRects[card.dataset.id] = card.getBoundingClientRect();
    });

    sortReviews();
    const countLabel = document.getElementById('reviewCountLabel');
    if (countLabel) countLabel.textContent = reviews.length.toLocaleString('en-IN') + ' ratings';

    feed.innerHTML = reviews.map(r => `
      <article class="review-card-full" data-id="${r.id}">
        <div class="rcf-top">
          <div class="rcf-avatar-wrap"><div class="ph-avatar" data-tone="${r.tone}">${initials(r.name)}</div></div>
          <div class="rcf-meta">
            <div class="rcf-name-row">
              <span class="rcf-name">${escapeHtml(r.name)}</span>
              <span class="rcf-role">${escapeHtml(r.role)}</span>
            </div>
            <div class="rcf-sub-row">
              <span class="rcf-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
              <span class="rcf-badge ${r.verdict}">${verdictLabel(r.verdict)}</span>
              <span class="rcf-date">${formatDate(r.date)}</span>
            </div>
          </div>
        </div>
        <p class="rcf-text">${escapeHtml(r.text)}</p>
        <div class="rcf-foot">
          <button class="rcf-helpful ${votedIds.has(r.id) ? 'voted' : ''}" data-id="${r.id}" aria-pressed="${votedIds.has(r.id)}">
            <svg viewBox="0 0 24 24"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 5-8a2 2 0 0 1 3 2l-1 5h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H9"/></svg>
            Helpful <span class="count">${r.helpful}</span>
          </button>
        </div>
      </article>
    `).join('');

    // FLIP step 2 — invert & play (smooth slide as the list reorders)
    feed.querySelectorAll('.review-card-full').forEach(card => {
      const id = card.dataset.id;
      if (id === newestId) { card.classList.add('rcf-new'); return; }
      const oldRect = oldRects[id];
      if (!oldRect) return;
      const newRect = card.getBoundingClientRect();
      const dy = oldRect.top - newRect.top;
      if (Math.abs(dy) > 1) {
        card.style.transition = 'none';
        card.style.transform = `translateY(${dy}px)`;
        requestAnimationFrame(() => {
          card.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
          card.style.transform = '';
        });
      }
    });
    newestId = null;

    feed.querySelectorAll('.rcf-helpful').forEach(btn => {
      btn.addEventListener('click', () => toggleHelpful(btn.dataset.id));
    });
  }

  async function toggleHelpful(id) {
    const review = reviews.find(r => r.id === id);
    if (!review) return;
    if (votedIds.has(id)) {
      votedIds.delete(id);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      votedIds.add(id);
      review.helpful += 1;
    }
    await saveVotes();
    await saveReviews();
    renderReviews();
  }

  // ---- write-a-review form ----
  const nameInput = document.getElementById('reviewName');
  const textInput = document.getElementById('reviewText');
  const starInput = document.getElementById('starInput');
  const verdictChips = document.getElementById('verdictChips');
  const postBtn = document.getElementById('postReviewBtn');
  const postLabel = document.getElementById('postReviewBtnLabel');
  const errorBox = document.getElementById('reviewError');
  const successBox = document.getElementById('reviewSuccess');

  let selectedRating = 0;
  let selectedVerdict = null;

  if (starInput) {
    starInput.querySelectorAll('span').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.star);
        starInput.querySelectorAll('span').forEach(s => s.classList.toggle('active', parseInt(s.dataset.star) <= selectedRating));
        starInput.classList.remove('invalid');
      });
    });
  }

  if (verdictChips) {
    verdictChips.querySelectorAll('.wr-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedVerdict = chip.dataset.verdict;
        verdictChips.querySelectorAll('.wr-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        verdictChips.classList.remove('invalid');
      });
    });
  }

  function showError(msg, field) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    successBox.hidden = true;
    if (field) {
      field.classList.add('invalid', 'shake');
      setTimeout(() => field.classList.remove('shake'), 500);
    }
  }

  if (postBtn) {
    postBtn.addEventListener('click', async () => {
      errorBox.hidden = true;
      successBox.hidden = true;

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name) { showError('Please tell us your name.', nameInput); nameInput.focus(); return; }
      if (!selectedRating) { showError('Please select a star rating.', starInput); return; }
      if (!selectedVerdict) { showError('Please choose a verdict.', verdictChips); return; }
      if (text.length < 10) { showError('Your review is a little short — tell us a bit more.', textInput); textInput.focus(); return; }

      postBtn.disabled = true;
      postLabel.textContent = 'Posting…';

      const newReview = {
        id: 'user-' + Date.now(),
        name, role: 'Verified Viewer',
        tone: Math.floor(Math.random() * 8) + 1,
        rating: selectedRating, verdict: selectedVerdict,
        date: new Date().toISOString(),
        text, helpful: 0
      };
      reviews.push(newReview);
      newestId = newReview.id;
      await saveReviews();
      renderReviews();

      // clear the form
      nameInput.value = '';
      textInput.value = '';
      selectedRating = 0; selectedVerdict = null;
      starInput.querySelectorAll('span').forEach(s => s.classList.remove('active'));
      verdictChips.querySelectorAll('.wr-chip').forEach(c => c.classList.remove('selected'));
      [nameInput, textInput, starInput, verdictChips].forEach(el => el.classList.remove('invalid'));

      postBtn.disabled = false;
      postLabel.textContent = 'Post Review';
      successBox.hidden = false;
      setTimeout(() => { successBox.hidden = true; }, 4000);

      document.querySelector(`.review-card-full[data-id="${newReview.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  (async function init() {
    await loadReviews();
    await loadVotes();
    renderReviews();
  })();
})();
