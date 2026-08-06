# feature/warm-liquid-action-buttons

## Цел
Да се премахне solid green/red визуалният стил от постоянните business controls и
booking календарът да стане по-компактен, свързан и Liquid Glass ориентиран.

## Направено
- Нови reusable `Button` варианти `warm` и `dangerSoft`.
- „Добави услуга“ е amber glass action; „Премахни“ е мек destructive glass action.
- Staff service selections използват translucent mint/coral състояния вместо solid цветове.
- Booking UI е общ двуколонен glass panel: компактен календар + часове, служители и CTA.
- Добавен е предварителен филтър по служител за целия booking период.
- При смяна на служителя избраната дата се запазва, а часовете се обновяват веднага.

## Решения
- Solid danger остава само за финалното destructive потвърждение.
- Филтрирането по служител използва вече заредените slots за целия booking horizon,
  без допълнителна API заявка.
- На mobile booking panel-ът се подрежда вертикално.

## Как се тества
```bash
npm test -- --run src/pages/MySalonsPage.test.tsx
npm test -- --run src/pages/BookAppointmentPage.test.tsx
npm run build
npm run lint
```
