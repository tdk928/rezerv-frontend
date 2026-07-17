# 6-feature-onboarding-simplify-terms-sign

## Цел
Опростяване на B2B onboarding wizard-а: без услуга/снимка при регистрация (ще отидат в
администрация), „салон“ → „обект“, скелет за общи условия + електронен подпис.

## Направено
- **Стъпки**: `Фирма → Обект → Условия → Подпис` (махнати „Услуга“ и „Снимка“).
- **SalonStep**: label „Име на обекта“; валидация `salonSchema` обновена.
- **TermsStep**: lorem ipsum + бутони „Общи условия“ / „Договор за ползване“ (скелет, без PDF).
- **SignStep**: „Подпиши и завърши“ — завършва регистрацията (без Borica/Evrotrust засега).
- Махнати `serviceSchema` / `photoSchema` от onboarding schemas.
- API `createSalonService` / `createSalonPhoto` остават в `businessOnboarding.ts` за бъдеща админ.
- 1 нов unit тест за пълния flow (общо 31).

## Решения
- Услуги и снимки **не** се създават при onboarding — owner-ът ще ги управлява отделно.
- Цените в EUR ще влязат в админ панела за услуги (не в onboarding).
- PDF + квалифициран е-подпис (Borica/Evrotrust) — следваща фаза; UI е placeholder.

## Как се тества
```bash
npm test
npm run dev
# Login → /business/onboarding
# 1. Фирма (ЕИК + имена)
# 2. Обект (име, град, адрес, email, телефон)
# 3. Условия → Продължи
# 4. Подпиши и завърши → екран „Готово!“
```
