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
  const fallbackSocialUrls = {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    x: 'https://x.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  };
  const requiredNavLinks = [
    { href: '/homes/', label: 'Homes' },
    { href: '/communities/', label: 'Future Developments' },
    { href: '/featured-plans/', label: 'Featured Plans' },
    { href: '/about/', label: 'About' },
    { href: '/contact/', label: 'Contact', extraClass: 'pn' },
  ];

  const hydrateSocialLinks = (root) => {
    const links = Array.from(root.querySelectorAll('.footer_icon-link'));
    links.forEach((link) => {
      const href = (link.getAttribute('href') || '').trim();
      if (href && href !== '#') return;

      const label = link.querySelector('.screen-reader')?.textContent?.trim().toLowerCase();
      const fallbackUrl = label ? fallbackSocialUrls[label] : null;
      if (!fallbackUrl) return;

      link.setAttribute('href', fallbackUrl);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  };

  const ensureNavOverlayIntegrity = () => {
    const overlays = Array.from(
      document.querySelectorAll('.navbar-59 .nav-overlay, .w-nav-overlay .nav-overlay')
    );
    if (!overlays.length) return;

    const sourceSocialGroup =
      document.querySelector('.navbar-59 .nav-social .footer_icon-group') ||
      document.querySelector('footer .footer_icon-group');

    overlays.forEach((overlay) => {
      // Flatten any previously injected wrapper so overlay keeps Webflow's direct-link structure.
      const wrappers = Array.from(overlay.children).filter((el) => el.classList.contains('nav-links'));
      wrappers.forEach((wrapper) => {
        Array.from(wrapper.children)
          .filter((el) => el.tagName === 'A' && el.classList.contains('link-13'))
          .forEach((link) => {
          overlay.insertBefore(link, wrapper);
        });
        wrapper.remove();
      });

      requiredNavLinks.forEach((item) => {
        const allMatches = Array.from(overlay.querySelectorAll(`a.link-13[href="${item.href}"]`));
        let link = allMatches.shift();
        allMatches.forEach((duplicate) => duplicate.remove());

        if (!link) {
          link = document.createElement('a');
          link.href = item.href;
          link.className = 'link-13';
          link.textContent = item.label;
          overlay.appendChild(link);
        }

        link.textContent = item.label;
        if (item.extraClass) {
          link.classList.add(item.extraClass);
        }
        link.style.display = 'block';
        link.style.opacity = '1';
        link.style.visibility = 'visible';
        link.style.position = 'static';
      });

      let social = Array.from(overlay.children).find((el) => el.classList.contains('nav-social'));
      if (!social) {
        social = overlay.querySelector('.nav-social');
      }

      if (!social) {
        social = document.createElement('div');
        social.className = 'nav-social w-layout-blockcontainer container-7 w-container';

        const list = document.createElement('ul');
        list.setAttribute('role', 'list');
        list.setAttribute('aria-label', 'Social media links');
        list.className = 'footer_icon-group w-list-unstyled nav-social-icons';
        if (sourceSocialGroup) {
          list.innerHTML = sourceSocialGroup.innerHTML;
        }
        social.appendChild(list);
      }

      requiredNavLinks.forEach((item) => {
        const link = overlay.querySelector(`a.link-13[href="${item.href}"]`);
        if (!link) return;
        overlay.insertBefore(link, social || null);
      });

      overlay.appendChild(social);
      social.style.display = 'block';
      social.style.visibility = 'visible';
      social.style.opacity = '1';
      social.style.position = 'absolute';
      social.style.left = '50%';
      social.style.bottom = '14px';
      social.style.transform = 'translateX(-50%)';
      social.style.margin = '0';

      social.querySelectorAll('.margin-bottom_none').forEach((item) => {
        item.style.position = 'static';
        item.style.top = 'auto';
        item.style.bottom = 'auto';
        item.style.margin = '0';
      });

      hydrateSocialLinks(social);
    });
  };

  const scheduleOverlayRepair = () => {
    window.requestAnimationFrame(ensureNavOverlayIntegrity);
    window.setTimeout(ensureNavOverlayIntegrity, 80);
    window.setTimeout(ensureNavOverlayIntegrity, 220);
  };

  hydrateSocialLinks(document);
  ensureNavOverlayIntegrity();

  document.querySelectorAll('.menu-button-6').forEach((button) => {
    button.addEventListener('click', scheduleOverlayRepair);
  });

  window.addEventListener('resize', scheduleOverlayRepair, { passive: true });
  window.addEventListener('orientationchange', scheduleOverlayRepair);
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
