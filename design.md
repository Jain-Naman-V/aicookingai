# Frost — Style Reference
> animated mesh gradients, frosted glass, earthy neutrals

**Theme:** warm-translucent

Frost's visual system evokes a warm, organic, living experience. It replaces flat backgrounds with an animated mesh gradient in earthy neutrals and warm sunset tones (cream, sand, apricot, terracotta). UI elements become frosted glass panels with progressive blur, creating depth through varying levels of transparency rather than heavy shadows. The single terracotta orange accent color guides interaction with soft glows, while typography combines the technical precision of Inter with the modern, geometric softness of Outfit.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Glass White | `rgba(255, 255, 255, 0.2)` | `--color-glass-white` | Base glass layer (Level 1) |
| Glass Strong | `rgba(255, 255, 255, 0.3)` | `--color-glass-strong` | Elevated glass layer (Level 2/3) |
| Glass Border | `rgba(255, 255, 255, 0.4)` | `--color-glass-border` | Frosted luminous borders |
| Accent | `#e07a5f` | `--color-accent` | Terracotta orange accent for interactive elements |
| Accent Glow | `rgba(224, 122, 95, 0.3)` | `--color-accent-glow` | Hover glows and selection states |
| Text Primary | `#332722` | `--color-text-primary` | Deep espresso brown text |
| Text Secondary| `rgba(51, 39, 34, 0.7)` | `--color-text-secondary`| Muted text |
| Charcoal Text | `#1b1b1b` | `--color-charcoal-text` | Only for rare high-contrast needs |

**Background Mesh Gradient Stops:**
- Rose (Cream): `#fcfaf5` (`--color-rose`)
- Peach (Sand): `#f5deb3` (`--color-peach`)
- Lavender (Apricot): `#f4cca1` (`--color-lavender`)
- Mint (Terracotta): `#e89f71` (`--color-mint`)

## Tokens — Typography

### Control — Functional text across UI elements including buttons, body text, links, and navigation items. Acts as the primary workhorse font for readability. · `--font-control`
- **Substitute:** Inter
- **Weights:** 400, 500, 700

### Control Compressed — Modern geometric sans for headlines, pairing softness with clarity. · `--font-control-compressed`
- **Substitute:** Outfit
- **Weights:** 700, 900

### Control Cursive — Expressive, decorative headlines. · `--font-control-cursive`
- **Substitute:** Dancing Script

### Control TNT — Secondary expressive font for occasional data points. · `--font-control-tnt`
- **Substitute:** Space Mono

## Tokens — Spacing & Shapes

**Base unit:** 4px
**Density:** comfortable

### Border Radius
| Element | Value |
|---------|-------|
| cards | 20px |
| links | 8px |
| inputs | 12px |
| buttons | 9999px (pill) |

## Glass Levels (Surfaces)

The design strongly minimizes shadows, opting instead for progressive background blur (`backdrop-filter`) and varying white opacity to convey depth.

| Level | Background Opacity | Blur | Purpose |
|-------|--------------------|------|---------|
| 0 | `transparent` | None | The animated mesh background layer |
| 1 | `0.05` | `8px` | Subtle overlays, headers, inputs, secondary tags |
| 2 | `0.15` | `16px` | Interactive cards, feature panels |
| 3 | `0.25` | `24px` | Elevated modal forms, primary focal containers |

## Do's and Don'ts

### Do
- Prioritize white text (`#ffffff`) on frosted glass surfaces.
- Use soft, rounded radii (`20px` for cards, `12px` for inputs) to maintain the bubbly, organic feel.
- Implement subtle float and shimmer micro-animations for interactive elements.
- Use glowing borders instead of dark drop shadows to highlight active states.

### Don't
- Do not use solid color backgrounds for cards; always use semi-transparent `rgba` with `backdrop-filter`.
- Avoid heavy, dark drop shadows; use soft, diffused, low-opacity shadows if absolutely necessary.
- Do not use sharp corners (e.g., `0px` or `4px`) for primary UI surfaces.
- Avoid flat, static backgrounds — the environment should feel alive but unobtrusive.

## Agent Prompt Guide

When building new components, apply the correct "Glass Level" utility classes (`.glass-panel-1`, `.glass-panel-2`, `.glass-panel-3`) or replicate their properties.

Example Component Prompts:
1. Create an input field: `background: var(--glass-bg-1)`, `border: 1px solid var(--color-glass-border)`, `border-radius: 12px`, with white text. Focus state should add `box-shadow: 0 0 0 3px var(--color-accent-glow)`.
2. Create a feature card: Use `.feature-card` class which applies Glass Level 2 (`var(--glass-bg-2)`, `blur(16px)`). On hover, increase to `var(--glass-bg-3)` and apply `transform: translateY(-4px)`.
