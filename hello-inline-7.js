
//<![CDATA[
(function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;
  const currentURL = window.location.href;

  function clearActiveStates() { navLinks.forEach(link => link.classList.remove('active')); }

  function setActiveFromURL() {
    clearActiveStates();
    const qp = new URLSearchParams(window.location.search);
    if (qp.has('language')) {
      const el = document.getElementById('languageBtn'); if(el) el.classList.add('active');
    }
    else if (currentPath === '/' || currentPath === '' || currentPath === '/index.html') {
      const homeLink = document.querySelector('[data-page="home"]');
      if(homeLink) homeLink.classList.add('active');
    }
    else if ((currentPath || '').toLowerCase().includes('ongoing')) { const el = document.querySelector('[data-page="series"]'); if(el) el.classList.add('active'); }
    else if ((currentPath || '').toLowerCase().includes('movie')) { const el = document.querySelector('[data-page="movie"]'); if(el) el.classList.add('active'); }
    else if (currentURL.includes('Subbed') || currentURL.includes('Dubbed') || currentURL.includes('ORG')) { 
      const el = document.getElementById('languageBtn'); if(el) el.classList.add('active'); 
    }
  }

  setActiveFromURL();

  document.getElementById('languageBtn').addEventListener('click', function() {
    document.getElementById('languagePopup').classList.add('active');
  });

  window.closePopup = function(popupId) {
    document.getElementById(popupId).classList.remove('active');
  };

  let lastScrollTop = 0;
  const bottomNav = document.querySelector('.bottom-nav');
  window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      bottomNav.classList.add('hidden');
    } else {
      bottomNav.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, { passive: true });

  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('active');
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.popup-overlay').forEach(popup => popup.classList.remove('active'));
    }
  });
})();
//]]>
