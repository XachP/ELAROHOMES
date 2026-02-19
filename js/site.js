const ready = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

ready(() => {
  const forms = document.querySelectorAll('form[action*="formspree.io"]');
  if (!forms.length) return;

  forms.forEach((form) => {
    const done = form.parentElement?.querySelector('.w-form-done');
    const fail = form.parentElement?.querySelector('.w-form-fail');

    // Ensure a clean default state even if base CSS fails to load.
    if (done) done.style.display = 'none';
    if (fail) fail.style.display = 'none';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.style.display = 'none';
          if (done) done.style.display = 'block';
          if (fail) fail.style.display = 'none';
        } else {
          if (fail) fail.style.display = 'block';
        }
      } catch (err) {
        if (fail) fail.style.display = 'block';
      }
    });
  });
});

ready(() => {
  const navbars = Array.from(document.querySelectorAll('.navbar-59'));
  if (!navbars.length) return;

  let lastY = window.pageYOffset || 0;
  let ticking = false;
  const hideAfter = 64;
  const minDelta = 6;

  const navIsOpen = (navbar) => {
    return Boolean(
      navbar.querySelector('.menu-button-6.w--open') ||
      navbar.querySelector('.nav-menu-7.w--open')
    );
  };

  const syncNavOpenState = () => {
    navbars.forEach((navbar) => {
      navbar.classList.toggle('is-nav-open', navIsOpen(navbar));
    });
  };

  const updateNavbarVisibility = () => {
    const currentY = window.pageYOffset || 0;
    const delta = currentY - lastY;

    syncNavOpenState();

    navbars.forEach((navbar) => {
      if (navIsOpen(navbar) || currentY <= hideAfter) {
        navbar.classList.remove('is-scroll-hidden');
        return;
      }

      if (Math.abs(delta) < minDelta) return;

      if (delta > 0) {
        navbar.classList.add('is-scroll-hidden');
      } else {
        navbar.classList.remove('is-scroll-hidden');
      }
    });

    lastY = currentY;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateNavbarVisibility);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  navbars.forEach((navbar) => {
    const menuButton = navbar.querySelector('.menu-button-6');
    const navMenu = navbar.querySelector('.nav-menu-7');
    if (menuButton) {
      menuButton.addEventListener('click', () => {
        window.requestAnimationFrame(syncNavOpenState);
      });
      new MutationObserver(syncNavOpenState).observe(menuButton, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
    if (navMenu) {
      new MutationObserver(syncNavOpenState).observe(navMenu, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  });
  updateNavbarVisibility();
});

ready(() => {
  const navbar = document.querySelector('.navbar-59');
  if (!navbar) return;

  const navMenu = navbar.querySelector('.nav-menu-7');
  const menuButton = navbar.querySelector('.menu-button-6');
  const sourceSocial = navbar.querySelector('.nav-menu-7 .nav-social');
  if (!navMenu || !sourceSocial) return;

  document.documentElement.classList.add('nav-social-enhanced');

  const existingFloating = document.querySelector('.nav-social-floating');
  if (existingFloating) existingFloating.remove();

  const floatingSocial = sourceSocial.cloneNode(true);
  floatingSocial.classList.add('nav-social-floating');
  floatingSocial.setAttribute('aria-hidden', 'true');
  document.body.appendChild(floatingSocial);

  const syncFloatingVisibility = () => {
    const menuOpen =
      navMenu.classList.contains('w--open') ||
      (menuButton && menuButton.classList.contains('w--open'));
    floatingSocial.style.display = menuOpen ? 'block' : 'none';
  };

  const observer = new MutationObserver(syncFloatingVisibility);
  observer.observe(navMenu, { attributes: true, attributeFilter: ['class'] });
  if (menuButton) {
    observer.observe(menuButton, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('click', () => window.requestAnimationFrame(syncFloatingVisibility));
  window.addEventListener('resize', syncFloatingVisibility, { passive: true });
  syncFloatingVisibility();
});

ready(() => {
  const homeCards = Array.from(
    document.querySelectorAll(
      '.body-6._21._25 .grid_masonry .ratio_1x1, .body-6._21._25 .grid_masonry .ratio_2x3, .body-6._21._25 .grid_masonry .ratio_3x2'
    )
  );
  if (!homeCards.length) return;

  homeCards.forEach((card) => {
    const link = card.querySelector('.home-card-link[href]');
    if (!link) return;

    card.style.cursor = 'pointer';

    if (!card.hasAttribute('tabindex')) {
      card.tabIndex = 0;
    }
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', link.getAttribute('aria-label') || 'View home');

    card.addEventListener('click', (event) => {
      const interactiveTarget = event.target.closest('a, button, input, textarea, select, label');
      if (interactiveTarget === link) {
        return;
      }
      if (interactiveTarget) {
        return;
      }
      window.location.href = link.href;
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      window.location.href = link.href;
    });
  });
});
