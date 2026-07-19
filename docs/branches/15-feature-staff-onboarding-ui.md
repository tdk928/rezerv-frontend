# feature/staff-onboarding-ui

## Цел
При „+ Добави служител“ owner да може или да свърже съществуващ акаунт по email,
или да създаде нов потребител (STAFF) за фирмата и обекта.

## Направено
- Segmented control (Liquid): **Създай служител** | **Съществуващ акаунт**.
- Create форма: име, фамилия, email, начална парола (≥8), телефон/длъжност опц.
- API: `createSalonStaff` → `POST /business/salons/{id}/staff/create`.
- Link-by-email логиката остава непроменена (втори таб).

## Решения
- Default таб = „Създай служител“ (по-често за нови салони).
- glass-strong панел + pill tabs в стил на останалия Liquid UI.

## Как се тества
```bash
npm test -- --run src/pages/MySalonsPage.test.tsx
```
Ръчно: Моите обекти → + Добави служител → Създай → login с новия email/парола.
