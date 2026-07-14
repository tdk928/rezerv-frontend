# PROJECT_LOG — rezerv-frontend

> Паметта на repo-то. Всеки завършен бранч добавя 1 ред НАЙ-ОТГОРЕ в таблицата
> + подробен файл в `docs/branches/<номер>-<branch-name>.md`.
> AI агентът чете този файл в началото на всяка задача.

| # | Бранч | Обобщение |
|---|-------|-----------|
| 3 | feature/home-search-salons | Home page: hero + unified search (услуга + град с localStorage), категорийни плочки, топ салони от API. Нови страници `/salons` (резултати) и `/salons/:id` (детайл + услуги; „Запази" disabled). 4 нови unit теста. |
| 2 | feature/session-persistence-dark-ui | Session persistence (refresh token в sessionStorage + restore при reload) и sliding session (+15 мин на клик, throttle 1/мин); logout; нова ТЪМНА тема (черен фон + gradient blue→violet→pink→orange, utilities text-gradient/bg-gradient-brand); sticky Navbar (Rezerv лого → /, Вход/Регистрация/Изход); HomePage на "/" с AI hero снимка; login/register редиректват към "/". 19 unit теста. |
| 1 | feature/auth-login-registration | Scaffold (React 19 + Vite + TS strict + Tailwind v4 + TanStack Query + RHF/zod + Vitest) + login/registration страници срещу rezerv-cas през gateway (Vite proxy /api→:8080), auth context (token само в паметта), /status страница (черен екран логнат/не логнат), 15 unit теста. Refresh flow още няма. |
