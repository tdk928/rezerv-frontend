# feature/staff-management-ui

## Цел
Owner UI за служители на обект: добавяне по email + абонамент за услуги.

## Направено
- API: `listSalonStaff`, `addSalonStaff`, `replaceStaffServices` (+ `putAuth`).
- „Моите обекти“: секция Служители — добавяне по email (трябва CAS акаунт),
  checkboxes за услуги на всеки служител.

## Решения
- График / time-off / closures UI остават за следващ slice; backend вече ги има.
- Staff = съществуващ user; роля STAFF се дава от business→CAS при add.

## Как се тества
```bash
npm test -- --run src/pages/MySalonsPage.test.tsx
```
Ръчно: регистрирай втори user → от owner добави email-а му към обект.
