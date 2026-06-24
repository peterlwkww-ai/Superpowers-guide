# Superpowers Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Node.js/Express web app that serves as a scenario-first reference guide for the superpowers Claude plugin, with guided step-by-step walkthroughs, copy buttons, and live search.

**Architecture:** Express serves `public/` as static files. All routing is hash-based in the browser (`#/`, `#/scenario/:id`, `#/skill/:id`, `#/search?q=`). Content is loaded client-side from `data/*.json` via `fetch()`. Fuse.js handles fuzzy search.

**Tech Stack:** Node.js, Express 4, Fuse.js 7, Vanilla JS/CSS (no build step)

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.js` | Express server, serves `public/` and `data/`, port 3000 |
| `package.json` | Dependencies: express, fuse.js |
| `test.js` | Server startup test + data structure validation |
| `data/scenarios.json` | 7 lifecycle scenarios with full step content |
| `data/skills.json` | 13 skills with commands, descriptions, phases |
| `public/index.html` | SPA shell: nav, `<main id="main">`, script tags |
| `public/styles.css` | All styles, dark GitHub-inspired theme |
| `public/app.js` | State, init, router, all render functions, utilities |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.js`
- Create: `test.js`

- [ ] **Step 1: Write the failing server test**

Create `test.js`:
```javascript
const http = require('http')
const assert = require('assert')
const path = require('path')

// Start server for testing
process.env.PORT = '3001'
const server = require('./index.js')

async function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => resolve({ status: res.statusCode, body }))
    }).on('error', reject)
  })
}

async function runTests() {
  // Give server a moment to start
  await new Promise(r => setTimeout(r, 100))

  const index = await get('http://localhost:3001/')
  assert.strictEqual(index.status, 200, 'GET / should return 200')
  assert.ok(index.body.includes('<div id="main">'), 'index.html should contain #main')
  console.log('✓ GET / returns 200 with #main')

  const scenarios = await get('http://localhost:3001/data/scenarios.json')
  assert.strictEqual(scenarios.status, 200, 'GET /data/scenarios.json should return 200')
  console.log('✓ GET /data/scenarios.json returns 200')

  const skills = await get('http://localhost:3001/data/skills.json')
  assert.strictEqual(skills.status, 200, 'GET /data/skills.json should return 200')
  console.log('✓ GET /data/skills.json returns 200')

  console.log('\nAll tests passed.')
  server.close()
}

runTests().catch(err => {
  console.error('FAIL:', err.message)
  process.exit(1)
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd C:/Users/peter/Documents/superpowers-guide
node test.js
```
Expected: `Error: Cannot find module './index.js'`

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "superpowers-guide",
  "version": "1.0.0",
  "description": "Local reference guide for the superpowers Claude plugin",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "node test.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "fuse.js": "^7.0.0"
  }
}
```

- [ ] **Step 4: Install dependencies**

```bash
cd C:/Users/peter/Documents/superpowers-guide
npm install
```
Expected: `added N packages`

- [ ] **Step 5: Create `index.js`**

```javascript
const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use('/data', express.static(path.join(__dirname, 'data')))
app.use('/vendor', express.static(path.join(__dirname, 'node_modules/fuse.js/dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Superpowers Guide running at http://localhost:${PORT}`)
  }
})

module.exports = server
```

- [ ] **Step 6: Create placeholder `public/index.html`** (will be replaced in Task 2)

```bash
mkdir -p C:/Users/peter/Documents/superpowers-guide/public
mkdir -p C:/Users/peter/Documents/superpowers-guide/data
```

Create `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Superpowers Guide</title></head>
<body><div id="main">Loading…</div></body>
</html>
```

- [ ] **Step 7: Run test — verify it passes**

```bash
node test.js
```
Expected:
```
✓ GET / returns 200 with #main
✓ GET /data/scenarios.json returns 200  ← will fail until data files exist; fix in Task 3
✓ GET /data/skills.json returns 200     ← will fail until data files exist; fix in Task 4
```
Note: tests for data files will fail until Tasks 3 and 4 complete — that is expected.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/peter/Documents/superpowers-guide
git init
git add package.json package-lock.json index.js test.js public/index.html
git commit -m "feat: project scaffold with express server and test harness"
```

---

## Task 2: HTML Shell + CSS

**Files:**
- Modify: `public/index.html`
- Create: `public/styles.css`

- [ ] **Step 1: Replace `public/index.html` with the full SPA shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Superpowers Guide</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <nav id="nav">
    <div class="nav-left">
      <span id="nav-back"></span>
      <a href="#/" class="nav-logo">⚡ Superpowers Guide</a>
    </div>
    <div class="nav-right">
      <input type="text" id="search-input" class="search-input" placeholder="🔍  Search skills, scenarios…" autocomplete="off">
    </div>
  </nav>
  <main id="main">
    <div class="loading">Loading…</div>
  </main>
  <script src="/vendor/fuse.min.js"></script>
  <script src="/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `public/styles.css`**

