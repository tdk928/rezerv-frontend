# rezerv-frontend

React SPA за платформата **REZERV** (онлайн резервации за салони за красота).
Говори САМО с `rezerv-gateway` (`:8080`) през `/api/**`.

## Стек

- React 19 + Vite + TypeScript (strict)
- Tailwind CSS v4 (theme токени в `src/index.css`)
- TanStack Query (server state), React Router, react-hook-form + zod
- Vitest + React Testing Library

## Стартиране

```bash
npm install
npm run dev        # http://localhost:5173 (proxy /api → gateway :8080)
npm test           # unit тестове
npm run build      # type-check + production build
npm run lint       # oxlint
```

В dev режим Vite proxy препраща `/api` към gateway-а (`GATEWAY_URL` env override,
default `http://localhost:8080`) — така не е нужна CORS конфигурация.

## Структура

```
src/api/            HTTP клиент + API функции (договори с gateway)
src/auth/           auth context (access token САМО в паметта)
src/components/ui/  общи UI компоненти (Button)
src/features/<x>/   feature-специфични схеми/компоненти
src/pages/          route страници
```

## Документация

- `docs/PROJECT_LOG.md` — индекс на всички завършени branches (паметта на repo-то)
- `docs/branches/` — подробно обобщение per branch
- Git workflow: `feature/* → development → test → master`
- Общият план на проекта: `../REZERV.md`
