# ChefFlow AI

> Decide what to cook today in under 60 seconds.

**ChefFlow AI** is a personalized meal planner and shopping assistant that generates a daily meal plan, missing grocery shopping list, budget-aware analysis, and smart ingredient substitutions — all based on your time, pantry, and dietary preferences.

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
| **Dynamic Model Fetching** | Connect to any OpenAI-compatible API to dynamically query and select from available models |
| **Smart Grocery List** | Auto-generates a missing items checklist with tap-to-check-off |
| **Ingredient Substitutions** | Suggests alternatives when grocery items are unavailable |
| **Export Options** | Copy plan as plain text or download as a `.txt` file |

## 🖥️ Live Demo

Deployed on Vercel — [View Live](https://chefflow-ai.vercel.app)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 (semantic, accessible) |
| **Styling** | Vanilla CSS with custom properties / design tokens |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **Design System** | "Frost" — animated mesh canvas, glassmorphism, earthy/sage tones |
| **Typography** | Inter, Outfit, Dancing Script, Space Mono (Google Fonts) |
| **Deployment** | Vercel |

No build tools, no bundlers, no external library dependencies. Just open `index.html` and it works.

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Live server (or python `http.server`) for local development

### Running Locally

```bash
# Clone the repository
git clone git@github.com:abhishek421/chefflow-ai.git
cd chefflow-ai

# Option 1: Open directly
open index.html

# Option 2: Use Python's built-in HTTP server
python3 -m http.server 8000

# Option 3: Use Node.js serve package
npx serve .
```

---

## 📁 Project Structure

```
chefflow-ai/
├── index.html          # Main HTML — all 4 screens (landing, form, loader, results)
├── style.css           # Complete "Frost" design system + all component styles
├── app.js              # Model fetching, LLM schema parser, form wizard, rendering
├── design.md           # "Frost" style reference — tokens, typography, components
├── deploy.md           # Deployment instructions for Vercel, Netlify, and GitHub Pages
├── AGENTS.md           # Guide for developer AI assistants working on this repo
└── README.md           # You are here
```

---

## 🏗️ Architecture

The app is a single-page application with four screens, managed by a simple screen-swapping system:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│ Constraints  │────▶│   Loader     │────▶│   Results    │
│   (Hero)     │     │   (Form)     │     │ (Processing) │     │ (Dashboard)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                      3-step wizard        Terminal-style        Budget card
                      Budget/People        log animation         Meal cards
                      Diet/Time            LLM execution         Grocery list
                      Pantry tags          Fallback retry        Substitutions
```

### Constraint Engine & LLM Generation

The meal planner uses dynamic OpenAI-compatible LLM queries with robust fallbacks:

1. **API Credentials**: Reads the custom Base URL, API Key, and Model selection from Step 1.
2. **API Execution**:
   - **Attempt 1 (Strict JSON Schema)**: Attempts to query the model with a rigid `response_format` JSON schema matching the strict response structure.
   - **Attempt 2 (JSON Object Fallback)**: If Attempt 1 fails (due to model/endpoint limitations like Ollama or older models rejecting strict JSON schemas), it catches the error and retries with a standard `json_object` format request.
3. **Pantry Analysis**: Compares generated meal plan ingredients against user pantry items to automatically strike out matching items and set their cost contribution to zero.
4. **Budget Feasibility**: Compares the estimated grocery list cost to the daily budget, updating the dashboard status badges.

---

## 🎨 Design System — "Frost"

The visual identity follows the **Frost** design system documented in [`design.md`](design.md):

- **Theme:** Translucent warm theme with animated mesh canvas
- **Surfaces:** Progressive blur / glassmorphism via `backdrop-filter`
- **Accent:** Warm Teal (`#3a7d77`) for interactive elements only
- **Typography:** 4-font system — Inter (body/ui), Outfit (headings), Dancing Script (cursive accent), Space Mono (monospace code/logs)
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
vercel --prod
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>© 2026 ChefFlow AI.</strong> Built with maximum control & premium simplicity.
</p>