```css
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --border: #21262d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: #4a9eff;
  --success: #238636;
  --purple: #8957e5;
  --red: #f78166;
  --yellow: #e3b341;
  --code-text: #79c0ff;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* ── Nav ── */
#nav {
  position: sticky;
  top: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 100;
}
.nav-left { display: flex; align-items: center; gap: 12px; }
.nav-logo { font-weight: 700; font-size: 16px; color: var(--text); text-decoration: none; white-space: nowrap; }
.back-link { color: var(--accent); text-decoration: none; font-size: 13px; white-space: nowrap; }
.nav-right { flex: 1; max-width: 400px; margin-left: auto; }
.search-input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
  color: var(--text);
  font-size: 13px;
  outline: none;
}
.search-input:focus { border-color: var(--accent); }

/* ── Main ── */
#main { max-width: 960px; margin: 0 auto; padding: 24px; }

/* ── Hero ── */
.hero { text-align: center; padding: 32px 0 24px; }
.hero h1 { font-size: 24px; font-weight: 700; }
.hero p { color: var(--text-muted); margin-top: 8px; font-size: 14px; }

/* ── Scenario grid ── */
.scenario-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px; }
.scenario-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  text-decoration: none;
  display: block;
  transition: border-color 0.15s;
}
.scenario-card:hover { border-color: var(--accent); }
.scenario-icon { font-size: 28px; }
.scenario-title { font-weight: 600; color: var(--text); margin-top: 8px; font-size: 15px; }
.scenario-desc { color: var(--text-muted); font-size: 12px; margin-top: 4px; line-height: 1.4; }
.scenario-meta { color: var(--accent); font-size: 11px; margin-top: 10px; font-weight: 500; }

/* ── Page footer ── */
.page-footer {
  border-top: 1px solid var(--border);
  padding: 16px 0;
  margin-top: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}
.page-footer a { color: var(--accent); text-decoration: none; }

/* ── Scenario walkthrough page ── */
.scenario-hero { margin-bottom: 24px; }
.scenario-hero-icon { font-size: 36px; }
.scenario-hero h1 { font-size: 22px; font-weight: 700; margin-top: 8px; }
.scenario-hero p { color: var(--text-muted); font-size: 13px; margin-top: 4px; }

.step-block { border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
.step-header { background: var(--surface); padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
.step-number {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px; color: #fff; flex-shrink: 0;
}
.step-title { font-weight: 600; font-size: 14px; }
.step-body { padding: 14px 16px; }
.step-instruction { color: var(--text-muted); font-size: 13px; margin-bottom: 10px; }

/* ── Copy block ── */
.copy-block {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-bottom: 12px;
}
.copy-block code { color: var(--code-text); font-size: 13px; font-family: 'SFMono-Regular', Consolas, monospace; }
.copy-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.1s;
}
.copy-btn:hover { background: var(--border); }

.step-hint {
  background: var(--surface);
  border-left: 3px solid var(--accent);
  border-radius: 0 4px 4px 0;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 8px;
}
.step-hint strong { color: var(--text); font-style: normal; }
.step-expect { color: var(--text-muted); font-size: 12px; margin-top: 8px; }
.step-saves { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; margin-top: 8px; }
.step-saves code { color: var(--code-text); font-size: 12px; font-family: 'SFMono-Regular', Consolas, monospace; }

.next-scenario {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  background: var(--bg);
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px;
}
.next-scenario span { color: var(--text-muted); font-size: 13px; }
.next-scenario a { color: var(--accent); font-weight: 600; font-size: 13px; text-decoration: none; }

/* ── Skill detail ── */
.skill-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.skill-header-left { flex: 1; }
.skill-category { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.skill-name { font-size: 22px; font-weight: 700; margin-top: 4px; }
.skill-desc { color: var(--text-muted); font-size: 13px; margin-top: 6px; }
.skill-header-right { flex-shrink: 0; }

.section-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; margin-top: 16px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; font-size: 12px; }
.tag-link { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; font-size: 12px; color: var(--accent); text-decoration: none; }
.tag-link:hover { border-color: var(--accent); }

.phases-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.phase-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; }
.phase-label { font-size: 11px; font-weight: 600; }
.phase-title { font-size: 13px; font-weight: 600; margin-top: 2px; }
.phase-detail { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* ── Search ── */
.search-summary { color: var(--text-muted); font-size: 13px; margin-bottom: 16px; }
.search-summary strong { color: var(--text); }
.result-group-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; margin-top: 16px; }
.result-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--surface);
  text-decoration: none;
  display: flex; align-items: center; padding: 12px 16px; gap: 12px;
  transition: border-color 0.15s;
}
.result-item:hover { border-color: var(--accent); }
.result-icon { font-size: 20px; flex-shrink: 0; }
.result-command { background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; flex-shrink: 0; }
.result-command code { color: var(--code-text); font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; }
.result-title { font-weight: 600; font-size: 14px; }
.result-desc { color: var(--text-muted); font-size: 12px; margin-top: 2px; }
.result-arrow { margin-left: auto; color: var(--accent); font-size: 12px; flex-shrink: 0; }
.no-results { text-align: center; padding: 48px; color: var(--text-muted); }

/* ── All skills ── */
.skills-page-header { margin-bottom: 24px; }
.skills-page-header h1 { font-size: 22px; font-weight: 700; }
.skills-page-header p { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
.skills-category { margin-bottom: 24px; }
.skills-category-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.skill-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--surface);
  display: flex; align-items: center; padding: 12px 16px; gap: 12px;
  text-decoration: none;
  transition: border-color 0.15s;
}
.skill-item:hover { border-color: var(--accent); }
.skill-item-command { background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; flex-shrink: 0; }
.skill-item-command code { color: var(--code-text); font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; }
.skill-item-name { font-weight: 600; font-size: 14px; }
.skill-item-desc { color: var(--text-muted); font-size: 12px; margin-top: 2px; }

/* ── Utilities ── */
.loading { text-align: center; padding: 48px; color: var(--text-muted); }
.error { text-align: center; padding: 48px; color: var(--red); }
```

- [ ] **Step 3: Start server and verify HTML + CSS load**

