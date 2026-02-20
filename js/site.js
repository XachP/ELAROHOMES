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
  const navbars = Array.from(document.querySelectorAll('.navbar-59'));
  if (!navbars.length) return;

  const navItems = [
    { path: '/homes/', label: 'Homes' },
    { path: '/communities/', label: 'Communities' },
    { path: '/featured-plans/', label: 'Featured Plans' },
    { path: '/about/', label: 'About' },
    { path: '/contact/', label: 'Contact' },
  ];

  const normalizeOverlay = (overlay) => {
    if (!overlay) return;

    const social = overlay.querySelector('.nav-social');
    let linksWrap = overlay.querySelector('.nav-links');

    if (!linksWrap) {
      linksWrap = document.createElement('div');
      linksWrap.className = 'nav-links';
    }

    // Remove any previous/stray links to avoid Webflow state conflicts on current page.
    Array.from(overlay.children).forEach((child) => {
      if (child.matches?.('a.link-13')) child.remove();
    });
    linksWrap.innerHTML = '';

    navItems.forEach((item, idx) => {
      const link = document.createElement('a');
      link.href = item.path;
      link.className = 'link-13 nav-link-force';
      link.textContent = item.label;
      link.removeAttribute('aria-current');
      link.style.display = 'block';
      link.style.opacity = '1';
      link.style.visibility = 'visible';
      link.style.position = 'static';
      link.style.order = String(idx + 1);
      linksWrap.appendChild(link);
    });

    if (social) {
      overlay.insertBefore(linksWrap, social);
    } else if (!overlay.contains(linksWrap)) {
      overlay.appendChild(linksWrap);
    }
  };

  const normalizeAllOverlays = (navbar) => {
    const overlaySet = new Set();
    const inNavbar = navbar.querySelector('.nav-overlay');
    if (inNavbar) overlaySet.add(inNavbar);

    document.querySelectorAll('.w-nav-overlay .nav-overlay').forEach((node) => overlaySet.add(node));
    overlaySet.forEach((overlay) => normalizeOverlay(overlay));
  };

  navbars.forEach((navbar) => {
    const menuButton = navbar.querySelector('.menu-button-6');
    if (menuButton) {
      menuButton.addEventListener('click', () => {
        // Webflow toggles/moves the nav asynchronously; normalize multiple times.
        [0, 80, 220, 420].forEach((delay) => {
          window.setTimeout(() => normalizeAllOverlays(navbar), delay);
        });
      });
    }

    // Also normalize when overlay nodes are created/moved by Webflow.
    const observer = new MutationObserver(() => normalizeAllOverlays(navbar));
    observer.observe(document.body, { childList: true, subtree: true });

    normalizeAllOverlays(navbar);
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
