# REZERV — Дизайн система (v2 · Liquid Glass, 2026-07-17)

> Единствен източник на истина. При промяна — обнови и `.cursor/rules/design-system.mdc`.

## 1. Философия (Apple Liquid Glass)

Базирано на [Apple Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)
(iOS 26 / macOS Tahoe): **прозрачен материал** с blur + refraction върху съдържанието.
Glass е **функционален слой** (навигация, контроли, карти) — не запълва целия екран.

- **Светла тема** с цветен ambient фон (violet / cyan / pink / orange mesh).
- **Стъклени панели** (`glass` / `glass-strong`): blur 28–40px, saturate, тънък бял border, мека сянка.
- **Концентрични заобляния**: карти `rounded-3xl` (24px), бутони **pill** `rounded-full`.
- **Accent**: Apple system blue `#0071e3` — solid primary, не rainbow gradient върху бутони.
- **Типография**: SF Pro / `-apple-system` (системният Apple стек — нарочно за Liquid look).
- **Български текст**, дати `dd.MM.yyyy`.

## 2. Цветове (`src/index.css` `@theme`)

| Токен | Стойност | Употреба |
|-------|----------|----------|
| `surface` | `#f5f5f7` | База (под mesh) |
| `card` | `rgb(255 255 255 / 0.62)` | Полупрозрачни карти |
| `line` | `rgb(0 0 0 / 0.08)` | Фини бордери |
| `ink` | `#1d1d1f` | Основен текст |
| `ink-secondary` | `#6e6e73` | Labels |
| `ink-muted` | `#86868b` | Placeholder |
| `brand` | `#0071e3` | Primary / links / focus |
| `brand-soft` | `rgb(0 113 227 / 0.12)` | Soft tint |
| `success` / `warning` / `danger` | `#30d158` / `#ff9f0a` / `#ff453a` | Статуси |

## 3. Utilities

- `glass` — стандартен frosted panel (навигация, карти, форми)
- `glass-strong` — по-плътно стъкло (auth card, модали)
- `glass-tint` — лек blue tint за selected / highlight
- `text-gradient` — само за декоративни акценти (рядко)
- `text-gradient-soft` — почти ink за секции
- `bg-gradient-brand` — subtle blue fill за primary (не rainbow)

`body` има fixed multi-radial mesh — **не го махай**; glass-ът „пие“ тези цветове.

## 4. Компоненти

- **Button**: `rounded-full`, primary = brand blue; secondary = glass + border; ghost = transparent.
- **Navbar**: sticky floating `glass` bar, без тежък `border-b`.
- **AuthCard / forms**: `glass-strong` + `rounded-3xl`; inputs pill-ish `rounded-2xl` на `bg-white/70`.
- **SalonCard / tiles**: `glass`, hover леко scale/shadow.
- **Tables** (admin): glass container, чисти редове, status pills.

## 5. Do / Don't

**Do:** стъкло за chrome; щедър whitespace; pill CTA; контраст ink върху glass.

**Don't:** тъмна/violet theme; rainbow primary бутони; плоски сиви карти без blur;
смесване на dark+liquid; твърде много стъкло едно върху друго (glass-on-glass).

## 6. Accessibility

Уважавай `prefers-reduced-transparency` (в CSS — по-плътен фон, без blur).
Тествай четимост върху пъстри участъци от mesh фона.
