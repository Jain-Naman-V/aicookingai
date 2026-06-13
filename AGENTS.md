# AGENTS.md — AI Coding Assistant Guide

> Context and conventions for AI agents working on the CookList AI codebase.

## Project Overview

**CookList AI** is a client-side meal planner that generates personalized daily meal plans with grocery lists and budget analysis. It is a zero-dependency, static web application — no frameworks, no bundlers, no server-side logic.

## File Map

| File | Purpose | Lines |
|---|---|---|
| `index.html` | All UI markup — 4 screens (landing, form, loader, results) | ~290 |
| `style.css` | Complete CSS — design tokens, components, layouts, responsive | ~1076 |
| `app.js` | All logic — recipe DB, constraint engine, form wizard, rendering, export | ~696 |
| `design.md` | "Air" design system reference — tokens, typography, components, do's/don'ts | ~265 |

## Architecture

### Screen System

The app uses a simple screen-swapping pattern. Only one screen is visible at a time via the `.active` class:

```
showScreen(screenElement)  →  removes .active from all screens, adds to target
```

Screens: `#landing-screen` → `#form-screen` → `#loader-screen` → `#results-screen`

### Constraint Engine

The core logic is in the `generateMealPlan()` function (app.js). It:
1. Filters `RECIPES_DB` by diet and cooking time
2. Randomly selects one recipe per meal slot
3. Diffs ingredients against user pantry
4. Calculates estimated cost with pantry discount
5. Generates substitution suggestions

### Recipe Database

`RECIPES_DB` is a hardcoded object at the top of `app.js` with keys: `breakfast`, `lunch`, `dinner`. Each recipe has: `name`, `diets[]`, `time`, `costPerPerson`, `ingredients[]`, `substitutions{}`.

## Coding Conventions

### HTML
- Semantic HTML5 elements (`<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`)
- Accessibility attributes: `role`, `aria-*`, `aria-live`, `aria-describedby`
- All interactive elements have unique `id` attributes
- Form validation uses `novalidate` with custom JS validation

### CSS
- **Design tokens via CSS custom properties** — all colors, spacing, typography, radii are tokenized in `:root`
- **No utility classes** — use semantic class names (`.form-card`, `.meal-card`, `.budget-status-card`)
- **BEM-like naming** — `.budget-card-header`, `.comparison-bar-fill`, `.btn-primary-action`
- **Glassmorphism pattern** — `backdrop-filter: blur()` with semi-transparent backgrounds
- **Responsive** — `clamp()` for display type, media queries for layout breakpoints
- **Animations** — `@keyframes fadeIn`, `stepIn`, `spin` for screen transitions

### JavaScript
- **Vanilla ES6+** — no frameworks, no modules, no imports
- **DOM caching** — all `getElementById` calls are at module top level
- **Event delegation** — used for dynamic elements (tags, grocery checkboxes)
- **No global pollution** — only `userPantry` and `currentGeneratedPlan` are global state
- **Async/await** — used in the loading sequence for sequential log display

### Design System ("Air")
- Read `design.md` before making visual changes — it contains complete token definitions, component specs, and strict do's/don'ts
- **Primary accent: Action Blue** — only for interactive elements, never as background fills
- **Background: Sky Canvas `#426188`** — body background with radial gradient overlays
- **Cards** — use `rgba(255, 255, 255, 0.8-0.95)` backgrounds with `backdrop-filter`
- **Shadows** — strictly minimized; prefer surface differentiation

## Common Tasks

### Adding a New Recipe

Add an entry to the appropriate array in `RECIPES_DB` (app.js):

```javascript
{
  name: "Recipe Name",
  diets: ["vegetarian"],       // "vegetarian" | "vegan" | "non-vegetarian"
  time: 30,                     // cooking time in minutes
  costPerPerson: 60,            // estimated cost in ₹ per person
  ingredients: ["Ing 1", "Ing 2"],
  substitutions: { "Ing 1": "Alternative" }
}
```

### Adding a New Screen

1. Add a `<section id="new-screen" class="screen">` to `index.html`
2. Cache the element with `getElementById` in app.js
3. Add it to the `showScreen()` array
4. Style in `style.css` following existing patterns

### Modifying the Design System

1. **Always read `design.md` first** — understand existing tokens and constraints
2. Add new tokens to `:root` in `style.css`
3. Update `design.md` to document any new tokens or components
4. Follow the established naming convention: `--color-*`, `--spacing-*`, `--radius-*`, etc.

## Testing

No automated tests currently. Manual verification:

1. Open `index.html` in a browser
2. Walk through the full flow: Landing → Form (all 3 steps) → Loader → Results
3. Verify budget within/exceeds states with different inputs
4. Test pantry ingredient addition/removal
5. Test export (Copy/Download) functionality
6. Check responsive layout at mobile breakpoints

## Deployment

Static site on Vercel. Any push to the default branch auto-deploys.

No build step — Vercel serves the files directly.
