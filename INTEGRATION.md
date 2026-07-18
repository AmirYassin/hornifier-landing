# HORNIFIER Landing Page → doremi-biz Next.js Integration

**Audience:** The agent who will integrate this landing page into the doremi-biz Next.js website.

**Scope:** Port the self-contained static landing page into the doremi-biz App Router, add i18n, wire Lemon Squeezy, and match design system.

**Timeline estimate:** 4–6 hours (depends on design system familiarity and next-intl setup).

---

## 1. Target Stack

- **Framework:** Next.js 16 App Router (TypeScript)
- **i18n:** `next-intl` (routes: `/en/hornifier`, `/he/hornifier`, `/ar/hornifier`)
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion (for hero, scroll reveals)
- **React:** v19
- **Payment:** Lemon Squeezy (overlay checkout via `window.LemonSqueezy.Url.Open()`)

**Repo root:** `~/gemProjs_macstudio_snapshotted/doremi-biz`

---

## 2. Destination Paths

### Page

```
frontend/src/app/[locale]/hornifier/page.tsx
```

- **Type:** Server Component (RSC)
- **Responsibilities:**
  - Render `<Hornifier>` (composed of Hero, Walkthrough, ABPlayer, Features, HowItWorks, Pricing, FAQ, etc.)
  - Export `generateMetadata()` (Open Graph, Twitter, JSON-LD)
  - Pass `locale` to all child components via context or props

### Components

All new components live in:

```
frontend/src/components/hornifier/
```

**List of components to create:**

| Component | Type | Purpose |
|-----------|------|---------|
| `Hero.tsx` | RSC | Headline, subheading, horn visual/logo, CTA buttons |
| `ABPlayer.tsx` | **Client** | Before/after audio demo with toggle |
| `Walkthrough.tsx` | RSC | Feature walkthrough (3–4 sections with images) |
| `FeatureGrid.tsx` | RSC | 6–8 feature cards (grid layout) |
| `HowItWorks.tsx` | RSC | Step-by-step process (maybe with animation) |
| `PricingCTA.tsx` | RSC | Pricing section with "Buy Now" button area |
| `BuyButton.tsx` | **Client** | Opens Lemon Squeezy checkout overlay |
| `TrialDownload.tsx` | RSC | "Start Free Trial" link/download button |
| `SystemReqs.tsx` | RSC | macOS version, VST3/AU support, CPU/RAM |
| `FAQ.tsx` | **Client** | Accordion (expand/collapse) |
| `FooterCTA.tsx` | RSC | Bottom call-to-action before site footer |

### Assets

Move all assets to the Next.js public folder:

```
frontend/public/hornifier/
├── logo.png            # 1024×1024 square horn icon
├── og.png              # 1200×630 social card
├── screenshot-1.png    # Full UI (plugin editor)
├── screenshot-2.png    # Detail shot (horn close-up)
├── demo-dry.mp3        # Before-coloration audio
└── demo-wet.mp3        # After-coloration audio
```

### Internationalization

Add translations to the existing `next-intl` messages:

```
frontend/messages/
├── en.json   (add Hornifier namespace)
├── he.json   (mirror English for v1)
└── ar.json   (mirror English for v1)
```

**Namespace structure** (within each language file):

```json
{
  "hornifier": {
    "meta": {
      "title": "HORNIFIER — Horn Physics VST Plugin",
      "description": "...",
      "keywords": "vst, au, horn, audio plugin, coloration, ..."
    },
    "hero": {
      "headline": "...",
      "subheading": "...",
      "cta_primary": "Buy Now",
      "cta_secondary": "Start Free Trial"
    },
    "features": {
      "title": "...",
      "items": [ { "title": "...", "description": "..." }, ... ]
    },
    "pricing": { ... },
    "faq": { ... },
    ...
  }
}
```

**v1 approach:** English only for sales copy. He/Ar can mirror English or be marked `[EN-ONLY]` in the message keys.

### Navbar Link

Add to the site's main navigation:

```tsx
// frontend/src/components/Navbar.tsx (or similar)
<Link href={`/${locale}/hornifier`}>
  HORNIFIER
</Link>
```

### Lemon Squeezy Script

Add the Lemon Squeezy embed script to the root layout:

```tsx
// frontend/src/app/[locale]/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://assets.lemonsqueezy.com/lemon.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```

---

## 3. Section → Component Mapping

The original `index.html` has sections with `data-component` attributes. Map each to a React component:

| Section | HTML Selector | Component | Type |
|---------|---------------|-----------|------|
| Header/Logo | `header` | (Navbar, part of layout) | RSC |
| Hero CTA | `section[data-component="hero"]` | `Hero.tsx` | RSC |
| Before/After Audio | `section[data-component="ab-player"]` | `ABPlayer.tsx` | **Client** |
| Walkthrough | `section[data-component="walkthrough"]` | `Walkthrough.tsx` | RSC |
| Features | `section[data-component="features"]` | `FeatureGrid.tsx` | RSC |
| How It Works | `section[data-component="how-it-works"]` | `HowItWorks.tsx` | RSC |
| Pricing + CTA | `section[data-component="pricing"]` | `PricingCTA.tsx` | RSC |
| System Requirements | `section[data-component="system-reqs"]` | `SystemReqs.tsx` | RSC |
| FAQ | `section[data-component="faq"]` | `FAQ.tsx` | **Client** |
| Bottom CTA | `section[data-component="footer-cta"]` | `FooterCTA.tsx` | RSC |

