# Развёртывание StudyGo: GitHub, Vercel и Supabase

## 1. Загрузить проект в GitHub

1. На GitHub создайте новый пустой репозиторий, например `studygo-site`.
2. Не добавляйте README при создании: он уже есть в проекте.
3. Загрузите в корень репозитория **содержимое** папки `StudyGo-live-v6`, а не саму папку целиком.
4. Проверьте, что рядом видны `index.html`, `about.html`, `services.html`, папки `assets`, `api` и `supabase`.
5. Commit message: `StudyGo v6 website`.

Если используется терминал:

```bash
git init
git add .
git commit -m "StudyGo v6 website"
git branch -M main
git remote add origin https://github.com/USERNAME/studygo-site.git
git push -u origin main
```

## 2. Развернуть в Vercel

1. Откройте Vercel → **Add New → Project**.
2. Выберите GitHub-репозиторий `studygo-site`.
3. Framework Preset: **Other**.
4. Root Directory: корень репозитория.
5. Build Command и Output Directory оставьте пустыми.
6. Нажмите **Deploy**.

После развёртывания проверьте:

- `/`, `/about.html`, `/services.html`, `/passport.html`, `/admin.html`;
- mobile-меню, каталог, сравнение и карточку учреждения;
- консультационную форму: пока Supabase не подключён, она должна показывать «Демо-режим», а не ложное подтверждение.

## 3. Подключить Supabase для заявок, кабинета и редактора

1. Создайте новый проект в Supabase.
2. Войдите в **SQL Editor**. Для нового пустого проекта откройте локальный `supabase/schema.sql`; для текущего StudyGo-проекта с уже загруженным каталогом — `supabase/migrations/20260802_studygo_admin_portal.sql`. Скопируйте выбранный файл целиком и запустите.
3. В **Authentication → Users** создайте первого сотрудника. Схема автоматически создаст его строку в `profiles`.
4. В SQL Editor выполните строку из конца `schema.sql`, подставив UUID сотрудника, чтобы назначить роль `admin`.
5. В Vercel → **Project Settings → Environment Variables** добавьте:

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

6. Добавьте переменные для Production, Preview и Development, затем сделайте Redeploy.

Теперь серверная функция `/api/consultation` сможет создавать заявки в `consultation_requests`. Ключ остаётся на Vercel и не попадает в браузер.

## 4. Перевести редактор из демо в рабочий режим

`admin.html` уже содержит все UX-поля. Для общей работы команды следующий шаг — подключить Supabase Auth и заменить локальное сохранение в `assets/js/portal.js` на операции с `institutions`, `institution_media` и private bucket `institution-media`. В публичный каталог попадут только карточки со статусом `verified`.

Перед включением публикации обязательно:

- оставьте RLS включённым;
- разрешайте запись только роли `admin`;
- храните источники и лицензии фото;
- не выдавайте публичный доступ к документам учеников;
- настройте резервное копирование базы и процесс удаления персональных данных.

## 5. Что сделать после получения домена

1. Подключить домен в Vercel → Domains.
2. Внести реальные контакты, юридические документы и политику обработки персональных данных.
3. Добавить проверенные ссылки на Telegram, WhatsApp и почту.
4. Заменить демонстрационные цены и дедлайны в каталоге только после проверки официального источника.
5. Добавить Open Graph адреса и аналитику при необходимости.
