# HORNIFIER Landing Page

A self-contained static HTML landing page for HORNIFIER, a JUCE 8 VST3/AU/Standalone horn-physics character coloration plugin.

## What This Is

This directory contains a hand-off package for the HORNIFIER landing page:
- **Purpose**: Showcase the plugin, demonstrate before/after audio, and drive signups/purchases
- **Target**: Integration into the doremi-biz Next.js website (see `INTEGRATION.md`)
- **Format**: Static HTML + CSS + JavaScript (no build step required for preview)
- **Preview**: `open -a Safari web/landing/index.html` (macOS)

## File Structure

```
web/landing/
├── index.html          # Main landing page (another agent owns this)
├── styles.css          # Page styles (another agent owns this)
├── app.js              # Interactive features: A/B player, FAQ toggle, etc. (another agent owns this)
├── config.js           # Config: checkout/trial URLs, analytics (another agent owns this)
├── README.md           # This file
├── INTEGRATION.md      # Next.js integration brief for doremi-biz
└── assets/
    ├── logo.png        # 1024×1024 square horn icon (existing)
    ├── og.png          # 1200×630 social card (generated)
    ├── screenshot-1.png   # Full plugin UI (existing)
    ├── screenshot-2.png   # Horn close-up detail (existing)
    ├── demo-dry.mp3    # Before-coloration audio (placeholder)
    └── demo-wet.mp3    # After-coloration audio (placeholder)
```

## Before Launch

Complete these steps before the page goes live:

1. **Lemon Squeezy URLs** (`config.js`)
   - Fill in `CHECKOUT_URL` (e.g., `https://horni.lemonsqueezy.com/checkout/...`)
   - Fill in `TRIAL_URL` (link to the hosted trial build or downloadable bundle)

2. **A/B Audio Demo**
   - Replace `assets/demo-dry.mp3` with a real before-coloration recording
   - Replace `assets/demo-wet.mp3` with the same audio after HORNIFIER processing
   - Both should be roughly 8–10 seconds, 44.1 kHz, stereo, MP3

3. **Social Card** (optional, if og.png looks placeholder-ish)
   - Replace `assets/og.png` with a proper 1200×630 design
   - Current version: horn logo centered-left on dark background
   - Use for meta tags: `<meta property="og:image" content="...og.png">`

4. **Screenshots** (if UI changes)
   - Update `assets/screenshot-1.png` (full editor UI)
   - Update `assets/screenshot-2.png` (detail shot)

## How to Preview

### From This Directory

```bash
cd /Users/amiryassin/gemProjs_macstudio_snapshotted/HORNIFIER
open -a Safari web/landing/index.html
```

Then interact with:
- Horn geometry sliders (updates visual)
- Preset buttons (Klipschorn, WE-15A, etc.)
- A/B audio player (dry vs. wet demo)
- "Start Free Trial" and "Buy Now" buttons (open Lemon Squeezy overlay)
- FAQ accordion (toggle)

### What to Test

- [ ] Page loads without JavaScript errors (check Safari console)
- [ ] Horn visual updates as you adjust geometry sliders
- [ ] A/B audio player loads and plays both tracks
- [ ] "Buy Now" button opens Lemon Squeezy checkout
- [ ] "Start Free Trial" link downloads or navigates correctly
- [ ] All preset buttons work
- [ ] FAQ items expand/collapse
- [ ] Responsive layout (test on mobile)

## Next Step: Integration

See `INTEGRATION.md` for the hand-off to the next agent who will port this into the doremi-biz Next.js site.

---

**Generated:** 2026-06-08  
**Branch:** `feat/landing-page`  
**Owner (this doc):** Claude Code (Developer role)  
**Owner (HTML/CSS/JS):** Another agent (do not modify)