**Client-only components:** `ABPlayer`, `BuyButton`, `FAQ` (need event listeners, state).

---

## 4. Lemon Squeezy Wiring

### Environment Variable

Add to `.env.local`:

```
NEXT_PUBLIC_LS_CHECKOUT_URL=https://horni.lemonsqueezy.com/checkout/...
NEXT_PUBLIC_LS_TRIAL_URL=https://...trial-download-or-landing...
```

### BuyButton Component

```tsx
// frontend/src/components/hornifier/BuyButton.tsx
'use client';

export default function BuyButton() {
  const handleBuy = () => {
    if (typeof window !== 'undefined' && window.LemonSqueezy) {
      window.LemonSqueezy.Url.Open(
        process.env.NEXT_PUBLIC_LS_CHECKOUT_URL
      );
    }
  };

  return (
    <button onClick={handleBuy} className="...">
      Buy Now
    </button>
  );
}
```

### TrialDownload Component

```tsx
// frontend/src/components/hornifier/TrialDownload.tsx
import Link from 'next/link';

export default function TrialDownload() {
  return (
    <Link
      href={process.env.NEXT_PUBLIC_LS_TRIAL_URL!}
      download
      className="..."
    >
      Start Free Trial
    </Link>
  );
}
```

---

## 5. Design System Integration

- **Colors:** Use doremi-biz Tailwind palette (dark theme preferred)
- **Typography:** Font stack from existing site
- **Spacing:** Tailwind's standard scale
- **Breakpoints:** Mobile-first (`sm`, `md`, `lg`, `xl`)
- **Animations:** Framer Motion for reveals/hero (match existing site animations)

**Assumption:** Doremi-biz already has a dark theme; HORNIFIER fits naturally.

---

## 6. Key Decisions & Rationale

### English-Only v1

**Decision:** Sales copy (hero, CTA, pricing) is English-only for launch.

**Rationale:**
- HORNIFIER is a pro audio tool; English is the dominant language in music production.
- Localizing audio marketing copy (metaphors, technical terminology) requires native expertise.
- v2 can add He/Ar once user feedback informs localization priorities.

**Implementation:**
- Hornifier messages in `en.json` have full copy.
- `he.json` and `ar.json` Hornifier namespaces mirror English keys (or use fallback locale in next-intl).
- Layout (Navbar, footer dates, RTL wrapper) still respect user's locale.

### CTAs Outside Animation Path

**Decision:** "Buy Now" and "Start Free Trial" are not animated (no scroll-triggered reveals).

**Rationale:**
- CTA buttons must be immediately clickable and visible; animation delays reduce conversion.
- Use Framer Motion for hero background, feature cards, and testimonials — not CTAs.

### Lemon Squeezy Overlay, Not Modal

**Decision:** Use Lemon Squeezy's built-in overlay, not a custom Next.js modal.

**Rationale:**
- Lemon Squeezy handles payment PCI compliance and hosting.
- Simpler handoff: one `window.LemonSqueezy.Url.Open()` call.
- No custom checkout state to manage.

---

## 7. Definition of Done Checklist

Complete this checklist before marking the HORNIFIER page as shipped:

- [ ] **Build & Route**
  - [ ] Page renders at `/en/hornifier` (Next.js dev server)
  - [ ] Page renders at `/he/hornifier` and `/ar/hornifier` (layout/nav localized)
  - [ ] No console errors; all assets load

- [ ] **Content & Copy**
  - [ ] All hero, feature, and pricing copy visible and readable
  - [ ] Screenshots loaded (screenshot-1.png and screenshot-2.png visible)
  - [ ] Logo/OG image present in public/hornifier/

- [ ] **Interactivity**
  - [ ] A/B audio player loads both demo-dry.mp3 and demo-wet.mp3
  - [ ] Audio player toggle switches between dry/wet
  - [ ] "Buy Now" button opens Lemon Squeezy checkout overlay
  - [ ] "Start Free Trial" link navigates/downloads correctly
  - [ ] FAQ accordion expands and collapses
  - [ ] Preset/geometry controls work (if horn visual included)

- [ ] **Responsive & Accessibility**
  - [ ] Page responsive on mobile (iPhone 12/14, iPad)
  - [ ] Page responsive on desktop (1200px+, 2560px+)
  - [ ] All text readable (contrast, font size)
  - [ ] Links have focus states
  - [ ] Alt text on all images
  - [ ] Heading hierarchy (h1 → h2 → h3)

