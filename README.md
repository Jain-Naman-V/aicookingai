# CookList AI

> Decide what to cook today in under 60 seconds.

**CookList AI** is a personalized meal planner and shopping assistant that generates a daily meal plan, missing grocery shopping list, budget-aware analysis, and smart ingredient substitutions — all based on your time, pantry, and dietary preferences.

![Built with](https://img.shields.io/badge/Built_with-HTML%2C_CSS%2C_JS-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)

---

## 🎯 Problem Statement

**Challenge: A cooking to-do list**

Build a simple AI micro-app that helps a user generate a personal cooking to-do list based on their day.

- A structured meal planning flow that produces:
  - Breakfast/Lunch/Dinner plan
  - Grocery list
  - Substitutions
  - Budget feasibility logic

---

## ✨ Features

| Feature | Description |
|---|---|
| **Budget-Aware Planning** | Set a daily budget (₹10–₹10,000) and get meals that fit within your limit |
| **Dietary Preferences** | Supports Vegetarian, Vegan, and Non-Vegetarian meal plans |
| **Time Constraints** | Choose 15, 30, or 60-minute prep time limits per meal |
| **Pantry Integration** | Add ingredients you already have at home to reduce grocery costs |
| **Smart Grocery List** | Auto-generates a missing items checklist with tap-to-check-off |
| **Ingredient Substitutions** | Suggests alternatives when grocery items are unavailable |
| **Export Options** | Copy plan as plain text or download as a `.txt` file |

## 🖥️ Live Demo

Deployed on Vercel — [View Live](https://cooklist-ai.vercel.app)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 (semantic, accessible) |
| **Styling** | Vanilla CSS with custom properties / design tokens |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **Design System** | "Air" — sky canvas, frosted glass, glassmorphism |
| **Typography** | Inter, Oswald, Dancing Script, Space Mono (Google Fonts) |
| **Deployment** | Vercel |

No build tools, no bundlers, no dependencies. Just open `index.html` and it works.

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension for local development

### Running Locally

```bash
# Clone the repository
git clone git@github.com:abhishek421/cooklist-ai.git
cd cooklist-ai

# Option 1: Open directly
open index.html

# Option 2: Use Python's built-in HTTP server
python3 -m http.server 8080

# Option 3: Use VS Code Live Server
# Right-click index.html → "Open with Live Server"
```

---

## 📁 Project Structure

```
cooklist-ai/
├── index.html          # Main HTML — all 4 screens (landing, form, loader, results)
├── style.css           # Complete "Air" design system + all component styles
├── app.js              # Constraint engine, recipe DB, form wizard, rendering
├── design.md           # "Air" style reference — tokens, typography, components
├── .gitignore          # Standard ignores (node_modules, .env, IDE files)
└── README.md           # You are here
```

## 🏗️ Architecture

The app is a single-page application with four screens, managed by a simple screen-swapping system:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│ Constraints  │────▶│   Loader     │────▶│   Results    │
│   (Hero)     │     │   (Form)     │     │ (Processing) │     │ (Dashboard)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                      3-step wizard        Terminal-style        Budget card
                      Budget/People        log animation         Meal cards
                      Diet/Time                                  Grocery list
                      Pantry tags                                Substitutions
```

### Constraint Engine

The meal planner uses a local recipe database (`RECIPES_DB`) with a constraint-matching algorithm:

1. **Filter** recipes by dietary preference and cooking time
2. **Select** one recipe per meal slot (breakfast, lunch, dinner) with random variety
3. **Diff** required ingredients against the user's pantry to build the grocery list
4. **Calculate** estimated cost with pantry discount (up to 70% savings)
5. **Generate** substitutions for missing ingredients from recipe metadata

No API calls — everything runs client-side for instant results.

---

## 🎨 Design System — "Air"

The visual identity follows the **Air** design system documented in [`design.md`](design.md):

- **Theme:** Light with sky canvas (`#426188`) background
- **Surfaces:** Progressive blur / glassmorphism via `backdrop-filter`
- **Accent:** Action Blue (`#1a6fe8`) for interactive elements only
- **Typography:** 4-font system — Inter (body), Oswald (display), Dancing Script (decorative), Space Mono (terminal)
- **Spacing:** 4px base unit, comfortable density
- **Elevation:** Minimal shadows, surface color differentiation + blur

---

## 🌐 Deployment

The app is deployed on [Vercel](https://vercel.com) as a static site — no server-side configuration needed.

To deploy your own:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

<p align="center">
  <strong>© 2026 CookList AI.</strong> Built with maximum control & premium simplicity.
</p>
