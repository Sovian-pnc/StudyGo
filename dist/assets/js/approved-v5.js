'use strict';

(() => {
  const realMedia = {
    'catalog-464': {
      order: 1,
      image: 'assets/images/official/gdufs-campus-cc-by-sa.jpg',
      source: 'https://commons.wikimedia.org/wiki/File:Guangdong_Universtity_of_Foreign_Studies.jpg',
      sourceLabel: 'Реальный кампус · CC BY-SA 4.0',
      gallery: [
        'assets/images/official/gdufs-campus-cc-by-sa.jpg',
        'assets/images/official/gdufs-official-preview.jpg',
        'assets/images/city/guangzhou-window-studygo.png'
      ]
    },
    'catalog-712': {
      order: 2,
      image: 'assets/images/official/gcp-campus-cc-by-sa.jpg',
      source: 'https://commons.wikimedia.org/wiki/File:Guangzhou_City_Polytechnic_College.jpg',
      sourceLabel: 'Реальный кампус · CC BY-SA 4.0',
      gallery: [
        'assets/images/official/gcp-campus-cc-by-sa.jpg',
        'assets/images/city/guangzhou-window-studygo.png',
        'assets/images/original/studygo-student-life.png'
      ]
    },
    'catalog-467': {
      order: 3,
      image: 'assets/images/official/shanghai-university-campus-cc-by-sa.jpg',
      source: 'https://commons.wikimedia.org/wiki/File:Shanghai_University.jpg',
      sourceLabel: 'Баошаньский кампус · CC BY-SA 4.0',
      gallery: [
        'assets/images/official/shanghai-university-campus-cc-by-sa.jpg',
        'assets/images/unsplash-1564981797816-1200-q84.jpg',
        'assets/images/original/studygo-student-life.png'
      ]
    },
    'catalog-583': {
      order: 4,
      image: 'assets/images/official/blcu-auditorium-cc-by-sa.jpg',
      source: 'https://commons.wikimedia.org/wiki/File:Beijing_Language_and_Culture_University_Auditorium.jpg',
      sourceLabel: 'Реальный кампус · CC BY-SA 3.0',
      gallery: [
        'assets/images/official/blcu-auditorium-cc-by-sa.jpg',
        'assets/images/official/blcu-campus-official-2025.jpg',
        'assets/images/original/studygo-graduates.png'
      ]
    }
  };

  const localFallbacks = [
    'assets/images/original/studygo-campus-red.png',
    'assets/images/original/studygo-student-life.png',
    'assets/images/original/studygo-graduates.png'
  ];

  const normalizedOfficialUrl = value => /^https?:\/\//i.test(String(value || '')) ? String(value).trim() : '';

  institutions.forEach((item, index) => {
    const curated = realMedia[item.id];
    if (curated) {
      item.featuredOrder = curated.order;
      item.image = curated.image;
      item.fallbackImage = curated.image;
      item.gallery = curated.gallery;
      item.photoSource = 'licensed-campus';
      item.photoSourceUrl = curated.source;
      item.photoSourceLabel = curated.sourceLabel;
      return;
    }

    const officialUrl = normalizedOfficialUrl(item.officialUrl || item.registry?.officialUrl);
    if (officialUrl) {
      item.fallbackImage = item.fallbackImage || localFallbacks[index % localFallbacks.length];
      item.image = `https://image.thum.io/get/width/1200/crop/720/noanimate/${officialUrl}`;
      item.photoSource = 'official-preview';
      item.photoSourceUrl = officialUrl;
      item.photoSourceLabel = 'Превью официального сайта';
      if (!item.gallery?.length) item.gallery = [item.image, item.fallbackImage];
    } else {
      item.photoSource = 'studygo-visual';
      item.photoSourceLabel = 'Визуализация StudyGo';
    }
  });

  const originalGetRows = getRows;
  getRows = function approvedGetRows() {
    const rows = originalGetRows();
    if (state.sort === 'recommended') {
      rows.sort((a, b) => {
        const featured = (a.featuredOrder || 9999) - (b.featuredOrder || 9999);
        if (featured !== 0) return featured;
        return (Number(b.partner) + Number(b.open) + Number(b.scholarship)) - (Number(a.partner) + Number(a.open) + Number(a.scholarship));
      });
    }
    return rows;
  };

  cardMarkup = function approvedCardMarkup(item) {
    const tuition = item.tuition > 0 ? `${formatMoney(item.tuition)} / ${t('perYear')}` : t('toConfirm');
    const programs = item.programCount > 0 ? item.programCount : t('toConfirm');
    const level = item.levels?.length ? item.levels.slice(0, 2).map(value => t(value)).join(' · ') : t('toConfirm');
    const photoLabel = item.photoSourceLabel || 'Источник изображения указан';
    const sourceLink = normalizedOfficialUrl(item.photoSourceUrl);
    return `<article class="uni-card" data-featured="${item.featuredOrder || ''}">
      <div class="uni-media">
        <img class="uni-media-img" src="${item.image}" alt="${htmlSafe(nameOf(item.name))}" loading="lazy" onerror="this.onerror=null;this.src='${item.fallbackImage || localFallbacks[0]}'">
        <div class="uni-media-shade"></div>
        ${sourceLink ? `<a class="photo-source-label" href="${htmlSafe(sourceLink)}" target="_blank" rel="noopener noreferrer" title="Открыть источник">${htmlSafe(photoLabel)} ↗</a>` : `<span class="photo-source-label">${htmlSafe(photoLabel)}</span>`}
        <div class="media-top"><div class="badges">${item.partner ? `<span class="badge partner">✦ ${t('partnerBadge')}</span>` : ''}${item.scholarship ? `<span class="badge grant">● ${t('grantBadge')}</span>` : ''}${item.open ? `<span class="badge open">● ${t('openBadge')}</span>` : ''}</div><button class="icon-btn ${favorites.has(item.id) ? 'active' : ''}" data-favorite="${item.id}" aria-label="Добавить в избранное">${favorites.has(item.id) ? '♥' : '♡'}</button></div>
        <div class="media-bottom"><div class="location">${nameOf(item.city)}, ${nameOf(item.province)}<small>${nameOf(item.district)}</small></div><div class="verified">✓ ${t('verified')}: ${item.updated}</div></div>
      </div>
      <div class="uni-body">
        <h3 class="uni-title">${nameOf(item.name)}</h3><p class="uni-zh">${htmlSafe(item.zh || '')}</p>
        <div class="uni-tags"><span class="tag purple">${t(item.type)}</span>${item.dormitory ? '<span class="tag mint">Есть общежитие</span>' : ''}${item.minor ? '<span class="tag">Принимают несовершеннолетних</span>' : ''}</div>
        <div class="uni-grid"><div class="uni-fact"><span>Уровень</span><strong>${level}</strong></div><div class="uni-fact"><span>Обучение</span><strong>${tuition}</strong></div><div class="uni-fact"><span>Программ в базе</span><strong>${programs}</strong></div><div class="uni-fact"><span>Данные</span><strong>${item.sourceType === 'public-catalog' ? 'требуют проверки' : 'проверены по источнику'}</strong></div></div>
        <div class="uni-actions"><button class="details-btn" data-detail="${item.id}"><span class="details-label-long">Смотреть программы</span><span class="details-label-short">Программы</span></button><button class="compare-btn ${compare.has(item.id) ? 'active' : ''}" data-compare="${item.id}" aria-label="${compare.has(item.id) ? 'Убрать из сравнения' : 'Добавить к сравнению'}">${compare.has(item.id) ? '✓ Добавлено' : 'Сравнить'}</button></div>
      </div>
    </article>`;
  };

  const originalRenderCatalog = renderCatalog;
  renderCatalog = function approvedRenderCatalog() {
    originalRenderCatalog();
    const visibleCount = getRows().length;
    const counter = document.getElementById('catalogInstitutionCount');
    if (counter) {
      counter.textContent = String(visibleCount);
      counter.setAttribute('aria-label', String(visibleCount));
    }
    const fullCounter = document.getElementById('statInstitutionCount');
    if (fullCounter) {
      const value = String(institutions.length);
      fullCounter.setAttribute('aria-label', value);
      fullCounter.replaceChildren(...value.split('').map(digit => {
        const item = document.createElement('span');
        item.className = 'sg-ref-count-digit';
        item.textContent = digit;
        return item;
      }));
    }
  };

  const originalDetailMarkup = detailMarkup;
  detailMarkup = function approvedDetailMarkup(item) {
    let markup = originalDetailMarkup(item);
    const cityName = nameOf(item.city);
    const liveBlock = `<section class="detail-section" id="detail-live"><h3>${cityName} сейчас</h3><div class="detail-live-china"><img id="detailCityImage" src="assets/images/city/guangzhou-window-studygo.png" alt="Живой город — визуализация StudyGo"><div><strong id="detailCityTitle">Окно в повседневную жизнь</strong><p id="detailCityStory">Местное время, погода и полезный бытовой контекст помогают увидеть не только корпус, но и будущий день студента.</p></div><span><b id="detailChinaTime">--:-- CST</b><small id="detailChinaWeather">Погода обновляется…</small></span></div></section>`;
    markup = markup.replace('<section class="detail-section" id="detail-gallery">', `${liveBlock}<section class="detail-section" id="detail-gallery">`);
    return markup;
  };

  loginMarkup = function passportMarkup() {
    return `<button class="content-close" type="button" aria-label="Закрыть">✕</button><div class="modal-panel passport-panel"><aside class="passport-cover"><img src="assets/images/original/studygo-office-admissions-v6.png" alt="Команда StudyGo проверяет документы"><span>STUDYGO</span><strong>PASSPORT</strong><small>Личное пространство будущего студента Китая</small></aside><section class="passport-progress"><div class="sg-eyebrow">Личный кабинет ученика</div><h2>Твой путь уже начался</h2><p>Пример будущего кабинета: после подключения авторизации здесь появятся реальные документы, дедлайны и сообщения команды.</p><div><b>Готовность к поступлению · 38%</b><div class="passport-meter"><i></i></div></div><div class="passport-grid"><article><strong>${favorites.size}</strong><span>в избранном</span></article><article><strong>0 / 8</strong><span>документов загружено</span></article><article><strong>HSK —</strong><span>уровень пока не указан</span></article><article><strong>2026/27</strong><span>планируемый набор</span></article></div><button class="consult-submit" data-action="consult" type="button">Настроить мой маршрут</button></section></div>`;
  };

  const mega = document.getElementById('sgMegaMenu');
  const setMega = open => {
    if (!mega) return;
    mega.classList.toggle('open', open);
    mega.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('mega-open', open);
    document.querySelectorAll('.sg-nav-dropdown-trigger').forEach(button => button.setAttribute('aria-expanded', String(open)));
    document.getElementById('sgMenuButton')?.setAttribute('aria-expanded', String(open));
  };

  document.addEventListener('click', event => {
    const trigger = event.target.closest('.sg-nav-dropdown-trigger,#sgMenuButton');
    if (trigger) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setMega(!mega?.classList.contains('open'));
      return;
    }
    if (event.target.closest('#sgMegaMenu a,#sgMegaMenu button')) setMega(false);
    if (mega?.classList.contains('open') && !event.target.closest('#sgMegaMenu,.sg-nav-dropdown-trigger,#sgMenuButton')) setMega(false);
  }, true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMega(false); });

  const guideMarkup = () => `<button class="content-close" type="button" aria-label="Закрыть">✕</button><div class="modal-panel passport-panel"><aside class="passport-cover"><img src="assets/images/guide/arina-metro-guide.png" alt="Студенческая жизнь в Китае — визуализация цифрового гида StudyGo"><span>ЦИФРОВОЙ ГИД</span><strong>StudyGo</strong><small>Живой маршрут по поступлению и студенческой жизни в Китае</small></aside><section class="passport-progress"><div class="sg-eyebrow">Первая остановка · Гуанчжоу</div><h2>Покажем не только кампус</h2><p>Как доехать из аэропорта, где оформить SIM-карту, что спросить про общежитие, какие приложения установить и кому написать в первый день.</p><div class="passport-grid"><article><strong>Метро</strong><span>маршрут до кампуса</span></article><article><strong>食堂</strong><span>как найти столовую</span></article><article><strong>宿舍</strong><span>как спросить про общежитие</span></article><article><strong>报到</strong><span>регистрация в вузе</span></article></div><button class="consult-submit" data-action="consult" type="button">Получить мой план приезда</button></section></div>`;
  document.querySelectorAll('[data-guide-open]').forEach(button => button.addEventListener('click', () => {
    openContent(guideMarkup(), { type: 'guide' });
    document.querySelector('#contentModal [data-action="consult"]')?.addEventListener('click', openConsult);
  }));

  const motionToggle = document.getElementById('motionToggle');
  motionToggle?.addEventListener('click', () => {
    const windowCard = document.getElementById('chinaWindow');
    const paused = windowCard?.classList.toggle('paused');
    motionToggle.setAttribute('aria-pressed', String(Boolean(paused)));
    motionToggle.textContent = paused ? 'Продолжить движение' : 'Пауза движения';
  });

  const phrases = [
    ['今天食堂有牛肉面', 'Jīntiān shítáng yǒu niúròu miàn', 'Сегодня в столовой есть лапша с говядиной.'],
    ['HSK报名开始了', 'HSK bàomíng kāishǐ le', 'Началась регистрация на HSK.'],
    ['第一节课八点开始', 'Dì-yī jié kè bā diǎn kāishǐ', 'Первая пара начинается в восемь.'],
    ['宿舍晚上十一点关门', 'Sùshè wǎnshang shíyī diǎn guānmén', 'Общежитие закрывается в одиннадцать вечера.']
  ];
  let phraseIndex = 0;
  document.getElementById('nextPhrase')?.addEventListener('click', event => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    const card = event.currentTarget.closest('.sg-china-speaks-card');
    card.querySelector('strong').textContent = phrases[phraseIndex][0];
    card.querySelector('i').textContent = phrases[phraseIndex][1];
    card.querySelector('p').textContent = phrases[phraseIndex][2];
  });

  const weatherLabel = code => {
    if ([0].includes(code)) return 'ясно';
    if ([1, 2, 3].includes(code)) return 'переменная облачность';
    if ([45, 48].includes(code)) return 'туман';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'дождь';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'снег';
    if ([95, 96, 99].includes(code)) return 'гроза';
    return 'погода обновлена';
  };

  const updateChinaTime = () => {
    const time = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    document.getElementById('chinaNowTime')?.replaceChildren(document.createTextNode(time));
    document.getElementById('detailChinaTime')?.replaceChildren(document.createTextNode(`${time} CST`));
  };
  updateChinaTime();
  window.setInterval(updateChinaTime, 30000);

  const cityNotes = {
    guangzhou: { name: 'ГУАНЧЖОУ', latitude: 23.1291, longitude: 113.2644, image: 'assets/images/city/guangzhou-window-studygo.png', story: 'В кампусах заканчивается первая пара, а в метро уже оживлённо.', phrase: ['今天食堂有牛肉面', 'Сегодня в столовой есть лапша с говядиной.'] },
    shenzhen: { name: 'ШЭНЬЧЖЭНЬ', latitude: 22.5431, longitude: 114.0579, image: 'assets/images/original/studygo-campus-red.png', story: 'После занятий студенты собираются в коворкингах и на набережной.', phrase: ['地铁很方便', 'На метро здесь действительно удобно.'] },
    beijing: { name: 'ПЕКИН', latitude: 39.9042, longitude: 116.4074, image: 'assets/images/official/blcu-campus-official-2025.jpg', story: 'В библиотеке уже тихо: вечер — время подготовки и встреч с группой.', phrase: ['图书馆九点关门', 'Библиотека закрывается в девять вечера.'] },
    shanghai: { name: 'ШАНХАЙ', latitude: 31.2304, longitude: 121.4737, image: 'assets/images/official/shanghai-university-campus-cc-by-sa.jpg', story: 'Кампус и город соединяет быстрый привычный маршрут на метро.', phrase: ['下一站是大学城', 'Следующая станция — университетский городок.'] }
  };
  let activeCity = 'guangzhou';
  const setCityPulse = cityKey => {
    const city = cityNotes[cityKey] || cityNotes.guangzhou;
    activeCity = cityKey;
    document.querySelectorAll('[data-city]').forEach(button => button.classList.toggle('active', button.dataset.city === cityKey));
    const image = document.getElementById('cityPulseImage');
    const cityLabel = document.getElementById('cityPulseEyebrow');
    const story = document.getElementById('cityPulseStory');
    const phrase = document.getElementById('chinaPhrase');
    const translation = document.getElementById('chinaTranslation');
    if (image) { image.src = city.image; image.alt = `Вид на ${city.name} — визуализация StudyGo`; }
    if (cityLabel) cityLabel.textContent = `СЕЙЧАС В ${city.name}`;
    if (story) story.textContent = city.story;
    if (phrase) phrase.textContent = city.phrase[0];
    if (translation) translation.textContent = city.phrase[1];
    const weather = document.getElementById('chinaNowWeather');
    if (weather) weather.textContent = 'Погода обновляется…';
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('weather unavailable')))
      .then(data => {
        if (activeCity !== cityKey) return;
        const temperature = Math.round(data.current?.temperature_2m);
        const code = Number(data.current?.weather_code);
        if (weather && Number.isFinite(temperature)) weather.textContent = `${temperature > 0 ? '+' : ''}${temperature}° · ${weatherLabel(code)}`;
      })
      .catch(() => { if (activeCity === cityKey && weather) weather.textContent = 'Погода временно недоступна'; });
  };
  document.querySelectorAll('[data-city]').forEach(button => button.addEventListener('click', () => setCityPulse(button.dataset.city)));
  if (document.getElementById('cityPulseImage')) {
    setCityPulse(activeCity);
    window.setInterval(() => {
      const cityKeys = Object.keys(cityNotes);
      setCityPulse(cityKeys[(cityKeys.indexOf(activeCity) + 1) % cityKeys.length]);
    }, 16000);
  }

  const cityKeyFor = cityName => {
    const value = String(cityName || '').toLowerCase();
    if (value.includes('шэнь') || value.includes('шен')) return 'shenzhen';
    if (value.includes('пекин')) return 'beijing';
    if (value.includes('шанх')) return 'shanghai';
    return 'guangzhou';
  };
  const updateDetailCity = cityKey => {
    const city = cityNotes[cityKey] || cityNotes.guangzhou;
    const title = document.querySelector('#detail-live h3');
    const image = document.getElementById('detailCityImage');
    const story = document.getElementById('detailCityStory');
    const weather = document.getElementById('detailChinaWeather');
    if (title) title.textContent = `${city.name[0] + city.name.slice(1).toLowerCase()} сейчас`;
    if (image) { image.src = city.image; image.alt = `${city.name} — визуализация StudyGo`; }
    if (story) story.textContent = city.story;
    if (weather) weather.textContent = 'Погода обновляется…';
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('weather unavailable')))
      .then(data => {
        const temperature = Math.round(data.current?.temperature_2m);
        if (weather && Number.isFinite(temperature)) weather.textContent = `${temperature > 0 ? '+' : ''}${temperature}° · ${weatherLabel(Number(data.current?.weather_code))}`;
      })
      .catch(() => { if (weather) weather.textContent = 'Погода временно недоступна'; });
  };

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-action="login"]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign('passport.html');
  }, true);

  document.addEventListener('submit', async event => {
    const form = event.target.closest('#consultForm');
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const contact = new FormData(form).get('contact')?.toString().trim();
    const submit = form.querySelector('[type="submit"]');
    if (!contact) return;
    if (submit) { submit.disabled = true; submit.textContent = 'Отправляем…'; }
    try {
      const response = await fetch('/api/consultation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact, source: location.pathname }) });
      if (!response.ok) throw new Error('Form backend unavailable');
      form.innerHTML = '<div class="login-card full"><div class="login-card-icon">✓</div><div><h3>Запрос отправлен</h3><p>Мы свяжемся с вами по указанному контакту.</p></div></div>';
    } catch {
      form.innerHTML = '<div class="login-card full"><div class="login-card-icon">i</div><div><h3>Демо-режим</h3><p>Запрос не отправлен: подключите Supabase и Vercel по инструкции в проекте.</p></div></div>';
    }
  }, true);

  const originalOpenDetail = openDetail;
  openDetail = function approvedOpenDetail(id, rerender = false) {
    originalOpenDetail(id, rerender);
    updateChinaTime();
    const item = institutions.find(entry => String(entry.id) === String(id));
    updateDetailCity(cityKeyFor(nameOf(item?.city)));
  };

  renderCatalog();
})();