```bash
node index.js
```
Open `http://localhost:3000` — expect "Loading…" text on dark background with nav bar visible.

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/styles.css
git commit -m "feat: add SPA shell and complete CSS styles"
```

---

## Task 3: Scenario Data

**Files:**
- Create: `data/scenarios.json`

- [ ] **Step 1: Write failing data validation test**

Add to bottom of `test.js`, before `runTests()`:

```javascript
// Validate scenarios.json structure
function validateScenarios() {
  const fs = require('fs')
  const scenarios = JSON.parse(fs.readFileSync('./data/scenarios.json', 'utf8'))
  assert.ok(Array.isArray(scenarios), 'scenarios must be an array')
  assert.strictEqual(scenarios.length, 7, 'must have exactly 7 scenarios')
  scenarios.forEach((s, i) => {
    assert.ok(s.id, `scenario[${i}] must have id`)
    assert.ok(s.icon, `scenario[${i}] must have icon`)
    assert.ok(s.title, `scenario[${i}] must have title`)
    assert.ok(s.description, `scenario[${i}] must have description`)
    assert.ok(typeof s.skillCount === 'number', `scenario[${i}] must have skillCount`)
    assert.ok(s.estimatedTime, `scenario[${i}] must have estimatedTime`)
    assert.ok(Array.isArray(s.steps), `scenario[${i}] must have steps array`)
    s.steps.forEach((step, j) => {
      assert.ok(step.number, `scenario[${i}].steps[${j}] must have number`)
      assert.ok(step.title, `scenario[${i}].steps[${j}] must have title`)
      assert.ok(step.whatClaudeDoes, `scenario[${i}].steps[${j}] must have whatClaudeDoes`)
    })
  })
  console.log('✓ scenarios.json valid — 7 scenarios, all steps valid')
}
validateScenarios()
```

Run `node test.js` — expect `Error: ENOENT: no such file or directory 'data/scenarios.json'`

- [ ] **Step 2: Create `data/scenarios.json`**

```json
[
  {
    "id": "designing-a-feature",
    "icon": "🧠",
    "title": "Designing a feature",
    "description": "Turn a rough idea into a reviewed spec before a single line of code is written",
    "skillCount": 3,
    "estimatedTime": "~20 min",
    "nextScenario": "building-a-feature",
    "skillIds": ["brainstorming", "writing-plans", "using-git-worktrees"],
    "steps": [
      {
        "number": 1,
        "title": "Start the brainstorming skill",
        "instruction": "Type this in Claude Code:",
        "command": "/superpowers:brainstorming",
        "whatClaudeDoes": "Asks you questions one at a time to understand what you're building — purpose, constraints, success criteria. Proposes 2–3 approaches with trade-offs, then presents a design spec in sections for your approval.",
        "whatToExpect": "3–6 questions about your idea, each narrowing the design. For UI questions, Claude may open a browser to show mockups."
      },
      {
        "number": 2,
        "title": "Answer Claude's questions",
        "instruction": "No command needed — just reply in the terminal.",
        "command": null,
        "whatClaudeDoes": "Asks one question at a time. Proposes 2–3 implementation approaches and asks you to pick one before writing the spec.",
        "whatToExpect": "Claude presents the design spec section by section and asks for approval after each."
      },
      {
        "number": 3,
        "title": "Approve the design spec",
        "instruction": "Review each section and say yes, or ask for changes.",
        "command": null,
        "whatClaudeDoes": "Saves the approved spec to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md, then automatically invokes the writing-plans skill.",
        "whatToExpect": "After approval, Claude transitions to writing an implementation plan broken into 2–5 minute tasks.",
        "saves": "docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md"
      }
    ]
  },
  {
    "id": "building-a-feature",
    "icon": "🚀",
    "title": "Building a feature",
    "description": "Implement with TDD and subagent-driven development — Claude works autonomously through each task",
    "skillCount": 4,
    "estimatedTime": "~45 min",
    "nextScenario": "code-review",
    "skillIds": ["using-git-worktrees", "writing-plans", "subagent-driven-development", "test-driven-development"],
    "steps": [
      {
        "number": 1,
        "title": "Create an isolated workspace",
        "instruction": "Type this in Claude Code:",
        "command": "/superpowers:using-git-worktrees",
        "whatClaudeDoes": "Creates a new git branch and isolated worktree so your feature work won't contaminate the main workspace. Runs project setup and verifies a clean test baseline.",
        "whatToExpect": "A new branch is created. Claude confirms the test baseline is clean before work starts."
      },
      {
        "number": 2,
        "title": "Build with subagent-driven development",
        "instruction": "Type this in Claude Code (after an approved plan exists):",
        "command": "/superpowers:subagent-driven-development",
        "whatClaudeDoes": "Dispatches a fresh subagent per task from your implementation plan. Each task gets a two-stage review: spec compliance first, then code quality. Can run autonomously for an hour or more.",
        "whatToExpect": "Claude works through each task in the plan. You'll see progress updates. It pauses to flag critical issues that need your input."
      },
      {
        "number": 3,
        "title": "TDD is enforced automatically",
        "instruction": "No action needed — this triggers during implementation.",
        "command": null,
        "whatClaudeDoes": "Enforces RED→GREEN→REFACTOR: writes a failing test first, confirms it fails, writes minimal code to pass it, then refactors. Deletes any code written before the test.",
        "whatToExpect": "Every feature gets a test written before implementation. Claude won't commit code that doesn't pass its tests."
      }
    ]
  },
  {
    "id": "debugging",
    "icon": "🐛",
    "title": "Debugging",
    "description": "Find root cause systematically — not by guessing and hoping",
    "skillCount": 2,
    "estimatedTime": "~15 min",
    "nextScenario": "code-review",
    "skillIds": ["systematic-debugging", "verification-before-completion"],
    "steps": [
      {
        "number": 1,
        "title": "Start systematic debugging",
        "instruction": "Type this in Claude Code when you hit a bug:",
        "command": "/superpowers:systematic-debugging",
        "whatClaudeDoes": "Runs a 4-phase root cause process: (1) Observe — reproduce and capture exact symptoms, (2) Hypothesize — list possible causes ranked by likelihood, (3) Verify — test each hypothesis with minimal changes, (4) Fix & confirm — apply minimal fix and verify root cause is resolved.",
        "whatToExpect": "Claude will not propose a fix until it has evidence identifying the root cause. Prevents wasted work from fixing symptoms instead of causes."
      },
      {
        "number": 2,
        "title": "Verify the fix actually works",
        "instruction": "Type this after applying a fix:",
        "command": "/superpowers:verification-before-completion",
        "whatClaudeDoes": "Runs actual verification commands and confirms the output before claiming the bug is fixed. Prevents 'it should work now' without proof.",
        "whatToExpect": "Claude shows you real command output confirming the fix works — not just a claim that it does."
      }
    ]
  },
  {
    "id": "code-review",
    "icon": "👀",
    "title": "Code review",
    "description": "Request and respond to reviews the right way — with technical rigor, not rubber-stamping",
    "skillCount": 2,
    "estimatedTime": "~10 min",
    "nextScenario": "merging-and-shipping",
    "skillIds": ["requesting-code-review", "receiving-code-review"],
    "steps": [
      {
        "number": 1,
        "title": "Request a code review",
        "instruction": "Type this in Claude Code after writing code:",
        "command": "/superpowers:requesting-code-review",
        "whatClaudeDoes": "Runs a pre-review checklist: reviews code against the plan, checks for security issues, correctness bugs, and code quality. Reports findings by severity — CRITICAL blocks progress, HIGH should fix before merge.",
        "whatToExpect": "A structured review report. CRITICAL issues must be fixed before continuing. HIGH issues are flagged but don't block."
      },
      {
        "number": 2,
        "title": "Respond to review feedback",
        "instruction": "Type this after receiving review feedback:",
        "command": "/superpowers:receiving-code-review",
        "whatClaudeDoes": "Processes review feedback with technical rigor — verifies each suggestion is actually correct before implementing. Pushes back on incorrect feedback rather than blindly applying it.",
        "whatToExpect": "Claude confirms which feedback is valid, explains which it disagrees with (and why), and implements accepted changes with verification."
      }
    ]
  },
  {
    "id": "merging-and-shipping",
    "icon": "🔀",
    "title": "Merging & shipping",
    "description": "Wrap up a development branch cleanly — merge, PR, keep, or discard",
    "skillCount": 1,
    "estimatedTime": "~5 min",
    "nextScenario": null,
    "skillIds": ["finishing-a-development-branch"],
    "steps": [
      {
        "number": 1,
        "title": "Finish the development branch",
        "instruction": "Type this when all tasks are complete and tests pass:",
        "command": "/superpowers:finishing-a-development-branch",
        "whatClaudeDoes": "Verifies all tests pass, then presents four options: (1) Merge to main, (2) Open a pull request, (3) Keep the branch for later, (4) Discard the branch. Cleans up the git worktree after your choice.",
        "whatToExpect": "A clear decision point with context on each option. Claude won't merge until it confirms tests are passing."
      }
    ]
  },
  {
    "id": "understanding-a-skill",
    "icon": "📚",
    "title": "Understanding a skill",
    "description": "Deep-dive into any of the 13 superpowers skills — when to use it, how it works, what to type",
    "skillCount": 13,
    "estimatedTime": "self-paced",
    "nextScenario": null,
    "skillIds": [],
    "steps": [
      {
        "number": 1,
        "title": "Browse the skill library",
        "instruction": "Click the link below or search by skill name:",
        "command": null,
        "whatClaudeDoes": "Not applicable — this scenario links directly to the skill browser.",
        "whatToExpect": "All 13 skills listed by category: Planning, Building, Testing, Debugging, Review, Git, Meta.",
        "browseLink": "#/skills"
      },
      {
        "number": 2,
        "title": "Click any skill for full details",
        "instruction": "Each skill page shows:",
        "command": null,
        "whatClaudeDoes": "Not applicable.",
        "whatToExpect": "The slash command to invoke it, when to use it (specific triggers), how it works step-by-step, and which scenarios use it."
      }
    ]
  },
  {
    "id": "writing-a-custom-skill",
    "icon": "✍️",
    "title": "Writing a custom skill",
    "description": "Create your own skills for project-specific workflows — extend superpowers for your domain",
    "skillCount": 1,
    "estimatedTime": "~30 min",
    "nextScenario": null,
    "skillIds": ["writing-skills"],
    "steps": [
      {
        "number": 1,
        "title": "Start the writing-skills guide",
        "instruction": "Type this in Claude Code:",
        "command": "/superpowers:writing-skills",
        "whatClaudeDoes": "Walks you through creating a new skill following superpowers best practices. Covers skill structure, writing clear trigger conditions, and testing methodology including adversarial pressure testing.",
        "whatToExpect": "A guided process for designing, writing, and testing a custom skill. The skill is saved to your ~/.claude/skills/ directory and is immediately available."
      },
      {
        "number": 2,
        "title": "Test the skill",
        "instruction": "No separate command — testing is part of the writing-skills process.",
        "command": null,
        "whatClaudeDoes": "Runs adversarial pressure testing: tries to find prompts that should trigger the skill but don't, and prompts that should not trigger it but do. Iterates until the skill behaves reliably.",
        "whatToExpect": "A skill that triggers consistently in the right situations and stays out of the way when it shouldn't apply."
      }
    ]
  }
]
```

- [ ] **Step 3: Run the validation test**

```bash
node test.js
```
Expected: `✓ scenarios.json valid — 7 scenarios, all steps valid`

- [ ] **Step 4: Commit**

```bash
git add data/scenarios.json test.js
git commit -m "feat: add scenarios data with all 7 lifecycle scenarios"
```

---

## Task 4: Skills Data

**Files:**
- Create: `data/skills.json`

- [ ] **Step 1: Write failing skills validation test**

Add to `test.js` after `validateScenarios()`:

```javascript
function validateSkills() {
  const fs = require('fs')
  const skills = JSON.parse(fs.readFileSync('./data/skills.json', 'utf8'))
  assert.ok(Array.isArray(skills), 'skills must be an array')
  assert.strictEqual(skills.length, 13, 'must have exactly 13 skills')
  skills.forEach((s, i) => {
    assert.ok(s.id, `skill[${i}] must have id`)
    assert.ok(s.name, `skill[${i}] must have name`)
    assert.ok(s.command, `skill[${i}] must have command`)
    assert.ok(s.category, `skill[${i}] must have category`)
    assert.ok(s.description, `skill[${i}] must have description`)
    assert.ok(Array.isArray(s.whenToUse), `skill[${i}] must have whenToUse array`)
  })
  console.log('✓ skills.json valid — 13 skills, all fields present')
}
validateSkills()
```

Run `node test.js` — expect `Error: ENOENT: no such file or directory 'data/skills.json'`

- [ ] **Step 2: Create `data/skills.json`**

```json
[
  {
    "id": "brainstorming",
    "name": "brainstorming",
    "command": "/superpowers:brainstorming",
    "category": "Planning",
    "description": "Turns rough ideas into validated design specs through Socratic dialogue. Questions one at a time, proposes 2–3 approaches, presents design in sections for approval.",
    "whenToUse": [
      "Starting any new feature or project",
      "Before writing any code",
      "Turning a rough idea into a spec",
      "Any time you type 'let's build'"
    ],
    "usedInScenarios": ["designing-a-feature"]
  },
  {
    "id": "writing-plans",
    "name": "writing-plans",
    "command": "/superpowers:writing-plans",
    "category": "Planning",
    "description": "Breaks an approved design spec into bite-sized tasks (2–5 min each). Every task has exact file paths, complete code, and verification steps. No placeholders, no TBDs.",
    "whenToUse": [
      "After brainstorming produces an approved spec",
      "Before implementing a feature",
      "Breaking complex work into trackable tasks"
    ],
    "usedInScenarios": ["designing-a-feature", "building-a-feature"]
  },
  {
    "id": "using-git-worktrees",
    "name": "using-git-worktrees",
    "command": "/superpowers:using-git-worktrees",
    "category": "Git",
    "description": "Creates an isolated git worktree on a new branch so feature work won't contaminate the main workspace. Runs project setup and verifies a clean test baseline before work starts.",
    "whenToUse": [
      "Before starting any feature work",
      "When you need isolation from current workspace",
      "Before executing an implementation plan"
    ],
    "usedInScenarios": ["building-a-feature"]
  },
  {
    "id": "subagent-driven-development",
    "name": "subagent-driven-development",
    "command": "/superpowers:subagent-driven-development",
    "category": "Building",
    "description": "Dispatches a fresh subagent per task from the implementation plan. Each task gets two-stage review: spec compliance first, then code quality. Can run autonomously for hours.",
    "whenToUse": [
      "Executing an implementation plan",
      "After writing-plans completes",
      "For autonomous multi-task implementation"
    ],
    "phases": [
      { "number": 1, "label": "Read spec", "color": "#4a9eff", "detail": "Subagent reads the full implementation plan and the specific task." },
      { "number": 2, "label": "Implement", "color": "#238636", "detail": "Writes code following TDD — test first, then minimal implementation." },
      { "number": 3, "label": "Spec review", "color": "#8957e5", "detail": "Checks: does the implementation match what the plan specified?" },
      { "number": 4, "label": "Quality review", "color": "#e3b341", "detail": "Checks code quality independently — readability, correctness, security." }
    ],
    "usedInScenarios": ["building-a-feature"]
  },
  {
    "id": "executing-plans",
    "name": "executing-plans",
    "command": "/superpowers:executing-plans",
    "category": "Building",
    "description": "Alternative to subagent-driven-development. Executes plan tasks in the current session in batches, with human review checkpoints between batches.",
    "whenToUse": [
      "When you want checkpoints between task batches",
      "Alternative to subagent-driven-development",
      "When you prefer staying in the current session"
    ],
    "usedInScenarios": ["building-a-feature"]
  },
  {
    "id": "dispatching-parallel-agents",
    "name": "dispatching-parallel-agents",
    "command": "/superpowers:dispatching-parallel-agents",
    "category": "Building",
    "description": "Fans out 2+ independent tasks to parallel subagents. Significantly faster than sequential execution when tasks have no shared state or sequential dependencies.",
    "whenToUse": [
      "2+ tasks that can run concurrently",
      "Tasks with no shared state",
      "When sequential execution would be slow"
    ],
    "usedInScenarios": ["building-a-feature"]
  },
  {
    "id": "test-driven-development",
    "name": "test-driven-development",
    "command": "/superpowers:test-driven-development",
    "category": "Testing",
    "description": "Enforces RED→GREEN→REFACTOR cycle. Write failing test first, confirm it fails, write minimal code to pass, refactor. Deletes code written before tests.",
    "whenToUse": [
      "Implementing any feature or bug fix",
      "Auto-triggers during subagent-driven-development",
      "Any time implementation code is written"
    ],
    "phases": [
      { "number": 1, "label": "RED", "color": "#f78166", "detail": "Write a failing test that describes the desired behavior. Run it — confirm it fails." },
      { "number": 2, "label": "GREEN", "color": "#238636", "detail": "Write the minimal implementation to make the test pass. No more than needed." },
      { "number": 3, "label": "REFACTOR", "color": "#4a9eff", "detail": "Clean up the code while keeping tests green. Improve names, remove duplication." }
    ],
    "usedInScenarios": ["building-a-feature"]
  },
  {
    "id": "systematic-debugging",
    "name": "systematic-debugging",
    "command": "/superpowers:systematic-debugging",
    "category": "Debugging",
    "description": "4-phase root cause process. Prevents guessing, wasted fixes, and recurring bugs by requiring evidence before proposing any solution.",
    "whenToUse": [
      "Any bug or test failure",
      "Unexpected behavior",
      "Before proposing a fix",
      "When the same bug keeps recurring"
    ],
    "phases": [
      { "number": 1, "label": "Observe", "color": "#4a9eff", "detail": "Reproduce the bug. Capture exact symptoms, inputs, and outputs. No theories yet." },
      { "number": 2, "label": "Hypothesize", "color": "#238636", "detail": "List all possible causes. Rank by likelihood and ease of verification." },
      { "number": 3, "label": "Verify", "color": "#8957e5", "detail": "Test each hypothesis with minimal changes. Eliminate causes with evidence." },
      { "number": 4, "label": "Fix & confirm", "color": "#f78166", "detail": "Apply minimal fix. Verify it resolves the root cause, not just the symptoms." }
    ],
    "usedInScenarios": ["debugging"]
  },
  {
    "id": "verification-before-completion",
    "name": "verification-before-completion",
    "command": "/superpowers:verification-before-completion",
    "category": "Debugging",
    "description": "Requires running actual verification commands and confirming real output before claiming work is done. Evidence before assertions — always.",
    "whenToUse": [
      "Before claiming work is complete",
      "Before committing or creating PRs",
      "After fixing a bug",
      "Before saying 'it should work now'"
    ],
    "usedInScenarios": ["debugging", "building-a-feature"]
  },
  {
    "id": "requesting-code-review",
    "name": "requesting-code-review",
    "command": "/superpowers:requesting-code-review",
    "category": "Review",
    "description": "Pre-review checklist that reviews code against the implementation plan. Reports findings by severity: CRITICAL blocks, HIGH warns, MEDIUM informs.",
    "whenToUse": [
      "After writing or modifying code",
      "Between implementation tasks in a plan",
      "Before merging to main"
    ],
    "usedInScenarios": ["code-review"]
  },
  {
    "id": "receiving-code-review",
    "name": "receiving-code-review",
    "command": "/superpowers:receiving-code-review",
    "category": "Review",
    "description": "Processes review feedback with technical rigor — verifies each suggestion is correct before implementing. Pushes back on incorrect feedback rather than blindly applying it.",
    "whenToUse": [
      "After receiving code review feedback",
      "Before implementing review suggestions",
      "When feedback seems unclear or questionable"
    ],
    "usedInScenarios": ["code-review"]
  },
  {
    "id": "finishing-a-development-branch",
    "name": "finishing-a-development-branch",
    "command": "/superpowers:finishing-a-development-branch",
    "category": "Git",
    "description": "Verifies tests pass, presents structured options (merge/PR/keep/discard), and cleans up the git worktree. Won't merge until tests are confirmed green.",
    "whenToUse": [
      "All tasks in the plan are complete",
      "Tests are passing",
      "Ready to integrate the work"
    ],
    "usedInScenarios": ["merging-and-shipping"]
  },
  {
    "id": "writing-skills",
    "name": "writing-skills",
    "command": "/superpowers:writing-skills",
    "category": "Meta",
    "description": "Complete guide for creating, testing, and deploying new skills. Includes adversarial pressure testing methodology to ensure skills trigger reliably.",
    "whenToUse": [
      "Creating project-specific workflows",
      "Extending superpowers for your domain",
      "After mastering the core superpowers workflow"
    ],
    "usedInScenarios": ["writing-a-custom-skill"]
  }
]
```

- [ ] **Step 3: Run the validation test**

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
git add data/skills.json test.js
git commit -m "feat: add skills data with all 13 skills"
```

