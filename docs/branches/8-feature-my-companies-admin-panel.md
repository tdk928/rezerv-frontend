# 8-feature-my-companies-admin-panel

## Цел
UI за „Моите фирми“ (фирми + обекти) и admin списък на всички фирми със собственици.

## Направено
- **`/business/companies`** — `MyCompaniesPage` (RequireAuth); карти фирма → nested обекти.
- **`/admin/companies`** — `AdminCompaniesPage` (RequireRole `PLATFORM_ADMIN`); таблица.
- **`RequireRole`** компонент.
- Navbar: „Моите фирми“ (ако има `companyIds`), „Админ“ (ако `PLATFORM_ADMIN`).
- API: `listMyCompanies` → `CompanyWithSalonsResponse[]`; `listAdminCompanies`.
- 3 нови unit теста (общо 34).

## Решения
- Без firm switcher в navbar (премахнат по-рано) — само списък.
- Admin без approve/reject в този slice — само преглед.

## Как се тества
```bash
npm test
npm run dev
# Owner: login → Моите фирми
# Admin: admin@rezerv.bg / admin123 → Админ
```
