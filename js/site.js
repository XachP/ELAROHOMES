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
  const overlays = Array.from(document.querySelectorAll('.navbar-59 .nav-overlay'));
  if (!overlays.length) return;

  overlays.forEach((overlay) => {
    if (overlay.querySelector('.nav-links')) return;

    const linksWrap = document.createElement('div');
    linksWrap.className = 'nav-links';

    const directLinks = Array.from(overlay.children).filter((child) =>
      child.classList?.contains('link-13')
    );

    if (!directLinks.length) return;
    directLinks.forEach((link) => linksWrap.appendChild(link));

    const social = overlay.querySelector('.nav-social');
    if (social) {
      overlay.insertBefore(linksWrap, social);
      return;
    }

    overlay.appendChild(linksWrap);
  });
});

ready(() => {
  const navbars = Array.from(document.querySelectorAll('.navbar-59'));
  if (!navbars.length) return;

  const orderedPaths = ['/homes/', '/communities/', '/featured-plans/', '/about/', '/contact/'];

  const normalizeOverlayLinks = (navbar) => {
    const overlay = navbar.querySelector('.nav-overlay');
    if (!overlay) return;

    let linksWrap = overlay.querySelector('.nav-links');
    if (!linksWrap) {
      linksWrap = document.createElement('div');
      linksWrap.className = 'nav-links';
      const social = overlay.querySelector('.nav-social');
      if (social) {
        overlay.insertBefore(linksWrap, social);
      } else {
        overlay.appendChild(linksWrap);
      }
    }

    orderedPaths.forEach((path, idx) => {
      let link =
        linksWrap.querySelector(`a[href="${path}"]`) ||
        overlay.querySelector(`a[href="${path}"]`);

      if (!link) {
        link = document.createElement('a');
        link.href = path;
        link.className = 'link-13';
        link.textContent = path.replace(/\//g, '').replace('-', ' ') || 'Home';
      }

      if (!linksWrap.contains(link)) {
        linksWrap.appendChild(link);
      }

      link.style.display = 'block';
      link.style.opacity = '1';
      link.style.visibility = 'visible';
      link.style.position = 'static';
      link.style.order = String(idx + 1);

      if (path === '/homes/') {
        link.textContent = 'Homes';
      } else if (path === '/communities/') {
        link.textContent = 'Communities';
      } else if (path === '/featured-plans/') {
        link.textContent = 'Featured Plans';
      } else if (path === '/about/') {
        link.textContent = 'About';
      } else if (path === '/contact/') {
        link.textContent = 'Contact';
      }
    });
  };

  navbars.forEach((navbar) => {
    const menuButton = navbar.querySelector('.menu-button-6');
    if (menuButton) {
      menuButton.addEventListener('click', () => {
        window.setTimeout(() => normalizeOverlayLinks(navbar), 0);
      });
    }

    normalizeOverlayLinks(navbar);
  });
});

ready(() => {
  const fallbackSocialUrls = {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    x: 'https://x.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  };

  const socialLinks = Array.from(document.querySelectorAll('.footer_icon-link'));
  if (!socialLinks.length) return;

  socialLinks.forEach((link) => {
    const href = (link.getAttribute('href') || '').trim();
    if (href && href !== '#') return;

    const label = link.querySelector('.screen-reader')?.textContent?.trim().toLowerCase();
    const fallbackUrl = label ? fallbackSocialUrls[label] : null;
    if (!fallbackUrl) return;

    link.setAttribute('href', fallbackUrl);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
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
