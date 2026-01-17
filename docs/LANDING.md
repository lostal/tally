# Landing Page Documentation

This document describes the Tally marketing website built with Astro.

## Overview

The landing page is a single-page marketing site built with Astro for optimal performance and SEO. It features sophisticated animations, a custom design system, and is deployed independently from the main Next.js application.

**Location**: `apps/landing/`
**URL**: `paytally.app` (production) / `localhost:4321` (development)
**Build Output**: Static HTML, CSS, and JavaScript

## Tech Stack

| Technology   | Version | Purpose                          |
| ------------ | ------- | -------------------------------- |
| Astro        | 5.1.0   | Static site framework            |
| Tailwind CSS | 4.0.0   | Utility-first styling            |
| GSAP         | 3.12.0  | Animation engine (ScrollTrigger) |
| Lenis        | 1.1.0   | Smooth scrolling                 |
| SplitType    | 0.3.4   | Text character splitting         |
| TypeScript   | 5.7.0   | Type safety                      |

## Directory Structure

```
apps/landing/
├── src/
│   ├── components/
│   │   └── Marquee.astro        # Scrolling marquee component
│   ├── layouts/
│   │   └── Layout.astro         # Base layout with animations
│   ├── pages/
│   │   └── index.astro          # Landing page
│   └── styles/
│       └── globals.css          # Global styles + design tokens
├── public/
│   └── favicon.svg              # Favicon
├── astro.config.mjs             # Astro configuration
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── .env.example                 # Environment template
```

## Design System

### Color Palette (OKLCH)

The landing uses a custom organic color palette defined in `src/styles/globals.css`:

**Brand Colors** (Food-inspired):

- `--color-cream`: Background/neutral light
- `--color-warm-black`: Text/neutral dark
- `--color-tomato`: Primary red
- `--color-basil`: Green accent
- `--color-carrot`: Orange accent
- `--color-yolk`: Yellow accent
- `--color-kale`: Dark green
- `--color-blueberry`: Blue accent
- `--color-beet`: Purple accent
- `--color-espresso`: Dark brown

**Neutral Palette**:

- `--color-stone-100` through `--color-stone-900`: 8-shade neutral scale

**Why OKLCH?** Perceptually uniform color space for consistent visual weight across hues.

### Typography Scale

**Fonts**:

- **Sans-serif**: Inter (body text, UI elements)
- **Serif**: Lora (headlines, emphasis)

**Scale** (Fluid with `clamp()`):

- `.text-display`: Hero titles (64px-144px)
- `.text-hero`: Section headers (48px-96px)
- `.text-headline`: Subsections (32px-64px)
- `.text-body-large`: Large body (20px-24px)
- `.text-body`: Standard body (16px-18px)

### Layout Utilities

- `.section`: Full viewport height section wrapper
- `.section-half`: 50vh section
- `.container`: Max-width container (1200px)
- `.container-narrow`: Narrow container (800px)

## Animation System

The landing uses a sophisticated animation system built on GSAP ScrollTrigger.

### Core Libraries

**GSAP (GreenSock Animation Platform)**:

- Primary animation engine
- ScrollTrigger plugin for scroll-based animations
- High-performance timeline-based animations

**Lenis**:

- Smooth scrolling with custom easing
- Integrated with GSAP ticker for synchronized animations
- Lag smoothing for performance

**SplitType**:

- Splits text into individual characters for letter-by-letter animations
- Used in hero title reveal

### Data Attributes

Animations are controlled via data attributes on HTML elements:

| Attribute             | Purpose             | Values/Examples                                |
| --------------------- | ------------------- | ---------------------------------------------- |
| `data-animate`        | Animation type      | `fade-up`, `fade-in`, `scale-in`, `slide-left` |
| `data-speed`          | Parallax speed      | `0.3`, `0.4`, `0.5` (multiplier)               |
| `data-rotate`         | Rotation animation  | `true` (rotates on scroll)                     |
| `data-mouse-parallax` | Cursor tracking     | `0.5`, `1.0` (intensity)                       |
| `data-stagger`        | Stagger children    | `true` (animates children in sequence)         |
| `data-split-text`     | Character splitting | `true` (splits text for animation)             |
| `data-magnetic`       | Magnetic hover      | `true` (button follows cursor)                 |
| `data-reveal`         | Clip-path reveal    | `true` (reveals with clip animation)           |
| `data-counter`        | Number animation    | `100`, `50`, `10` (target number)              |
| `data-suffix`         | Counter suffix      | `%`, `+`, `k` (appended to number)             |
| `data-delay`          | Animation delay     | `0.2`, `0.5` (seconds)                         |

### Example Usage

```astro
<!-- Fade up on scroll -->
<section data-animate="fade-up">
  <h2>Title</h2>
</section>

<!-- Parallax element -->
<div data-speed="0.5">
  <p>Slower scrolling content</p>
</div>

<!-- Staggered children -->
<div data-stagger="true">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Animated counter -->
<span data-counter="100" data-suffix="%">0%</span>
```

### Custom Features

**Rotating Hero Word**:

- Cycles through 3 words: "tally.", "divide.", "pay."
- 3-second interval with fade transition

**Custom Cursor**:

- Follows mouse position
- Adapts color based on element underneath
- Disabled on touch devices (`@media (hover: none)`)

**Scroll Progress Indicator**:

- Visual progress bar as user scrolls
- Updates in real-time via GSAP ticker

**Accessibility**:

- All animations disabled when `prefers-reduced-motion` is set
- Graceful degradation to static content

## Page Structure