---

## Task 5: App Core — Bootstrap, Router, Utilities

**Files:**
- Create: `public/app.js`

- [ ] **Step 1: Create `public/app.js` with state, init, router, and utilities**

```javascript
// ── State ──────────────────────────────────────────────────────────────────
const state = {
  scenarios: [],
  skills: [],
  fuse: null
}

// ── Utilities ──────────────────────────────────────────────────────────────
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!'
    setTimeout(() => { btn.textContent = 'Copy' }, 2000)
  }).catch(() => {
    btn.textContent = 'Error'
    setTimeout(() => { btn.textContent = 'Copy' }, 2000)
  })
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function makeCopyBlock(command) {
  return `
    <div class="copy-block">
      <code>${escHtml(command)}</code>
      <button class="copy-btn" data-command="${escHtml(command)}">Copy</button>
    </div>`
}

// ── Router ─────────────────────────────────────────────────────────────────
function router() {
  const hash = location.hash || '#/'
  const main = document.getElementById('main')
  const navBack = document.getElementById('nav-back')
  const searchInput = document.getElementById('search-input')

  // Clear search input if not on search page
  if (!hash.startsWith('#/search')) {
    searchInput.value = ''
  }

  if (hash === '#/' || hash === '') {
    navBack.innerHTML = ''
    renderHome(main)
  } else if (hash.startsWith('#/scenario/')) {
    const id = hash.replace('#/scenario/', '').split('?')[0]
    navBack.innerHTML = '<a href="#/" class="back-link">← Home</a>'
    renderScenario(main, id)
  } else if (hash.startsWith('#/skill/')) {
    const parts = hash.replace('#/skill/', '').split('?')
    const id = parts[0]
    const params = new URLSearchParams(parts[1] || '')
    const from = params.get('from')
    if (from) {
      const scenario = state.scenarios.find(s => s.id === from)
      navBack.innerHTML = scenario
        ? `<a href="#/scenario/${from}" class="back-link">← ${escHtml(scenario.icon)} ${escHtml(scenario.title)}</a>`
        : '<a href="#/" class="back-link">← Home</a>'
    } else {
      navBack.innerHTML = '<a href="#/skills" class="back-link">← All Skills</a>'
    }
    renderSkill(main, id)
  } else if (hash.startsWith('#/search')) {
    const params = new URLSearchParams(hash.split('?')[1] || '')
    navBack.innerHTML = '<a href="#/" class="back-link">← Home</a>'
    renderSearch(main, params.get('q') || '')
  } else if (hash === '#/skills') {
    navBack.innerHTML = '<a href="#/" class="back-link">← Home</a>'
    renderAllSkills(main)
  } else {
    navBack.innerHTML = ''
    main.innerHTML = '<div class="error">Page not found.</div>'
  }
}

// ── Copy button delegation ─────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('copy-btn')) {
    copyToClipboard(e.target.dataset.command, e.target)
  }
})

// ── Nav search ─────────────────────────────────────────────────────────────
function setupNavSearch() {
  const input = document.getElementById('search-input')
  let timer
  input.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const q = input.value.trim()
      location.hash = q ? `#/search?q=${encodeURIComponent(q)}` : '#/'
    }, 300)
  })
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  try {
    const [scenariosRes, skillsRes] = await Promise.all([
      fetch('/data/scenarios.json'),
      fetch('/data/skills.json')
    ])
    state.scenarios = await scenariosRes.json()
    state.skills = await skillsRes.json()

    const searchData = [
      ...state.scenarios.map(s => ({ ...s, _type: 'scenario' })),
      ...state.skills.map(s => ({ ...s, _type: 'skill' }))
    ]
    state.fuse = new Fuse(searchData, {
      threshold: 0.3,
      keys: ['title', 'name', 'description', 'whenToUse', 'steps.title', 'steps.whatClaudeDoes']
    })

    setupNavSearch()
    window.addEventListener('hashchange', router)
    router()
  } catch (err) {
    document.getElementById('main').innerHTML =
      `<div class="error">Failed to load data: ${escHtml(err.message)}</div>`
  }
}

