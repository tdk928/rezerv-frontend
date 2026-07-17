# 7-feature-auth-forms-aligned-top

## Цел
Login и registration формите да започват на едно и също разстояние от navbar-а.

## Направено
- `AuthCard`: `items-center` → `items-start` + фиксиран `pt-10`/`pb-10`.
  По-високата регистрация вече не измества картата нагоре спрямо login.

## Решения
- Вертикалното центриране правеше по-късия login да изглежда по-далеч от navbar-а.
  Top-align с еднакъв padding решава това за всички auth екрани, които ползват `AuthCard`.

## Как се тества
```bash
npm run dev
# Сравни /login и /register — горният ръб на картата трябва да е на еднаква височина
```