The landing (`src/pages/index.astro`) consists of:

1. **Hero Section**: Rotating word animation + value prop
2. **Statement Section**: Mission statement with parallax
3. **Marquee Section**: Scrolling keywords
4. **How It Works**: 3-step process cards
5. **Color Statement**: Visual emphasis block
6. **Features Section**: 3 key benefits grid
7. **Color Palette**: Brand color showcase
8. **CTA Section**: Final call-to-action
9. **Footer**: Minimal links + contact

All sections use semantic `<section>` tags with animation attributes.

## Development

### Commands

```bash
# Install dependencies (from root)
pnpm install

# Start dev server
pnpm dev:landing              # Runs on localhost:4321

# Build for production
pnpm build:landing            # Output: apps/landing/dist/

# Preview production build
pnpm preview:landing

# Type checking
cd apps/landing && pnpm check
```

### Environment Variables

Create `apps/landing/.env`:

```bash
PUBLIC_APP_URL=http://localhost:3000  # Link to main app (dev)
# PUBLIC_APP_URL=https://app.paytally.app  # Production
```

**Note**: Astro environment variables prefixed with `PUBLIC_` are exposed to the client.

## Deployment

### Build Output

```bash
pnpm build:landing
```

Output: `apps/landing/dist/` (static HTML/CSS/JS)

### Hosting Options

The landing can be deployed to any static hosting service:

- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop or Git integration
- **Cloudflare Pages**: Fast global CDN
- **AWS S3 + CloudFront**: Custom infra
- **GitHub Pages**: Free hosting

### Production Checklist

- [ ] Set `PUBLIC_APP_URL` to production app URL
- [ ] Update `astro.config.mjs` site URL if needed
- [ ] Test all links to main app
- [ ] Verify animations work (disable browser motion settings)
- [ ] Check sitemap.xml generation
- [ ] Test mobile responsiveness
- [ ] Validate accessibility (screen readers, keyboard nav)
- [ ] Run Lighthouse audit (target 90+ scores)

## Configuration Files

### `astro.config.mjs`

```javascript
export default defineConfig({
  site: 'https://paytally.app', // For sitemap generation
  integrations: [sitemap()], // Auto-generates sitemap.xml
  vite: {
    plugins: [tailwindcss()], // Tailwind CSS v4 integration
  },
  prefetch: {
    prefetchAll: true, // Prefetch all links
    defaultStrategy: 'viewport', // Prefetch when in viewport
  },
  output: 'static', // Static HTML output
  server: {
    port: 4321,
    host: true, // Expose to network
  },
});
```

### `package.json`

```json
{
  "name": "@tally/landing",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

## Best Practices

### Performance

- ✅ **Static Output**: No server required, instant loads
- ✅ **Prefetching**: Links prefetched when in viewport
- ✅ **Font Optimization**: Google Fonts preconnected
- ✅ **Animation Performance**: GSAP uses `will-change` CSS hints
- ✅ **Smooth Scroll**: Lenis optimized for 60fps

### Accessibility

- ✅ **Semantic HTML**: Proper heading hierarchy, landmarks
- ✅ **Reduced Motion**: Respects user preference
- ✅ **Keyboard Nav**: All interactive elements focusable
- ✅ **Meta Tags**: SEO-friendly titles and descriptions

### Code Organization

- ✅ **Component Isolation**: Reusable Astro components
- ✅ **Design Tokens**: Centralized in `globals.css`
- ✅ **TypeScript**: Type-safe configuration
- ✅ **File-based Routing**: Conventional Astro structure

## Future Improvements

### Recommended Enhancements

1. **Modularize Animations**:
   - Extract animation logic from `Layout.astro` into `src/lib/animations/`
   - Create separate modules: `scrollAnimations.ts`, `parallax.ts`, `cursor.ts`

2. **Config File**:
   - Create `src/config/animations.ts` for magic numbers
   - Centralize timings, speeds, thresholds

3. **Error Handling**:
   - Add null checks to DOM queries
   - Graceful fallbacks for missing elements

4. **Content Collections**:
   - If expanding to multi-page, use Astro Content Collections
   - Markdown-based content management

5. **Testing**:
   - Add E2E tests (Playwright)
   - Visual regression testing

### Scaling Considerations

**Current**: Perfect for single landing page (5/5)

**For Multi-Page Site**: Would require:

- Content collections for pages
- Component library expansion
- Shared layout system
- Navigation component

**For Full Marketing Site**: Would require:

- Headless CMS integration
- Blog functionality
- Form handling
- Analytics integration

## Troubleshooting

### Animations Not Working

1. Check browser console for GSAP errors
2. Verify `data-animate` attribute is set correctly
3. Ensure ScrollTrigger is registered in Layout.astro
4. Check if `prefers-reduced-motion` is enabled

### Build Errors

1. Run `pnpm check` to verify TypeScript errors
2. Check Astro version compatibility
3. Clear `.astro` cache: `rm -rf apps/landing/.astro`
4. Reinstall dependencies: `pnpm install --force`

### Slow Performance

1. Disable animations temporarily to isolate issue
2. Check for large images (compress/optimize)
3. Review custom cursor implementation (expensive on low-end devices)
4. Use Chrome DevTools Performance tab to profile

## References

- [Astro Documentation](https://docs.astro.build)
- [GSAP ScrollTrigger](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Lenis Smooth Scroll](https://github.com/studio-freight/lenis)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [OKLCH Color Space](https://oklch.com)

---

**Last Updated**: 2026-01-17
**Maintained By**: Álvaro Lostal
