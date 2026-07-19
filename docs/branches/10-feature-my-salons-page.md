# feature/my-salons-page

## Цел
Страница „Моите обекти“ — списък с обекти само от одобрени (APPROVED) фирми, със същия Liquid Glass дизайн като „Моите фирми“.

## Направено
- Route `/business/salons` + `MySalonsPage`
- Sidebar линк „Моите обекти“ (до Моите фирми)
- Данни от съществуващия `GET /business/companies/mine` — филтър `status === APPROVED`, flatten `salons`
- Unit тест

## Решения
Без нов backend endpoint — reuse на mine + salons. „Активна компания“ = APPROVED.

## Как се тества
```bash
npm test -- --run src/pages/MySalonsPage.test.tsx
```
Логин като owner с одобрена фирма → sidebar „Моите обекти“.
