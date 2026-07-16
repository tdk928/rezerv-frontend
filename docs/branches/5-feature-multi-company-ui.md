# 5-feature-multi-company-ui

## Цел
UI за много фирми на един акаунт: добавяне на нова фирма по всяко време +
избор на **активна** фирма (JWT `companyId`).

## Направено
- `UserResponse.companyIds` + `switchCompany()` → `POST /api/auth/switch-company`.
- `listMyCompanies()` → `GET /api/business/companies/mine`.
- Navbar: dropdown „Фирма“ (ако има membership) + бутон „Нова фирма“ / „Регистрирай фирма“
  за **всеки** логнат user (не се скрива след първа фирма).
- Onboarding: махнато блокиране „Вече имате фирма“.
- 401 от protected API → logout (gateway invalid/expired token).

## Как се тества
```bash
npm test
npm run dev
# 1. Login → Регистрирай фирма (ЕИК 131529327) → салон…
# 2. Navbar → Нова фирма (друг валиден ЕИК, напр. 175074752)
# 3. Dropdown „Фирма“ сменя активната → refresh на JWT
```
