# feature/working-days-liquid-ui

## Цел
Преработка на „Работни дни“ при добавяне на обект в Liquid Glass стил.

## Направено
- `WorkingDaysPicker`: списък като Settings, iOS switch, pill часове, presets Пн–Пет / Пн–Съб / Всички.
- Денът се маркира с brand badge (първи 2 букви).

## Как се тества
```bash
npm test -- --run src/pages/MyCompaniesPage.test.tsx
```
Ръчно: Моите фирми → Добави обект → секция Работно време.
