# feature/booking-calendar-ui

## Цел
Календар за избор на дата/час и резервация (CLIENT).

## Направено
- `/salons/:id/book?serviceId=` — месечен календар (хоризонт +1 месец), слотове, потвърди.
- „Запази“ на salon detail води към booking.
- API: `getPublicSlots`, `createAppointment`.

## Забележка
Слотове се появяват само ако обектът има staff, абониран за услугата, с график/наследени salon hours.
