# Design System Documentation

## Philosophy: Warm Minimalism

Tally uses a "Warm Minimalism" aesthetic - clean, uncluttered interfaces with warm, approachable colors that feel trustworthy for payment experiences.

## Typography

| Use               | Font Family  | Variable       |
| ----------------- | ------------ | -------------- |
| Body text         | Inter        | `--font-sans`  |
| Headlines, prices | Lora (serif) | `--font-serif` |

## Color System

### Light Mode (Default)

```css
--background: #fafaf8 /* Warm white */ --foreground: #1a1815 /* Near black */ --card: #ffffff
  /* Pure white */ --primary: #2d2a26 /* Dark brown */ --secondary: #f0eeeb /* Light beige */
  --muted: #e8e6e3 /* Muted gray */ --destructive: #8b4513 /* Sienna */ --border: #e0ddd9
  /* Subtle border */;
```

### Dark Mode

```css
--background: #1a1815 /* Near black */ --foreground: #f5f4f2 /* Off white */ --card: #242220
  /* Dark card */ --primary: #f5f4f2 /* Off white */ --secondary: #2d2a26 /* Dark brown */
  --muted: #3d3a36 /* Muted dark */ --destructive: #d4a574 /* Warm tan */ --border: #3d3a36
  /* Dark border */;
```

## Border Radius

| Token          | Value   |
| -------------- | ------- |
| `--radius-sm`  | 0.5rem  |
| `--radius-md`  | 0.75rem |
| `--radius-lg`  | 1rem    |
| `--radius-xl`  | 1.25rem |
| `--radius-2xl` | 1.5rem  |

## Utility Classes

```css
.container-app    /* Centered container with padding */
.hover-subtle     /* Subtle hover background */
.press-scale      /* Scale down on press */
.touch-target     /* Min 48px for touch */
.font-serif       /* Serif font */
.tabular-nums     /* Tabular number alignment */
```

## Animations

### Built-in

```css
.animate-fade-in    /* Opacity 0→1, 300ms */
.animate-slide-up   /* Slide up + fade, 400ms */
```

### Motion (Framer)

Use `motion/react` for complex animations with these defaults:

- Duration: 0.3-0.4s
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## Component Patterns

### Buttons

Primary buttons use `bg-primary text-primary-foreground` with rounded-xl.

### Cards

Cards use `bg-card rounded-2xl border shadow-sm` for elevation.

### Inputs

Form inputs use `border-2 rounded-xl h-11` with focus ring.

### Touch Targets

All interactive elements: minimum 48px height/width.

## Responsive Breakpoints

Following TailwindCSS defaults:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Accessibility

- Focus visible with ring-2 ring-offset-2
- Color contrast: WCAG AA minimum
- Reduced motion: respect `prefers-reduced-motion`
