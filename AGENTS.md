# AGENTS.md — AI Coding Assistant Guide

> Context and conventions for AI agents working on the ChefFlow AI codebase.

## Project Overview

**ChefFlow AI** is a client-side meal planner that generates personalized daily meal plans with grocery lists and budget analysis. It is a zero-dependency, static web application — no frameworks, no bundlers, no server-side logic.

## File Map

| File | Purpose | Lines |
|---|---|---|
| `index.html` | All UI markup — 4 screens (landing, form, loader, results) | ~385 |
| `style.css` | Complete CSS — design tokens, components, layouts, responsive, extra sections | ~1420 |
| `app.js` | All logic — dynamic model fetching, LLM integration, schema fallback, rendering, export | ~935 |
| `design.md` | "Frost" design system style reference — color tokens, typography, radii, blur levels | ~90 |
| `deploy.md` | Deployment guide — Vercel, Netlify, GitHub Pages, and local hosting | ~50 |

## Architecture

### Screen System

The app uses a simple screen-swapping pattern. Only one screen is visible at a time via the `.active` class:

```
showScreen(screenElement)  →  removes .active from all screens, adds to target
```

Screens: `#landing-screen` → `#form-screen` → `#loader-screen` → `#results-screen`

### Constraint Engine & LLM Generation

The core logic is in the `generateMealPlan()` function (`app.js`). Instead of hardcoded database files, it queries an OpenAI-compatible API (Base URL, API Key, Model choice) dynamically.

1. **Prompt Construction**: It builds a prompt detailing constraints (number of people, budget limit, dietary preference, prep time, and current pantry ingredients).
2. **API Execution**:
   - **Attempt 1 (Strict JSON Schema)**: Attempts to query the model with a rigid `response_format` JSON schema matching the strict response structure.
   - **Attempt 2 (JSON Object Fallback)**: If Attempt 1 fails (due to model/endpoint limitations like Ollama or older models rejecting strict JSON schemas), it catches the error and retries with a standard `json_object` format request.
3. **Pantry Analysis**: Compares generated meal plan ingredients against user pantry items to automatically strike out matching items and set their cost contribution to zero.
4. **Budget Feasibility**: Compares the estimated grocery list cost to the user's daily budget, updating the dashboard status badges.

## Coding Conventions

### HTML
- Semantic HTML5 elements (`<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`)
- Accessibility attributes: `role`, `aria-*`, `aria-live`, `aria-describedby`
- All interactive elements have unique `id` attributes
- Form validation uses native browser form constraints enhanced by custom JS validation

### CSS
- **Design tokens via CSS custom properties** — all colors, spacing, typography, radii are tokenized in `:root`
- **No utility classes** — use semantic class names (`.form-card`, `.meal-card`, `.budget-status-card`)
- **BEM-like naming** — `.budget-card-header`, `.comparison-bar-fill`, `.btn-primary-action`
- **Glassmorphism pattern** — `backdrop-filter: blur()` with semi-transparent backgrounds
- **Responsive** — `clamp()` for display type, media queries for layout breakpoints
- **Animations** — `@keyframes floatUp`, `spin` for screen elements and loaders

### JavaScript
- **Vanilla ES6+** — no frameworks, no modules, no imports, no external bundlers
- **DOM caching** — all `getElementById` calls are cached at the module level
- **Event delegation** — used for dynamic elements (tags, grocery checkboxes)
- **No global pollution** — only `userPantry` and `currentGeneratedPlan` represent global state
- **Async/await** — used in the loading sequence for sequential log display and API calls

### Design System ("Frost")
- Read `design.md` before making visual changes — it contains complete color token definitions, font sizing specs, and strict guidelines
- **Primary accent: Warm Teal (`#3a7d77`)** — for active borders, focus outlines, and primary buttons
- **Background: Animated Mesh Gradient** — moving background overlay blending Sage Green, Soft Peach, Cream White, and Pale Ice Blue
- **Cards** — use `rgba(255, 255, 255, 0.15)` backgrounds with `backdrop-filter: blur(16px)`

## Common Tasks

### Modifying the LLM Output Schema

To update the structured JSON returned by the AI, modify the `schema` object defined inside the `generateMealPlan()` function in `app.js`. Remember to update the prompt description rules accordingly.

### Adding a New Screen

1. Add a `<section id="new-screen" class="screen">` to `index.html`
2. Cache the element with `getElementById` in `app.js`
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
2. Walk through the landing page sections (About, Features)
3. Click "Start Planning" to go to the preferences form
4. Test API configuration (Base URL, API Key, Model fetching, Custom Model fallback toggle)
5. Generate a meal plan and verify budget visual comparison bar
6. Test pantry tags addition/removal
7. Test copy and download export functionality
8. Check responsive layout at mobile breakpoints
