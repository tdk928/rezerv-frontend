# 4-feature-business-onboarding-ui

## Цел
B2B onboarding UI — 4-стъпков wizard за регистрация на фирма, салон, услуга и снимка
през protected business API + refresh на JWT след assign в CAS.

## Направено
- **`/business/onboarding`** — wizard (фирма → салон → услуга → снимка), изисква login.
- **`api/businessOnboarding.ts`** — `createCompany`, `createSalon`, `createSalonService`, `createSalonPhoto`
  с `Authorization: Bearer` през gateway.
- **`postAuth`** в `api/http.ts` за authenticated POST заявки.
- **`AuthContext.refreshSession()`** — explicit refresh след company create (нов JWT с `companyId` + `BUSINESS_OWNER`).
- **`RequireAuth`** — guard + login redirect с `state.from`.
- Navbar: **„Регистрирай фирма“** за логнати users без `companyId`.
- Zod schemas за формите; услуга/снимка могат да се пропуснат.
- 6 нови unit теста (общо 29).

## Решения
- След `POST /api/business/companies` business вика CAS assign; frontend **refresh-ва token-а**
  преди стъпка „Салон“, за да JWT включва `companyId` (gateway headers за бъдещи protected calls).
- User с вече зададен `companyId` вижда съобщение „Вече имате фирма“.
- Demo photo URL default: `https://picsum.photos/800/600` (лесно за dev).

## Как се тества
```bash
npm test
npm run dev
# 1. Регистрация/login
# 2. Navbar → „Регистрирай фирма“ или /business/onboarding
# 3. Попълни ЕИК (напр. 131529327), салон, по избор услуга/снимка
# 4. /status → companyId и BUSINESS_OWNER в roles
```

## API (през gateway)

| Step | POST | Body |
|------|------|------|
| 1 | `/api/business/companies` | `{ eik, name, legalName }` |
| 2 | `/api/business/companies/{id}/salons` | `{ name, cityId, address, ... }` |
| 3 | `/api/business/salons/{id}/services` | `{ categoryId, name, durationMin, price }` |
| 4 | `/api/business/salons/{id}/photos` | `{ url }` |

След стъпка 1: `POST /api/auth/refresh` (автоматично от UI).
