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

  // ---- Write-a-review: star input ----
  const starInput = document.getElementById('starInput');
  if (starInput){
    const stars = starInput.querySelectorAll('span');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.star);
        stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.star) <= val));
      });
    });
  }

  // ---- Write-a-review: verdict chip selection ----
  const verdictChips = document.getElementById('verdictChips');
  if (verdictChips){
    verdictChips.querySelectorAll('.wr-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        verdictChips.querySelectorAll('.wr-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });
  }

  // ---- Comment reactions ----
  document.querySelectorAll('.comment-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = btn.querySelector('.count');
      if (!n) return;
      const active = btn.classList.toggle('is-active');
      n.textContent = parseInt(n.textContent) + (active ? 1 : -1);
    });
  });
});
