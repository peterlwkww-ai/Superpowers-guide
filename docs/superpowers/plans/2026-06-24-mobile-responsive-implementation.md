# Mobile Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Superpowers Guide web UI fully responsive across phone (≤480px), tablet (481–768px), and desktop (769px+) using pure CSS media queries.

**Architecture:** Two files change: `public/index.html` moves the lang-toggle button from `.nav-right` to `.nav-left` so CSS can keep it on row 1 on mobile; `public/styles.css` gains a `/* ── Responsive ──` section at the bottom with two `@media` blocks. No JavaScript changes, no new dependencies.

**Tech Stack:** Vanilla CSS media queries, HTML restructure only.

## Global Constraints
- No new dependencies, no build step
- Must not break existing `node test.js` — all 5 checks must still pass
- Viewport meta tag already present in `index.html` — do not add a second one

---

## File Map

| File | Change |
|---|---|
| `public/index.html` | Move `<button id="lang-toggle">` from inside `.nav-right` to inside `.nav-left` |
| `public/styles.css` | Add responsive media queries section at the bottom |

---

## Task 1: HTML Restructure — Move lang-toggle to nav-left

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Confirm current nav structure**

```bash
cd C:/Users/peter/Documents/superpowers-guide
cat public/index.html
```

Confirm the nav currently looks like this:
```html
<nav id="nav">
  <div class="nav-left">
    <span id="nav-back"></span>
    <a href="#/" class="nav-logo">⚡ Superpowers Guide</a>
  </div>
  <div class="nav-right">
    <button id="lang-toggle" class="lang-btn">繁中</button>
    <input type="text" id="search-input" class="search-input" placeholder="🔍  Search skills, scenarios…" autocomplete="off">
  </div>
</nav>
```

- [ ] **Step 2: Move lang-toggle into nav-left**

Edit `public/index.html` — replace the nav block with:
```html
<nav id="nav">
  <div class="nav-left">
    <span id="nav-back"></span>
    <a href="#/" class="nav-logo">⚡ Superpowers Guide</a>
    <button id="lang-toggle" class="lang-btn">繁中</button>
  </div>
  <div class="nav-right">
    <input type="text" id="search-input" class="search-input" placeholder="🔍  Search skills, scenarios…" autocomplete="off">
  </div>
</nav>
```

- [ ] **Step 3: Run tests to verify nothing broke**

```bash
node test.js
```

Expected:
```
✓ scenarios.json valid — 7 scenarios, all steps valid
✓ skills.json valid — 13 skills, all fields present
✓ GET / returns 200 with #main
✓ GET /data/scenarios.json returns 200
✓ GET /data/skills.json returns 200

All tests passed.
```

- [ ] **Step 4: Commit**

```bash
git add public/index.html
git commit -m "refactor: move lang-toggle to nav-left for responsive layout"
```

---

## Task 2: Add Responsive CSS

**Files:**
- Modify: `public/styles.css`

- [ ] **Step 1: Append the responsive section to the end of styles.css**

Add to the very end of `public/styles.css`:

```css
/* ── Responsive ── */
@media (max-width: 480px) {
  #nav {
    flex-wrap: wrap;
    padding: 10px 12px;
    gap: 8px;
  }
  .nav-left { flex: 1; }
  .nav-right { flex: 0 0 100%; }
  .search-input { width: 100%; }
  #main { padding: 16px 12px; }
  .scenario-grid { grid-template-columns: 1fr; }
  .skill-header { flex-direction: column; }
  .skill-header-right { width: 100%; }
  .phases-grid { grid-template-columns: 1fr; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .scenario-grid { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 2: Run tests**

```bash
node test.js
```

Expected: all 5 checks pass (CSS changes do not affect server responses).

- [ ] **Step 3: Verify at 375px (iPhone SE)**

Open http://localhost:3000 in Chrome. Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M) → set width to 375px. Hard-refresh (Ctrl+Shift+R).

- [ ] Home: scenario cards show 1 per row, full width
- [ ] Nav row 1: back span + logo + 繁中 button visible together
- [ ] Nav row 2: search bar spans full width below
- [ ] Click "🧠 Designing a feature" — steps readable, copy blocks full width
- [ ] Click `/superpowers:brainstorming` skill tag — skill detail: copy block stacked below description
- [ ] Click "Browse all 13 skills →" — skill names and descriptions readable, not clipped
- [ ] Type "debug" in search — results visible and readable

- [ ] **Step 4: Verify at 430px (iPhone Pro Max)**

Resize DevTools width to 430px, repeat same checks as Step 3.

- [ ] **Step 5: Verify at 768px (iPad)**

Resize DevTools width to 768px:

- [ ] Scenario grid shows 2 columns
- [ ] Nav is a single row (logo + 繁中 + search all in one line)
- [ ] Skill header shows copy block to the right of description (side-by-side)
- [ ] Phases grid shows 2 columns

- [ ] **Step 6: Verify at 1280px (desktop)**

Resize DevTools width to 1280px:

- [ ] Scenario grid shows 3 columns
- [ ] Nav single row, identical to pre-change desktop appearance
- [ ] Skill header side-by-side
- [ ] Phases grid 2 columns

- [ ] **Step 7: Test language toggle at 375px**

While DevTools is at 375px, click 繁中:

- [ ] Page re-renders in Traditional Chinese
- [ ] Nav row 1 still correct (logo + EN button)
- [ ] Nav row 2 search placeholder updates to Chinese (🔍  搜尋技能、情境…)
- [ ] Click EN to switch back — English restored

- [ ] **Step 8: Commit**

```bash
git add public/styles.css
git commit -m "feat: add responsive CSS for phone and tablet breakpoints"
```

---

## Task 3: Push to GitHub

- [ ] **Step 1: Push**

```bash
git push
```

Expected output: `master -> master` push confirmation.