// Stub render functions — replaced in later tasks
function renderHome(main) { main.innerHTML = '<div class="loading">Home view coming soon…</div>' }
function renderScenario(main, id) { main.innerHTML = `<div class="loading">Scenario: ${escHtml(id)}</div>` }
function renderSkill(main, id) { main.innerHTML = `<div class="loading">Skill: ${escHtml(id)}</div>` }
function renderSearch(main, q) { main.innerHTML = `<div class="loading">Search: ${escHtml(q)}</div>` }
function renderAllSkills(main) { main.innerHTML = '<div class="loading">All skills coming soon…</div>' }

document.addEventListener('DOMContentLoaded', init)
```

- [ ] **Step 2: Start server and verify app boots**

```bash
node index.js
```
Open `http://localhost:3000` — expect "Home view coming soon…" text. Check browser console for errors — there should be none.

- [ ] **Step 3: Verify hash routing works**

Navigate to `http://localhost:3000/#/scenario/debugging` — expect "Scenario: debugging" text.
Navigate to `http://localhost:3000/#/skill/brainstorming` — expect "Skill: brainstorming" text.

- [ ] **Step 4: Commit**

```bash
git add public/app.js
git commit -m "feat: app core — state, router, copy button delegation, nav search, init"
```

---

## Task 6: Home View

