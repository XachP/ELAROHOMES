console.log('form-fix-loaded');

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
