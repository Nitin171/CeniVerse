// ==========================================================================
// CeniVerse — movies.html controller
// Self-contained script for the merged multi-movie page. Deliberately does
// NOT load script.js: several behaviours below (tab switching, reviewer
// opinions) must be scoped per-movie instead of document-global, since this
// page embeds all 9 movies at once. Keeping this separate avoids any risk
// of the original single-movie script.js interfering.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile nav ----
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }

  // ---- Search overlay ----
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

  // ---- Bookmark / watchlist toggle buttons ----
  document.querySelectorAll('[data-toggle="save"]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-saved');
      const label = btn.querySelector('.save-label');
      if (label) label.textContent = btn.classList.contains('is-saved') ? 'Saved' : 'Watchlist';
    });
  });

  // ---- Rating meter fill-in animation (per movie page, runs once visible) ----
  const meterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.width = el.dataset.value + '%';
        meterObserver.unobserve(el);
      }
    });
  }, { threshold: .3 });
  document.querySelectorAll('.meter-fill').forEach(m => meterObserver.observe(m));

  // ==========================================================================
  // Movie switcher — shows exactly one .movie-page at a time
  // ==========================================================================
  const pages = Array.from(document.querySelectorAll('.movie-page'));
  const chips = Array.from(document.querySelectorAll('.mv-chip'));
  const switcher = document.getElementById('movieSwitcher');

  function showMovie(slug, opts) {
    opts = opts || { scroll: false };
    if (!pages.some(p => p.dataset.movieSlug === slug)) return;
    pages.forEach(p => {
      const match = p.dataset.movieSlug === slug;
      p.hidden = !match;
      p.classList.toggle('active', match);
    });
    chips.forEach(c => {
      const match = c.dataset.movie === slug;
      c.classList.toggle('active', match);
      c.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    if (history.replaceState) history.replaceState(null, '', '#' + slug);
    if (opts.scroll) switcher.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const shownPage = pages.find(p => p.dataset.movieSlug === slug);
    shownPage?.querySelectorAll('.meter-fill').forEach(m => {
      if (m.style.width === '' || m.style.width === '0%') meterObserver.observe(m);
    });
  }

  if (switcher) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => showMovie(chip.dataset.movie, { scroll: true }));
    });
    const initialSlug = (location.hash || '').replace('#', '');
    if (initialSlug && pages.some(p => p.dataset.movieSlug === initialSlug)) {
      showMovie(initialSlug, { scroll: false });
    }
  }

  // ==========================================================================
  // Per-movie tab switching (Overview / Review / Ratings / Cast & Crew / ...)
  // Scoped to each .movie-page so switching tabs on one movie never touches
  // another movie's tab state.
  // ==========================================================================
  pages.forEach(page => {
    const tabBtns = page.querySelectorAll('.tabbar button');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        page.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = page.querySelector('[data-tab-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
        const tabbar = page.querySelector('.tabbar');
        if (tabbar) window.scrollTo({ top: tabbar.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      });
    });

    // ---- trailer CTA scoped to this movie ----
    const trailerBtn = page.querySelector('[data-role="trailer-cta"]');
    const trailerTarget = page.querySelector('[data-role="trailer-target"]');
    if (trailerBtn) {
      trailerBtn.addEventListener('click', () => {
        if (trailerTarget) trailerTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  });

  // ==========================================================================
  // Reviewer Opinions system — one independent instance per movie page.
  // Storage keys match the standalone movie pages (reviews:<slug>), so a
  // review posted here also shows up on e.g. nizhal-kaalam.html, and vice
  // versa, since both read/write the same window.storage key.
  // ==========================================================================
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

  function initReviewSystem(page) {
    const feed = page.querySelector('[data-role="reviewer-feed"]');
    if (!feed) return;

    const SLUG = page.dataset.movieSlug || 'kaalayanam';
    const STORAGE_KEY = 'reviews:' + SLUG;
    const VOTES_KEY = 'votes:' + SLUG;
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
      catch (e) { /* degrade silently */ }
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
      const oldRects = {};
      feed.querySelectorAll('.review-card-full').forEach(card => {
        oldRects[card.dataset.id] = card.getBoundingClientRect();
      });

      sortReviews();
      const countLabel = page.querySelector('[data-role="review-count-label"]');
      if (countLabel) countLabel.textContent = reviews.length.toLocaleString('en-IN') + ' ratings';

      feed.innerHTML = reviews.map(r => {
        return '' +
        '<article class="review-card-full" data-id="' + r.id + '">' +
          '<div class="rcf-top">' +
            '<div class="rcf-avatar-wrap"><div class="ph-avatar" data-tone="' + r.tone + '">' + initials(r.name) + '</div></div>' +
            '<div class="rcf-meta">' +
              '<div class="rcf-name-row">' +
                '<span class="rcf-name">' + escapeHtml(r.name) + '</span>' +
                '<span class="rcf-role">' + escapeHtml(r.role) + '</span>' +
              '</div>' +
              '<div class="rcf-sub-row">' +
                '<span class="rcf-stars">' + '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) + '</span>' +
                '<span class="rcf-badge ' + r.verdict + '">' + verdictLabel(r.verdict) + '</span>' +
                '<span class="rcf-date">' + formatDate(r.date) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p class="rcf-text">' + escapeHtml(r.text) + '</p>' +
          '<div class="rcf-foot">' +
            '<button class="rcf-helpful ' + (votedIds.has(r.id) ? 'voted' : '') + '" data-id="' + r.id + '" aria-pressed="' + votedIds.has(r.id) + '">' +
              '<svg viewBox="0 0 24 24"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 5-8a2 2 0 0 1 3 2l-1 5h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H9"/></svg>' +
              'Helpful <span class="count">' + r.helpful + '</span>' +
            '</button>' +
          '</div>' +
        '</article>';
      }).join('');

      feed.querySelectorAll('.review-card-full').forEach(card => {
        const id = card.dataset.id;
        if (id === newestId) { card.classList.add('rcf-new'); return; }
        const oldRect = oldRects[id];
        if (!oldRect) return;
        const newRect = card.getBoundingClientRect();
        const dy = oldRect.top - newRect.top;
        if (Math.abs(dy) > 1) {
          card.style.transition = 'none';
          card.style.transform = 'translateY(' + dy + 'px)';
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

    // ---- write-a-review form (scoped to this movie page) ----
    const nameInput = page.querySelector('[data-role="review-name-input"]');
    const textInput = page.querySelector('[data-role="review-text-input"]');
    const starInput = page.querySelector('[data-role="star-input"]');
    const verdictChips = page.querySelector('[data-role="verdict-chips"]');
    const postBtn = page.querySelector('[data-role="post-review-btn"]');
    const postLabel = page.querySelector('[data-role="post-review-btn-label"]');
    const errorBox = page.querySelector('[data-role="review-error"]');
    const successBox = page.querySelector('[data-role="review-success"]');

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
          name: name, role: 'Verified Viewer',
          tone: Math.floor(Math.random() * 8) + 1,
          rating: selectedRating, verdict: selectedVerdict,
          date: new Date().toISOString(),
          text: text, helpful: 0
        };
        reviews.push(newReview);
        newestId = newReview.id;
        await saveReviews();
        renderReviews();

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

        const newCard = feed.querySelector('.review-card-full[data-id="' + newReview.id + '"]');
        if (newCard) newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    (async function init() {
      await loadReviews();
      await loadVotes();
      renderReviews();
    })();
  }

  pages.forEach(initReviewSystem);
});
