(() => {
  const body = document.body;
  const currentPage = body.dataset.page || '';

  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('.site-nav a[data-page]').forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('[data-faq-button]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) {
        return;
      }

      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((entry) => {
        entry.classList.remove('open');
      });

      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });
})();
