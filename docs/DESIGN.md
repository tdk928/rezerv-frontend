# REZERV — Дизайн система (v1.1, 2026-07-17)

> Това е ЕДИНСТВЕНИЯТ източник на истина за визуалния стил. Когато собственикът каже
> „направи ми екран", екранът се прави по този документ без допълнителни обяснения.
> При промяна на дизайна — обнови ТОЗИ файл + `.cursor/rules/design-system.mdc`.

## 1. Философия

- **Тъмно, но меко:** дълбок indigo/violet фон (не чисто `#000`), върху който
  „светят“ gradient акценти (синьо → лилаво → розово → оранжево) + леки ambient
  светлинки на `body`.
- **Шарени заглавия, спокоен текст:** gradient за лого/hero/`text-gradient-soft`
  за секции; body текст остава светъл, без rainbow на параграфи.
- **Едри, меки форми:** карти `rounded-2xl`, бутони/inputs `rounded-lg`.
- **Български текст**, дати `dd.MM.yyyy`, 24h.

## 2. Цветове (`src/index.css` `@theme`)

| Токен | Стойност | Употреба |
|-------|----------|----------|
| `surface` | `#0c0a14` | Фон на страницата |
| `card` | `#181526` | Карти |
| `line` | `#342e45` | Бордери |
| `ink` | `#faf8ff` | Основен текст |
| `ink-secondary` | `#c4b5d4` | Labels, вторичен текст |
| `ink-muted` | `#8b7a9e` | Placeholder |
| `brand` | `#c084fc` | Links, focus |
| `brand-soft` | `#241536` | Error/info кутии |

Gradient: blue `#60a5fa` → violet `#c084fc` → pink `#f472b6` → orange `#fb923c`.

## 3. Utilities

- `text-gradient` — пълен rainbow (лого, hero)
- `text-gradient-soft` — violet→pink (секционни заглавия, auth subtitle)
- `bg-gradient-brand` — primary бутони

`body` има fixed radial ambient glow (violet/blue/pink) — не го презаписвай с
плоско `bg-surface` на layout, освен ако нарочно искаш „глух“ екран.

## 4–8.

Компоненти, layout, loading, do/don't — както досега: `Button`, `AuthCard`,
`Navbar`, mobile-first, без хардкоднат hex в className, без светла/бяла тема.
