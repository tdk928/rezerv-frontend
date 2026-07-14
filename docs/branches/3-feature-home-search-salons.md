# 3-feature-home-search-salons

## Цел
Home page с реално съдържание от rezerv-business: търсачка, категорийни плочки,
топ салони в избрания град. Страници за списък с резултати и детайл на салон.

## Направено
- **`src/api/business.ts`** + `get()` в `http.ts` — клиент за публичните business ендпойнти.
- **`useCityPreference`** — запомня избрания град в `localStorage` (default: София).
- **Home page** (`/`): hero „Запази час за минути", unified search (услуга + град),
  категорийни плочки с икони (lucide-react), „Топ салони в {град}", секция „Как работи".
- **`/salons`** — списък с резултати (URL params: `cityId`, `categoryId`, `q`).
- **`/salons/:id`** — детайл на салон: галерия, инфо, услуги по категории; бутон
  „Запази" е disabled (booking идва в следваща фаза).
- **Тестове**: HomePage (2), SalonsPage (2); актуализирани LoginPage и AuthContext
  тестове; `localStorage` mock в `test/setup.ts`.
- **Зависимост**: `lucide-react` за икони на категориите.

## Решения
- Градът не е wizard стъпка — dropdown в търсачката + запомняне; категориите са
  главният 1-клик вход (водят към `/salons?categoryId=&cityId=`).
- Salon detail е включен, защото картите вече линкват към `/salons/:id` — иначе
  кликът води до 404.
- „Запази" е видим, но disabled до rezerv-booking фазата.

## Как се тества
```bash
# backend + gateway трябва да вървят
npm run dev
# http://localhost:5173 — home с категории и салони
# кликни „Масаж" → /salons?categoryId=...&cityId=...
# кликни карта → /salons/:id с услуги
npm test
```

## За frontend-а / бекенда
Ползва: `GET /api/business/public/cities`, `/categories`, `/salons`, `/salons/{id}`.
Демо данни: 6 салона (3 в София, по 1 в Пловдив/Варна/Бургас).