- [ ] **Performance & SEO**
  - [ ] Lighthouse score ≥90 (Performance, Accessibility, Best Practices)
  - [ ] Open Graph meta tags populate social preview
  - [ ] JSON-LD markup (Product or FAQPage) included
  - [ ] Images optimized (next/image, WebP fallback)

- [ ] **Localization**
  - [ ] `/en/hornifier` shows English
  - [ ] `/he/hornifier` shows Hebrew layout + navbar
  - [ ] `/ar/hornifier` shows Arabic layout + navbar
  - [ ] Sales copy falls back to English if He/Ar not translated

- [ ] **Browser Compatibility**
  - [ ] Works on Safari 15+ (macOS 12+)
  - [ ] Works on Chrome/Edge latest
  - [ ] Works on Firefox latest

- [ ] **Deployment**
  - [ ] Merged to `main` branch
  - [ ] Deployed to staging/preview environment
  - [ ] Smoke-tested on staging
  - [ ] Ready for live deploy

---

## 8. Files to Hand Off

**Source (this repo):**
- `web/landing/index.html`
- `web/landing/styles.css`
- `web/landing/app.js`
- `web/landing/config.js`
- `web/landing/assets/{logo.png, og.png, screenshot-1.png, screenshot-2.png, demo-dry.mp3, demo-wet.mp3}`
- `web/landing/README.md` (this overview)
- `web/landing/INTEGRATION.md` (this file)

**Integration target (doremi-biz):**
- `frontend/src/app/[locale]/hornifier/page.tsx` (new)
- `frontend/src/components/hornifier/*.tsx` (new component suite)
- `frontend/public/hornifier/` (new asset folder)
- `frontend/messages/{en,he,ar}.json` (add Hornifier namespace)
- `.env.local` (add `NEXT_PUBLIC_LS_CHECKOUT_URL`, `NEXT_PUBLIC_LS_TRIAL_URL`)

---

## 9. Example Component Skeleton

### Hero.tsx (Server Component)

```tsx
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import BuyButton from './BuyButton';
import TrialDownload from './TrialDownload';

export default function Hero({ locale }: { locale: string }) {
  const t = useTranslations('hornifier.hero');

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-4xl mx-auto text-center">
        <Image
          src="/hornifier/logo.png"
          alt="HORNIFIER Logo"
          width={200}
          height={200}
          priority
        />
        <h1 className="text-5xl font-bold mt-8 text-white">
          {t('headline')}
        </h1>
        <p className="text-xl text-gray-300 mt-4">
          {t('subheading')}
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <BuyButton />
          <TrialDownload />
        </div>
      </div>
    </section>
  );
}
```

### ABPlayer.tsx (Client Component)

```tsx
'use client';

import { useState } from 'react';

export default function ABPlayer() {
  const [isDry, setIsDry] = useState(true);

  return (
    <section className="py-20 px-6 bg-gray-800">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Hear the Difference
        </h2>
        <div className="flex items-center gap-4 justify-center">
          <button
            onClick={() => setIsDry(true)}
            className={`px-6 py-2 rounded ${
              isDry ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            Before
          </button>
          <audio
            controls
            src={isDry ? '/hornifier/demo-dry.mp3' : '/hornifier/demo-wet.mp3'}
            className="flex-1"
          />
          <button
            onClick={() => setIsDry(false)}
            className={`px-6 py-2 rounded ${
              !isDry ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            After
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

## 10. Quick Start Commands

```bash
# From ~/gemProjs_macstudio_snapshotted/doremi-biz/frontend

# Create the page and component directory
mkdir -p src/app/\[locale\]/hornifier src/components/hornifier

# Copy assets
mkdir -p public/hornifier
cp ../../HORNIFIER/web/landing/assets/* public/hornifier/

# Create page.tsx, then each component file
# (see skeleton examples above)

# Add i18n messages to frontend/messages/{en,he,ar}.json
# (add "hornifier" namespace)

# Run dev server
npm run dev

# Test at http://localhost:3000/en/hornifier
```

---

## Notes for the Integrating Agent

1. **Reference the original HTML as a source of truth** for copy, layout, and feature order. The static version may have details the brief missed.

2. **Test audio on mobile** — some mobile browsers restrict audio autoplay; the player should load gracefully.

3. **Lemon Squeezy rate limits** — if you see CORS errors, check that the API key and product ID are correct in config.js (which the next agent inherits from the static version).

4. **RTL support** — next-intl handles RTL automatically for He/Ar routes; just ensure Tailwind's `dir` attribute is set on the `<html>` element in the root layout.

5. **Presets** — if the horn visual (geometry sliders) is included, it should be a client component that manages horn geometry state via Framer Motion or similar. Not critical for v1 MVP.

---

**Hand-off date:** 2026-06-08  
**Source branch:** `feat/landing-page`  
**Target branch:** doremi-biz main or dev  
**Estimated effort:** 4–6 hours  
**Questions?** Review `web/landing/README.md` for context.
