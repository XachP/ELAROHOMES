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
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const done = form.parentElement?.querySelector('.w-form-done');
      const fail = form.parentElement?.querySelector('.w-form-fail');

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
