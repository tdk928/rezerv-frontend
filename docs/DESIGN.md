# REZERV — Дизайн система (v1, 2026-07-14)

> Това е ЕДИНСТВЕНИЯТ източник на истина за визуалния стил. Когато собственикът каже
> „направи ми екран", екранът се прави по този документ без допълнителни обяснения.
> При промяна на дизайна — обнови ТОЗИ файл + `.cursor/rules/design-system.mdc` + REZERV.md §5.2.

## 1. Философия

- **Тъмно + преливащо:** чисто черен фон, върху който „светят" gradient акценти
  (синьо → лилаво → розово → оранжево) — премиум, модерно, в стила на съвременни
  tech брандове. Референция: hero снимката на `/` (`src/assets/hero.png`).
- **Много черно пространство:** съдържанието диша; gradient-ът се ползва пестеливо —
  за лого, ключови заглавия, primary действия. НЕ прави всичко цветно.
- **Едри, меки форми:** карти `rounded-2xl`, бутони/inputs `rounded-lg`. Без остри ъгли.
- **Български текст навсякъде**, дати `dd.MM.yyyy`, 24h.

## 2. Цветове (Tailwind v4 theme токени в `src/index.css`)

| Токен | Стойност | Употреба |
|-------|----------|----------|
| `surface` | `#000000` | Фон на цялата страница (`bg-surface`) |
| `card` | `#101014` | Карти, hover фонове (`bg-card`) |
| `line` | `#27272e` | Бордери/разделители (`border-line`) |
| `ink` | `#f4f4f5` | Основен текст (`text-ink`) |
| `ink-secondary` | `#a1a1aa` | Второстепенен текст, labels |
| `ink-muted` | `#63636e` | Placeholder, disabled |
| `brand` | `#a855f7` | Плътен акцент (links, focus border), hover `#9333ea` |
| `brand-soft` | `#1b1226` | Тъмнолилав фон за error/info кутии |
| `success` | `#34d399` | Успех |
| `warning` | `#fbbf24` | Предупреждение |
| `danger` | `#ef4444` | Грешки (текст И фон на danger бутони) |

Gradient стопове: `grad-blue #3b82f6` → `grad-violet #a855f7` → `grad-pink #ec4899` → `grad-orange #f97316`.

**Правило:** цветовете се реферират САМО през токените (`text-ink`, `bg-card`…),
никога хардкоднат hex в className.

## 3. Gradient utilities (дефинирани в `src/index.css`)

- `text-gradient` — преливащ текст (4 стопа, blue→orange). За: логото „Rezerv",
  главни заглавия на празни/hero екрани, акцент върху 1-2 думи в заглавие.
- `bg-gradient-brand` — преливащ фон (3 стопа, blue→violet→pink). За: primary бутони,
  евентуално тънки декоративни ленти/рамки.

```tsx
<h1 className="text-gradient text-3xl font-extrabold tracking-tight">Rezerv</h1>
<button className="bg-gradient-brand rounded-lg px-4 py-2.5 text-white">Действие</button>
```

## 4. Типография

- Системен sans (Tailwind default). Заглавия: `font-extrabold tracking-tight`
  (лого/hero) или `font-semibold` (секции). Основен текст `text-sm`/`text-base`.
- Лого: „Rezerv" с `text-gradient text-2xl font-extrabold tracking-tight`.

## 5. Компоненти (готови — ползвай ги, не преоткривай)

### Button — `src/components/ui/Button.tsx`

| Variant | Кога |
|---------|------|
| `primary` (gradient фон, бял текст) | Главното действие на екрана (1 на екран) |
| `secondary` (bg-card + border-line, hover border-brand) | Второстепенни действия, Изход |
| `ghost` (прозрачен, hover bg-card) | Третостепенни (напр. „Вход" в navbar) |
| `danger` (bg-danger) | Деструктивни действия |

### Форми — `src/features/auth/AuthCard.tsx` дава шаблона

- Input: `rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink
  placeholder:text-ink-muted focus:border-brand focus:outline-none` (`inputClasses`)
- Label: `mb-1 block text-sm font-medium text-ink-secondary` (`labelClasses`)
- Грешка под поле: `mt-1 text-xs text-danger` (`FieldError`)
- Сървърна грешка: кутия `rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger`
- Централна карта: `w-full max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8`
- react-hook-form + zod (zodResolver), submit бутон с `disabled={isPending}` и
  текст в процес („Влизане…").

### Navbar — `src/components/Navbar.tsx` (вече е на всички страници през Layout)

`sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur`; съдържание в
`mx-auto max-w-6xl px-4 sm:px-6`. Вляво лого → `/`; вдясно Вход/Регистрация (гост)
или име + Изход (логнат).

### Карти/секции

`rounded-2xl border border-line bg-card` — БЕЗ тежки сенки (на черно не се виждат);
дълбочината идва от border + по-светлия фон на картата.

## 6. Layout и responsive

- **Mobile-first.** Пиши стиловете за мобилно, надграждай със `sm:` (640) / `md:` (768) / `lg:` (1024).
- Съдържание в `mx-auto max-w-6xl px-4 sm:px-6`; форми `max-w-md`.
- Страниците се рендерират в `Layout` (navbar + `<Outlet/>`, `flex min-h-screen flex-col`);
  страница, която иска вертикално центриране, ползва `flex-1 items-center justify-center`.
- Скривай второстепенни елементи на мобилно с `hidden sm:inline` (напр. името в navbar).
- Изображения: `w-full rounded-2xl object-cover`.

## 7. Състояния

- Loading: **skeleton loaders** (сиви `bg-card animate-pulse` блокове), не голи спинъри.
  Бутон в процес: `disabled` + текст „…" (напр. „Влизане…").
- Disabled: `opacity-40` (gradient) или `text-ink-muted` + `cursor-not-allowed`.
- Focus на input: `focus:border-brand` (без ring).

## 8. Do / Don't

- ✅ Черен фон навсякъде; gradient само за акценти.
- ✅ Ползвай готовите `Button`, `inputClasses`, `labelClasses`, `FieldError`, `AuthCard` шаблона.
- ❌ Никакви светли фонове, бели карти, сенки `shadow-lg`.
- ❌ Никакъв хардкоднат hex в className; никакви ad-hoc бутони.
- ❌ Не слагай gradient на дълги параграфи/малки labels — нечетимо е.
