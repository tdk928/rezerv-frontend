# 1 — feature/auth-login-registration

## Цел

Първоначален setup на rezerv-frontend + login/registration страници, които след
успешен вход редиректват към минимална status страница (черен екран, текст
логнат/не логнат).

## Направено

- **Repo setup:** `.gitignore`, `.vscode/` (settings + препоръчани extensions),
  `.cursor/rules/` (scope-discipline, code-style, design-system, branch-docs),
  `docs/PROJECT_LOG.md`, branches `main`/`test`/`development`.
- **Scaffold:** Vite + React 19 + TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`,
  theme токени по REZERV.md §5.2 в `src/index.css`), TanStack Query, React Router 7,
  react-hook-form + zod, Vitest + React Testing Library.
- **Dev proxy:** gateway-ът няма CORS → Vite proxy `/api` → `http://localhost:8080`
  (override с env `GATEWAY_URL`).
- `src/api/http.ts` — fetch клиент + `ApiError` по единния формат на грешките (§2.6).
- `src/api/auth.ts` — `login()` / `register()` по договора на rezerv-cas
  (`POST /api/auth/login`, `POST /api/auth/register`, `AuthResponse` с
  `accessToken`/`refreshToken`/`expiresInSeconds`/`user`).
- `src/auth/AuthContext.tsx` — access token + user САМО в паметта (React 19 `use()`).
- `src/components/ui/Button.tsx` — общ бутон (primary/secondary/ghost/danger).
- Страници: `/login`, `/register` (zod валидация, БГ съобщения, показва server грешки
  като `INVALID_CREDENTIALS`/`EMAIL_ALREADY_EXISTS`), `/status` (черен екран:
  „Логнат си като <име> (<email>)" / „Не си логнат"). `/` редиректва към `/login`.

## Решения

- **Refresh token-ът НЕ се съхранява/ползва** — бекендът го връща в JSON body
  (не httpOnly cookie, както е по план в REZERV.md §2.2). Refresh flow не беше
  поискан за този бранч; ще се реши при имплементацията му (вероятно бекендът
  трябва да мине към httpOnly cookie).
- Redirect-ът след login/register е `/status` (временна страница за тестове;
  ще се замени с реалната начална страница).
- При refresh на браузъра сесията се губи (token само в паметта) — очаквано,
  докато няма refresh flow.

## Как се тества

- `npm test` — 15 unit теста (zod схеми, LoginPage, RegisterPage, StatusPage;
  API-то е mock-нато).
- Ръчно: infra (`docker compose up -d` в `../infra`) + rezerv-cas + rezerv-gateway,
  после `npm run dev` → http://localhost:5173. Dev login: `admin@rezerv.bg` / `admin123`.
- Проверено end-to-end в браузър: валидации, грешна парола (401), успешен login,
  регистрация на нов потребител, `/status` без сесия.
