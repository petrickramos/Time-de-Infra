---
name: interface-design
description: |
  Generate high-quality, visually distinctive user interfaces for web apps,
  dashboards, admin panels, and interactive tools. Use when building frontends
  to create professional, unique designs instead of generic AI-generated UIs.
  NOT for landing pages or marketing sites — focused on functional applications.
version: 1.0.0
date: 2026-03-11
---

# Interface Design

Create unique, high-quality interfaces for web applications. This skill
transforms generic AI-generated UIs into polished, professional designs.

## When to Use

- Building a dashboard or admin panel
- Creating a web application interface
- Designing interactive tools or products
- Any functional UI (NOT landing pages or marketing sites)

## Design Process

### Step 1: Understand the User
Before writing any code, answer:
- **Who is this human?** (role, expertise level, context)
- **What are they trying to do?** (primary task, workflow)
- **How should they feel?** (precise but warm? clinical? playful?)

### Step 2: Establish Design Direction
Choose a direction that makes the interface feel intentional:
- **Color Palette**: Pick 1 primary + 1 accent + neutrals. Use HSL for control.
  Avoid generic Bootstrap/Material colors.
- **Typography**: Choose a specific font stack. Google Fonts recommended.
  Never use system defaults without intention.
- **Density**: How much information per screen? Dense like a terminal, or spacious like a notebook?
- **Personality**: What real-world object does this feel like? (lab notebook, artisan toolkit, control room)

### Step 3: Patterns to Reject

Reject these generic AI patterns:
- ❌ Plain colored cards with emoji icons
- ❌ Generic blue/green/red color schemes
- ❌ Rounded rectangles everywhere with no hierarchy
- ❌ Default font stacks without intention
- ❌ Centered content with excessive whitespace
- ❌ "Dashboard" that's just a grid of stat cards

### Step 4: Build with Intention

Apply these principles:
- **Visual hierarchy**: Most important content is most prominent
- **Consistent spacing**: Use a spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- **Interactive feedback**: Hover states, active states, transitions
- **Data visualization**: Use charts/graphs instead of raw numbers when appropriate
- **Micro-animations**: Subtle transitions that make the UI feel alive (200-300ms)

## CSS Architecture

### Design Tokens
Always start with CSS custom properties (design tokens):

```css
:root {
  /* Colors */
  --color-primary: hsl(220, 60%, 50%);
  --color-primary-hover: hsl(220, 60%, 45%);
  --color-accent: hsl(35, 90%, 55%);
  --color-bg: hsl(220, 15%, 8%);
  --color-surface: hsl(220, 15%, 12%);
  --color-text: hsl(220, 10%, 90%);
  --color-text-muted: hsl(220, 10%, 55%);

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Component Patterns
Build reusable component classes:
- `.card` — container with surface color and shadow
- `.btn` — button with hover/active states
- `.input` — form input with focus ring
- `.badge` — status indicator
- `.stat` — numerical display with label

## Dark Mode First

Default to dark mode. Light mode as secondary option.
Dark backgrounds reduce eye strain for dashboard/tool use cases.

## Responsive Design

- Mobile-first media queries
- Use CSS Grid for layouts, Flexbox for components
- Collapsible sidebars on mobile
- Touch-friendly target sizes (min 44x44px)

## Quality Checklist

Before delivering a UI:
- [ ] Custom color palette (not generic)
- [ ] Intentional typography (not defaults)
- [ ] Hover/focus states on all interactive elements
- [ ] Consistent spacing using design tokens
- [ ] Visual hierarchy is clear
- [ ] No emoji as icons (use SVG or icon library)
- [ ] Responsive on mobile
- [ ] Smooth transitions on state changes