**Files:**
- Modify: `public/app.js` — replace `renderHome` stub

- [ ] **Step 1: Replace the `renderHome` stub in `app.js`**

Replace the line:
```javascript
function renderHome(main) { main.innerHTML = '<div class="loading">Home view coming soon…</div>' }
```

With:
```javascript
function renderHome(main) {
  const cards = state.scenarios.map(s => `
    <a class="scenario-card" href="#/scenario/${escHtml(s.id)}">
      <div class="scenario-icon">${s.icon}</div>
      <div class="scenario-title">${escHtml(s.title)}</div>
      <div class="scenario-desc">${escHtml(s.description)}</div>
      <div class="scenario-meta">${s.skillCount} skill${s.skillCount === 1 ? '' : 's'} · ${escHtml(s.estimatedTime)}</div>
    </a>`).join('')

  main.innerHTML = `
    <div class="hero">
      <h1>How do you want to build today?</h1>
      <p>Pick a scenario to see exactly which skills to use and how.</p>
    </div>
    <div class="scenario-grid">${cards}</div>
    <div class="page-footer">
      Superpowers v5.1.0 · <a href="#/skills">Browse all 13 skills →</a>
    </div>`
}
```

- [ ] **Step 2: Verify home page in browser**

Open `http://localhost:3000` — verify:
- 7 scenario cards visible in a 3-column grid
- Each card shows icon, title, description, and skill count
- Hovering a card highlights its border in blue
- "Browse all 13 skills →" link visible in footer
- Clicking a card navigates to `#/scenario/:id` (shows stub for now)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: home view with 7 scenario cards"
```

---

## Task 7: Scenario Walkthrough View

**Files:**
- Modify: `public/app.js` — replace `renderScenario` stub

- [ ] **Step 1: Replace the `renderScenario` stub in `app.js`**

Replace:
```javascript
function renderScenario(main, id) { main.innerHTML = `<div class="loading">Scenario: ${escHtml(id)}</div>` }
```

With:
```javascript
function renderScenario(main, id) {
  const scenario = state.scenarios.find(s => s.id === id)
  if (!scenario) {
    main.innerHTML = '<div class="error">Scenario not found.</div>'
    return
  }

  const stepColors = ['#4a9eff', '#238636', '#8957e5', '#f78166', '#e3b341']

  const steps = scenario.steps.map((step, i) => `
    <div class="step-block">
      <div class="step-header">
        <div class="step-number" style="background:${stepColors[i % stepColors.length]}">${step.number}</div>
        <div class="step-title">${escHtml(step.title)}</div>
      </div>
      <div class="step-body">
        ${step.instruction ? `<div class="step-instruction">${escHtml(step.instruction)}</div>` : ''}
        ${step.command ? makeCopyBlock(step.command) : ''}
        ${step.browseLink ? `<div class="step-instruction"><a href="${escHtml(step.browseLink)}" class="back-link">→ Browse all skills</a></div>` : ''}
        ${step.whatClaudeDoes && step.whatClaudeDoes !== 'Not applicable.' && step.whatClaudeDoes !== 'Not applicable — this scenario links directly to the skill browser.'
          ? `<div class="step-hint">💡 <strong>What Claude does:</strong> ${escHtml(step.whatClaudeDoes)}</div>`
          : ''}
        ${step.whatToExpect && !step.whatToExpect.startsWith('Not applicable')
          ? `<div class="step-expect"><strong>What to expect:</strong> ${escHtml(step.whatToExpect)}</div>`
          : ''}
        ${step.saves ? `<div class="step-saves"><code>${escHtml(step.saves)}</code></div>` : ''}
      </div>
    </div>`).join('')

  const nextScenario = scenario.nextScenario
    ? state.scenarios.find(s => s.id === scenario.nextScenario)
    : null

  const relatedSkills = scenario.skillIds.length > 0
    ? `<div class="section-label" style="margin-top:24px;">Skills used in this scenario</div>
       <div class="tags">${scenario.skillIds.map(id => {
         const skill = state.skills.find(s => s.id === id)
         return skill
           ? `<a class="tag-link" href="#/skill/${escHtml(skill.id)}?from=${escHtml(scenario.id)}">${escHtml(skill.command)}</a>`
           : ''
       }).join('')}</div>`
    : ''

  main.innerHTML = `
    <div class="scenario-hero">
      <div class="scenario-hero-icon">${scenario.icon}</div>
      <h1>${escHtml(scenario.title)}</h1>
      <p>${escHtml(scenario.description)} · ${scenario.skillCount} skill${scenario.skillCount === 1 ? '' : 's'} · ${escHtml(scenario.estimatedTime)}</p>
    </div>
    ${steps}
    ${relatedSkills}
    ${nextScenario ? `
      <div class="next-scenario">
        <span>Ready to continue?</span>
        <a href="#/scenario/${escHtml(nextScenario.id)}">${nextScenario.icon} ${escHtml(nextScenario.title)} →</a>
      </div>` : ''}`
}
```

- [ ] **Step 2: Verify scenario pages in browser**

Open `http://localhost:3000/#/scenario/designing-a-feature` — verify:
- Header shows 🧠 icon, title, description, skill count
- 3 step blocks visible, each with colored number circle
- Step 1 copy block shows `/superpowers:brainstorming` with Copy button
- Clicking Copy button copies the text and briefly shows "Copied!"
- "Skills used" tags visible at bottom, clicking a tag navigates to skill detail
- "🚀 Building a feature →" next scenario link at bottom

