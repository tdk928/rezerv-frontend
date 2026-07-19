# feature/salon-working-hours-ui

## Цел
При добавяне на обект — checkboxes за работни дни + редактируеми часове (default 09:00–18:00).

## Направено
- `AddSalonForm` на „Моите фирми“: пн–нд checkboxes, time inputs, default пн–пет.
- `CreateSalonRequest.workingHours` към `POST /business/companies/{id}/salons`.
- Zod валидация: ≥1 ден, open < close.
- Unit тест очаква `workingHours` с 5 дни (пн–пет).

## Решения
- Часовете са per-day още при create (не един глобален интервал), за да поддържа събота с намалено време.
- Редакция на вече създаден обект (`PUT .../working-hours`) остава за следващ UI slice.

## Как се тества
```bash
npm test -- --run src/pages/MyCompaniesPage.test.tsx
```
