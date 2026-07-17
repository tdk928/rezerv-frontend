# PROJECT_LOG — rezerv-frontend

> Паметта на repo-то. Всеки завършен бранч добавя 1 ред НАЙ-ОТГОРЕ в таблицата
> + подробен файл в `docs/branches/<номер>-<branch-name>.md`.
> AI агентът чете този файл в началото на всяка задача.

| # | Бранч | Обобщение |
|---|-------|-----------|
| 8 | feature/my-companies-admin-panel | `/business/companies` — моите фирми+обекти; `/admin/companies` — всички фирми+owners (PLATFORM_ADMIN). RequireRole + Navbar линкове. |
| 7 | feature/auth-forms-aligned-top | AuthCard: login/register с еднакъв top offset от navbar (`items-start` + `pt-10` вместо вертикално центриране). |
| 6 | feature/onboarding-simplify-terms-sign | Onboarding: фирма → обект → условия → подпис. Махнати услуга/снимка от wizard. „Име на обекта“. Скелет за PDF условия + „Подпиши и завърши“ (без Borica засега). 31 unit теста. |
| 5 | feature/multi-company-ui | Multi-company: „Нова фирма“ винаги за логнати, `companyIds` в user, `switch-company` + `companies/mine` API. Navbar без firm dropdown. Onboarding без блок. 401→logout; StrictMode restore fix. |
| 4 | feature/business-onboarding-ui | B2B onboarding wizard `/business/onboarding` (фирма → салон → услуга → снимка). Protected API calls + `refreshSession` след company create. Navbar „Регистрирай фирма“, RequireAuth guard. 6 нови unit теста (общо 29). |
| 3 | feature/home-search-salons | Home page: hero + unified search (услуга + град с localStorage), категорийни плочки, топ салони от API. Нови страници `/salons` (резултати) и `/salons/:id` (детайл + услуги; „Запази" disabled). 4 нови unit теста. |
| 2 | feature/session-persistence-dark-ui | Session persistence (refresh token в sessionStorage + restore при reload) и sliding session (+15 мин на клик, throttle 1/мин); logout; нова ТЪМНА тема (черен фон + gradient blue→violet→pink→orange, utilities text-gradient/bg-gradient-brand); sticky Navbar (Rezerv лого → /, Вход/Регистрация/Изход); HomePage на "/" с AI hero снимка; login/register редиректват към "/". 19 unit теста. |
| 1 | feature/auth-login-registration | Scaffold (React 19 + Vite + TS strict + Tailwind v4 + TanStack Query + RHF/zod + Vitest) + login/registration страници срещу rezerv-cas през gateway (Vite proxy /api→:8080), auth context (token само в паметта), /status страница (черен екран логнат/не логнат), 15 unit теста. Refresh flow още няма. |
