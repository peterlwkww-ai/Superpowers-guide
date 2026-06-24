# Mobile Responsive Design Spec

**Date:** 2026-06-24
**Project:** Superpowers Guide (`C:\Users\peter\Documents\superpowers-guide`)

## Goal

Make the Superpowers Guide web UI fully responsive across phone, tablet, and desktop. No new dependencies, no build step — pure CSS media queries added to the existing `styles.css`.

---

## Breakpoints

| Tier | Width | Scope |
|---|---|---|
| Phone | ≤ 480px | All mobile adaptations |
| Tablet | 481px – 768px | 2-column grid, nav single row |
| Desktop | 769px+ | Current styles unchanged |

---

## Changes by Component

### 1. Navigation

**HTML change:** Move `<button id="lang-toggle">` from `.nav-right` into `.nav-left` so the lang toggle stays on row 1 with the logo on phone.

**Phone (≤ 480px) — two rows:**
- Row 1: back link + logo + lang toggle (`.nav-left` fills full width)
- Row 2: search bar full width (`.nav-right` wraps to 100% width)

CSS changes:
- `#nav`: add `flex-wrap: wrap`, reduce padding to `10px 12px`
- `.nav-left`: add `flex: 1`
- `.nav-right` at ≤ 480px: `flex: 0 0 100%`, search input fills 100% width

**Tablet & desktop:** Nav stays single row, no change.

---

### 2. Scenario Grid

| Tier | `grid-template-columns` |
|---|---|
| Phone (≤ 480px) | `1fr` |
| Tablet (481–768px) | `repeat(2, 1fr)` |
| Desktop (769px+) | `repeat(3, 1fr)` — current, unchanged |

---

### 3. Main Container Padding

| Tier | `#main` padding |
|---|---|
| Phone (≤ 480px) | `16px 12px` |
| Tablet+ | `24px` — current, unchanged |

---

### 4. Skill Header

**Phone (≤ 480px):**
- `.skill-header`: `flex-direction: column`
- `.skill-header-right`: `width: 100%` so copy block spans full width below description

**Tablet & desktop:** Current side-by-side layout unchanged.

---

### 5. Phases Grid

**Phone (≤ 480px):**
- `.phases-grid`: `grid-template-columns: 1fr` (single column)

**Tablet & desktop:** Current 2-column layout unchanged.

---

## Files Changed

| File | Change |
|---|---|
| `public/index.html` | Move `lang-toggle` button from `.nav-right` to `.nav-left` |
| `public/styles.css` | Add responsive media queries at bottom of file |

---

## Out of Scope

- Touch gestures or swipe navigation
- Mobile-specific animations
- App manifest / PWA / installable app
- Font size scaling beyond what media queries provide

---

## Testing

After implementation, verify on these screen widths in browser DevTools:
- 375px (iPhone SE)
- 430px (iPhone Pro Max)
- 768px (iPad)
- 1280px (desktop)

Golden path per width:
1. Home page — scenario grid columns correct
2. Nav — lang toggle and search in correct rows on phone
3. Scenario walkthrough — steps readable, copy blocks full width
4. Skill detail — copy block stacks below description on phone
5. All skills page — skill items readable, descriptions not truncated
6. Search — results readable at all widths