Open `http://localhost:3000/#/scenario/debugging` — verify 2 steps with copy blocks.

Open `http://localhost:3000/#/scenario/merging-and-shipping` — verify no "next scenario" link.

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: scenario walkthrough view with steps, copy buttons, related skills"
```

---

## Task 8: Skill Detail View

**Files:**
- Modify: `public/app.js` — replace `renderSkill` stub

- [ ] **Step 1: Replace the `renderSkill` stub in `app.js`**

Replace:
```javascript
function renderSkill(main, id) { main.innerHTML = `<div class="loading">Skill: ${escHtml(id)}</div>` }
```

With:
```javascript
function renderSkill(main, id) {
  const skill = state.skills.find(s => s.id === id)
  if (!skill) {
    main.innerHTML = '<div class="error">Skill not found.</div>'
    return
  }

  const phasesHtml = skill.phases && skill.phases.length > 0
    ? `<div class="section-label">How it works</div>
       <div class="phases-grid">
         ${skill.phases.map(p => `
           <div class="phase-card">
             <div class="phase-label" style="color:${p.color}">PHASE ${p.number}</div>
             <div class="phase-title">${escHtml(p.label)}</div>
             <div class="phase-detail">${escHtml(p.detail)}</div>
           </div>`).join('')}
       </div>`
    : ''

  const usedInHtml = skill.usedInScenarios && skill.usedInScenarios.length > 0
    ? `<div class="section-label">Used in</div>
       <div class="tags">
         ${skill.usedInScenarios.map(sid => {
           const scenario = state.scenarios.find(s => s.id === sid)
           return scenario
             ? `<a class="tag-link" href="#/scenario/${escHtml(scenario.id)}">${scenario.icon} ${escHtml(scenario.title)}</a>`
             : ''
         }).join('')}
       </div>`
    : ''

  main.innerHTML = `
    <div class="skill-header">
      <div class="skill-header-left">
        <div class="skill-category">${escHtml(skill.category)}</div>
        <div class="skill-name">${escHtml(skill.name)}</div>
        <div class="skill-desc">${escHtml(skill.description)}</div>
      </div>
      <div class="skill-header-right">
        ${makeCopyBlock(skill.command)}
      </div>
    </div>
    <div class="section-label">When to use</div>
    <div class="tags">
      ${skill.whenToUse.map(w => `<span class="tag">${escHtml(w)}</span>`).join('')}
    </div>
    ${phasesHtml}
    ${usedInHtml}`
}
```

- [ ] **Step 2: Verify skill pages in browser**

Open `http://localhost:3000/#/skill/systematic-debugging` — verify:
- Category label "Debugging" in blue
- Skill name, description
- Copy block with `/superpowers:systematic-debugging` and Copy button
- "When to use" tags visible
- 4-phase grid visible with color-coded phase labels
- "Used in" links at bottom

Open `http://localhost:3000/#/skill/brainstorming` — verify no phases grid (brainstorming has no phases), "Used in" shows "🧠 Designing a feature".

