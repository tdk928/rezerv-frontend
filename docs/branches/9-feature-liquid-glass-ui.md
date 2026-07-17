# feature/liquid-glass-ui

## Цел
Преминаване на целия frontend към Apple **Liquid Glass** естетика (iOS 26 / macOS Tahoe):
светла стъклена UI върху цветен ambient фон.

## Направено
- Нова дизайн система v2 в `docs/DESIGN.md` + `.cursor/rules/design-system.mdc`
- CSS токени + utilities `glass` / `glass-strong` / `glass-tint` + mesh фон
- Pill `Button`, floating glass `Navbar`, glass `AuthCard` / inputs
- Home, salons, detail, onboarding, my companies, admin — стъклени карти/таблици
- `prefers-reduced-transparency` fallback

## Решения
- Web approximation на Liquid Glass (blur + saturate + refraction via colored mesh), не native SwiftUI `glassEffect`
- Apple system blue `#0071e3` вместо предишния dark purple rainbow
- SF / `-apple-system` нарочно за автентичен Apple look

## Как се тества
```bash
npm test -- --run
npm run dev
```
Отвори `/`, login, `/business/companies`, `/admin/companies` — светло стъкло + mesh фон.
