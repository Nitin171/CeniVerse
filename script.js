// CeniVerse — shared front-end behaviour
document.addEventListener('DOMContentLoaded', () => {

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
  if (!feed) return; // only runs on the movie detail page

  const STORAGE_KEY = 'reviews:kaalayanam';
  const VOTES_KEY = 'votes:kaalayanam';

  const SEED_REVIEWS = [
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
  ];

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