Open `http://localhost:3000/#/scenario/debugging` and click a skill tag — verify back link in nav shows "← 🐛 Debugging".

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: skill detail view with phases grid, when-to-use tags, used-in links"
```

---

## Task 9: Search View

**Files:**
- Modify: `public/app.js` — replace `renderSearch` stub

- [ ] **Step 1: Replace the `renderSearch` stub in `app.js`**

Replace:
```javascript
function renderSearch(main, q) { main.innerHTML = `<div class="loading">Search: ${escHtml(q)}</div>` }
```

With:
```javascript
function renderSearch(main, q) {
  // Sync search input with current query
  const searchInput = document.getElementById('search-input')
  if (searchInput.value !== q) searchInput.value = q

  if (!q.trim()) {
    main.innerHTML = '<div class="loading">Type something to search…</div>'
    return
  }

  const results = state.fuse.search(q).map(r => r.item)
  const scenarios = results.filter(r => r._type === 'scenario')
  const skills = results.filter(r => r._type === 'skill')
  const total = results.length

  if (total === 0) {
    main.innerHTML = `
      <div class="search-summary">No results for <strong>"${escHtml(q)}"</strong></div>
      <div class="no-results">
        <p>Try searching for a skill name, scenario, or keyword like "debug", "review", or "plan".</p>
        <p style="margin-top:12px;"><a href="#/skills" class="back-link">Browse all skills →</a></p>
      </div>`
    return
  }

  const scenariosHtml = scenarios.length > 0
    ? `<div class="result-group-label">Scenarios</div>
       ${scenarios.map(s => `
         <a class="result-item" href="#/scenario/${escHtml(s.id)}">
           <div class="result-icon">${s.icon}</div>
           <div>
             <div class="result-title">${escHtml(s.title)}</div>
             <div class="result-desc">${escHtml(s.description)} · ${s.skillCount} skills</div>
           </div>
           <div class="result-arrow">View →</div>
         </a>`).join('')}`
    : ''

  const skillsHtml = skills.length > 0
    ? `<div class="result-group-label">Skills</div>
       ${skills.map(s => `
         <a class="result-item" href="#/skill/${escHtml(s.id)}">
           <div class="result-command"><code>${escHtml(s.command)}</code></div>
           <div>
             <div class="result-title">${escHtml(s.name)}</div>
             <div class="result-desc">${escHtml(s.description)}</div>
           </div>
           <div class="result-arrow">View →</div>
         </a>`).join('')}`
    : ''

  main.innerHTML = `
    <div class="search-summary">${total} result${total === 1 ? '' : 's'} for <strong>"${escHtml(q)}"</strong></div>
    ${scenariosHtml}
    ${skillsHtml}`
}
```

- [ ] **Step 2: Verify search in browser**

Open `http://localhost:3000` and type "debug" in the search bar — verify:
- URL updates to `#/search?q=debug` after 300ms
- Results show "Debugging" scenario and "systematic-debugging", "verification-before-completion" skills
- Clicking a result navigates to the correct page
- Clearing the search input returns to home

Type "plan" — verify "writing-plans", "executing-plans" skills and "Designing a feature" scenario appear.

Type "xyznotaword" — verify "No results" state shows with browse link.

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: live search view with Fuse.js, grouped results by scenario and skill"
```

---

## Task 10: All Skills View

**Files:**
- Modify: `public/app.js` — replace `renderAllSkills` stub

- [ ] **Step 1: Replace the `renderAllSkills` stub in `app.js`**

Replace:
```javascript
function renderAllSkills(main) { main.innerHTML = '<div class="loading">All skills coming soon…</div>' }
```

With:
```javascript
function renderAllSkills(main) {
  const categories = ['Planning', 'Building', 'Testing', 'Debugging', 'Review', 'Git', 'Meta']

  const categoriesHtml = categories.map(cat => {
    const catSkills = state.skills.filter(s => s.category === cat)
    if (catSkills.length === 0) return ''
    return `
      <div class="skills-category">
        <div class="skills-category-title">${escHtml(cat)}</div>
        ${catSkills.map(s => `
          <a class="skill-item" href="#/skill/${escHtml(s.id)}">
            <div class="skill-item-command"><code>${escHtml(s.command)}</code></div>
            <div>
              <div class="skill-item-name">${escHtml(s.name)}</div>
              <div class="skill-item-desc">${escHtml(s.description)}</div>
            </div>
          </a>`).join('')}
      </div>`
  }).join('')

  main.innerHTML = `
    <div class="skills-page-header">
      <h1>All Skills</h1>
      <p>All 13 superpowers skills, organized by category.</p>
    </div>
    ${categoriesHtml}`
}
```

- [ ] **Step 2: Verify all skills page in browser**

Open `http://localhost:3000/#/skills` — verify:
- "All Skills" header
- Skills grouped under Planning, Building, Testing, Debugging, Review, Git, Meta
- Each skill shows its slash command and description
- Clicking a skill navigates to skill detail with "← All Skills" back link in nav

Click "Browse all 13 skills →" on the home page — verify it navigates to `#/skills`.

- [ ] **Step 3: Run all tests**

```bash
node test.js
```
Expected: all 5 checks pass.

- [ ] **Step 4: Full smoke test in browser**

Walk through the complete user journey:
1. Open `http://localhost:3000` — home page shows 7 cards ✓
2. Click "🧠 Designing a feature" — walkthrough shows 3 steps ✓
3. Click Copy on step 1 — clipboard gets `/superpowers:brainstorming`, button shows "Copied!" ✓
4. Click `/superpowers:brainstorming` skill tag — skill detail page loads ✓
5. Back link in nav shows "← 🧠 Designing a feature" ✓
6. Type "debug" in search bar — results appear ✓
7. Click home logo — returns to home ✓
8. Click "Browse all 13 skills →" — all skills page loads ✓

- [ ] **Step 5: Commit**

```bash
git add public/app.js
git commit -m "feat: all skills view grouped by category — app complete"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
node test.js
```
Expected output:
```
✓ scenarios.json valid — 7 scenarios, all steps valid
✓ skills.json valid — 13 skills, all fields present
✓ GET / returns 200 with #main
✓ GET /data/scenarios.json returns 200
✓ GET /data/skills.json returns 200

All tests passed.
```

- [ ] **Step 2: Verify npm start works**

```bash
npm start
```
Expected: `Superpowers Guide running at http://localhost:3000`

- [ ] **Step 3: Add .gitignore**

```
node_modules/
.superpowers/
```

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

- [ ] **Step 4: Final commit message and summary**

```bash
git log --oneline
```
Expected: 10–11 commits covering scaffold → CSS → data → app views → complete.
