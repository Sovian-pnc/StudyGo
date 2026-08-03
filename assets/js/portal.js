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
    passportForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const draft = Object.fromEntries(new FormData(passportForm).entries());
      sessionStorage.setItem('studygo-passport-draft', JSON.stringify(draft));
      const name = draft.name ? `, ${draft.name}` : '';
      if (status) status.textContent = `Черновик сохранён в этом браузере${name}. Для личного кабинета команды подключите авторизацию Supabase.`;
    });
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
