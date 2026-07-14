# 2 — feature/session-persistence-dark-ui

## Цел

1) Сесията да преживява reload + sliding expiration (+15 мин при активност).
2) Нов дизайн: тъмна тема (черен фон, преливащи gradient цветове), responsive.
3) Navbar (лого „Rezerv" → `/`, Вход/Регистрация или Изход) + home страница с hero снимка.

## Направено

- **Session persistence:** refresh token-ът се пази в `sessionStorage`
  (`rezerv.refreshToken`); при mount `AuthProvider` вика `POST /api/auth/refresh`
  и възстановява сесията (с guard срещу StrictMode double-invoke, защото rotation-ът
  инвалидира стария token). Невалиден token → чисти се и оставаш излогнат.
- **Sliding session:** глобален click listener — всеки клик рефрешва token-а
  (нов access token = +15 мин), throttle най-много 1 refresh/минута, за да не
  спами бекенда. Всеки refresh ротира и refresh token-а.
- **Logout** (нов в navbar-а): чисти паметта + sessionStorage; client-side only
  (бекендът няма logout endpoint).
- **Тъмна тема:** нови theme токени в `src/index.css` — surface `#000000`,
  card `#101014`, line `#27272e`, ink `#f4f4f5`/`#a1a1aa`/`#63636e`, brand violet
  `#a855f7`; gradient стопове blue→violet→pink→orange + utilities `text-gradient`
  и `bg-gradient-brand`. Button primary = gradient фон.
- **Navbar + Layout:** sticky navbar на всички страници; лого „Rezerv" (gradient
  текст) вляво → `/`; вдясно Вход (ghost) + Регистрация (primary) за гости,
  име на потребителя + Изход за логнати. Responsive (името се крие на mobile).
- **HomePage на `/`:** AI-генерирана hero снимка (`src/assets/hero.png` — ножици,
  гребен, календар в gradient стил на черно), responsive под navbar-а.
- Login/Register редиректват към `/` (вместо `/status`); формите са restyle-нати
  в тъмната тема. `/status` страницата остава за дебъг.
- Обновени: `.cursor/rules/design-system.mdc` + REZERV.md §5.2 (новата палитра)
  и статус таблицата.

## Решения

- **sessionStorage за refresh token** (не localStorage): преживява reload в същия
  tab, чисти се при затваряне. Планът (REZERV.md §2.2) иска httpOnly cookie, но
  бекендът връща token-а в JSON body — когато cas мине към cookie, sessionStorage
  отпада. Отбелязано и в REZERV.md.
- Throttle 60 сек на sliding refresh-а — компромис между „всеки клик = +15 мин"
  и спам към бекенда (ефектът е същият: активен потребител никога не изтича).
- Дизайнът в REZERV.md беше светла rose тема — собственикът зададе нова посока
  (черно + gradient), REZERV.md и design-system правилото са обновени.

## Как се тества

- `npm test` — 19 unit теста (вкл. session restore, невалиден token, logout,
  sliding refresh с throttle).
- Ръчно: login → F5 → оставаш логнат; Изход → навбарът показва Вход/Регистрация;
  mobile (390px) — navbar и формите се събират.
