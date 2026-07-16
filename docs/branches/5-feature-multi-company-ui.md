# 5-feature-multi-company-ui

## Цел
UI за много фирми на един акаунт: добавяне на нова фирма по всяко време.
(Switch на активна фирма остава през API; navbar dropdown е махнат като грозен.)

## Направено
- `UserResponse.companyIds` + `switchCompany()` → `POST /api/auth/switch-company`.
- `listMyCompanies()` → `GET /api/business/companies/mine` (API готов; navbar не го вика).
- Navbar: бутон „Нова фирма“ / „Регистрирай фирма“ за **всеки** логнат user
  (без dropdown „Фирма“).
- Onboarding: махнато блокиране „Вече имате фирма“.
- 401 от protected API → logout (gateway invalid/expired token).
- StrictMode: споделен `restoreInFlight` promise — без двоен refresh → logout.

## Как се тества
```bash
npm test
npm run dev
# 1. Login → Регистрирай фирма (ЕИК 131529327) → салон…
# 2. Navbar → Нова фирма (друг валиден ЕИК, напр. 175074752)
# 3. User с фирма остава логнат (не се разлогва след секунда)
```
