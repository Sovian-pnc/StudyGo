(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menuButton = $('[data-page-menu]');
  const pageLinks = $('[data-page-links]');
  if (menuButton && pageLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = pageLinks.classList.toggle('mobile-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  const modal = $('[data-consult-modal]');
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };
  $$('[data-open-consult]').forEach((button) => button.addEventListener('click', () => {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    $('input', modal)?.focus();
  }));
  $('[data-close]', modal)?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

  $('[data-consult-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $('[data-consult-status]', modal);
    const contact = new FormData(form).get('contact')?.toString().trim();
    if (!contact || !status) return;
    status.textContent = 'Проверяем запрос…';
    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, source: location.pathname })
      });
      if (!response.ok) throw new Error('API unavailable');
      status.textContent = 'Запрос отправлен. Мы свяжемся с вами по указанному контакту.';
      form.reset();
    } catch {
      status.textContent = 'Демо-режим: запрос не отправлен. Подключите Supabase и Vercel по инструкции из проекта.';
    }
  });

  const passportForm = $('[data-passport-form]');
  if (passportForm) {
    const status = $('[data-passport-status]');
    const steps = $$('[data-passport-step]', passportForm);
    const nav = $('[data-passport-nav]');
    const previous = $('[data-passport-prev]');
    const next = $('[data-passport-next]');
    const save = $('[data-passport-save]');
    const progress = $('[data-passport-progress]');
    const progressBar = $('[data-passport-progress-bar]');
    const updated = $('[data-passport-updated]');
    const storageKey = 'studygo-passport-draft';
    let currentStep = 0;

    const latinText = /^[A-Za-z0-9][A-Za-z0-9\s@.,'()\-/]*$/;
    const latinName = /^[A-Za-z][A-Za-z .'-]*$/;
    const validateLatin = (field) => {
      const pattern = field.matches('[data-latin-name]') ? latinName : latinText;
      field.setCustomValidity(!field.value || pattern.test(field.value) ? '' : 'Use Latin characters only.');
    };
    $$('[data-latin], [data-latin-name]', passportForm).forEach((field) => {
      field.addEventListener('input', () => validateLatin(field));
    });

    const updateProgress = () => {
      const required = $$('[required]', passportForm);
      const completed = required.filter((field) => field.value.trim() && field.checkValidity()).length;
      const percent = required.length ? Math.round((completed / required.length) * 100) : 0;
      if (progress) progress.textContent = `${percent}% filled`;
      if (progressBar) progressBar.style.width = `${percent}%`;
    };
    const showStep = (index) => {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== currentStep; });
      $$('button', nav).forEach((button, stepIndex) => {
        button.classList.toggle('active', stepIndex === currentStep);
        button.setAttribute('aria-current', stepIndex === currentStep ? 'step' : 'false');
      });
      if (previous) previous.hidden = currentStep === 0;
      if (next) next.hidden = currentStep === steps.length - 1;
      if (save) save.hidden = currentStep !== steps.length - 1;
    };
    const saveDraft = () => {
      const draft = Object.fromEntries(new FormData(passportForm).entries());
      const changedAt = new Date().toISOString();
      sessionStorage.setItem(storageKey, JSON.stringify(draft));
      sessionStorage.setItem(`${storageKey}-updated`, changedAt);
      if (updated) updated.textContent = `Last updated: ${new Date(changedAt).toLocaleString('en-GB')}`;
      if (status) status.textContent = 'Status: draft. Changes are saved automatically in this browser.';
      updateProgress();
    };

    steps.forEach((step, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(index + 1);
      button.setAttribute('aria-label', `Step ${index + 1}`);
      button.addEventListener('click', () => showStep(index));
      nav?.append(button);
    });
    passportForm.addEventListener('input', saveDraft);
    passportForm.addEventListener('change', saveDraft);
    previous?.addEventListener('click', () => showStep(currentStep - 1));
    next?.addEventListener('click', () => {
      const fields = $$('input, select, textarea', steps[currentStep]);
      fields.forEach((field) => { if (field.matches('[data-latin], [data-latin-name]')) validateLatin(field); });
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) { invalid.reportValidity(); return; }
      showStep(currentStep + 1);
    });
    passportForm.addEventListener('submit', (event) => {
      event.preventDefault();
      $$('[data-latin], [data-latin-name]', passportForm).forEach(validateLatin);
      if (!passportForm.reportValidity()) return;
      saveDraft();
      if (status) status.textContent = 'Status: draft saved. All required fields are complete.';
    });
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (stored) Object.entries(stored).forEach(([name, value]) => {
        const field = passportForm.elements.namedItem(name);
        if (field && typeof value === 'string') field.value = value;
      });
      const changedAt = sessionStorage.getItem(`${storageKey}-updated`);
      if (changedAt && updated) updated.textContent = `Last updated: ${new Date(changedAt).toLocaleString('en-GB')}`;
    } catch { /* corrupted browser draft is safely ignored */ }
    showStep(0);
    updateProgress();
    $$('[data-doc-check]').forEach((button) => button.addEventListener('click', () => {
      const checked = button.dataset.checked === 'true';
      button.dataset.checked = String(!checked);
      const state = $('span:last-child', button);
      if (state) state.textContent = checked ? 'не отмечено' : 'готово ✓';
    }));
  }

  const adminForm = $('[data-admin-form]');
  if (adminForm) {
    const preview = {
      name: $('[data-admin-name]'), city: $('[data-admin-city]'), type: $('[data-admin-type]'),
      price: $('[data-admin-price]'), image: $('[data-admin-image]'), status: $('[data-admin-status]')
    };
    const initialImage = preview.image?.getAttribute('src') || '';
    let uploadedImage = '';
    const render = () => {
      const values = Object.fromEntries(new FormData(adminForm).entries());
      if (preview.name) preview.name.textContent = values.name || 'Название учреждения';
      if (preview.city) preview.city.textContent = values.city || 'Город';
      if (preview.type) preview.type.textContent = (values.type || 'Учреждение').toUpperCase();
      if (preview.price) preview.price.textContent = `${Number(values.price || 0).toLocaleString('ru-RU')} RMB / год`;
      const imageUrl = uploadedImage || values.imageUrl;
      if (preview.image && imageUrl) preview.image.src = imageUrl;
    };
    $$('input, select', adminForm).forEach((field) => field.addEventListener('input', render));
    $('[name="imageFile"]', adminForm)?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.addEventListener('load', () => { uploadedImage = String(reader.result); render(); });
      reader.readAsDataURL(file);
    });
    adminForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const draft = Object.fromEntries(new FormData(adminForm).entries());
      draft.previewImage = uploadedImage || draft.imageUrl || initialImage;
      try {
        localStorage.setItem('studygo-admin-card-draft', JSON.stringify(draft));
        if (preview.status) preview.status.textContent = 'Черновик сохранён только на этом устройстве. Он не опубликован в каталоге.';
      } catch {
        if (preview.status) preview.status.textContent = 'Не удалось сохранить фото в браузер. Используйте ссылку на изображение или подключите Supabase Storage.';
      }
    });
    $('[data-admin-reset]')?.addEventListener('click', () => {
      adminForm.reset();
      uploadedImage = '';
      if (preview.image) preview.image.src = initialImage;
      localStorage.removeItem('studygo-admin-card-draft');
      render();
      if (preview.status) preview.status.textContent = 'Черновик сброшен.';
    });
    try {
      const stored = JSON.parse(localStorage.getItem('studygo-admin-card-draft') || 'null');
      if (stored) {
        ['name', 'city', 'type', 'price', 'imageUrl'].forEach((key) => {
          const field = $(`[name="${key}"]`, adminForm);
          if (field && stored[key]) field.value = stored[key];
        });
        uploadedImage = stored.previewImage?.startsWith('data:image') ? stored.previewImage : '';
        render();
        if (preview.status) preview.status.textContent = 'Показан сохранённый локальный черновик. Он всё ещё не опубликован.';
      }
    } catch { /* corrupted browser data is safely ignored */ }
  }
})();
