# Superpowers Guide — Design Spec
_Date: 2026-06-23_

## Overview

A local Node.js web app that serves as a scenario-first reference guide for the superpowers Claude plugin (v5.1.0). Users open it in the browser, pick a scenario that matches what they're trying to do, and get a guided step-by-step walkthrough: what slash command to type, what Claude does at each step, and what to expect next. All 13 skills are also browsable individually, and a live search bar covers the full content.

---

## Goals

- Help users learn and remember how to use superpowers correctly
- Zero friction: `npm start`, open browser, done
- Content stays accurate: data files (JSON) are separate from UI code so they can be updated without touching JS

---

## Tech Stack

- **Runtime:** Node.js
- **Server:** Express (serves `public/` as static files — no API routes)
- **Search:** Fuse.js (client-side fuzzy search loaded from `data/`)
- **Routing:** Hash-based SPA (`#/`, `#/scenario/:id`, `#/skill/:id`, `#/search?q=`)
- **Frontend:** Vanilla HTML/CSS/JS — no build step, no framework

---

## File Structure

```
superpowers-guide/
├── index.js                          # Express server, port 3000
├── package.json                      # express, fuse.js
├── data/
│   ├── scenarios.json                # 7 lifecycle scenarios
│   └── skills.json                   # 13 skills
└── public/
    ├── index.html                    # Single-page shell
    ├── app.js                        # Router, search, copy buttons
    └── styles.css                    # All styles (dark GitHub-inspired theme)
```

---

## Data Model

### scenarios.json

```json
[
  {
    "id": "designing-a-feature",
    "icon": "🧠",
    "title": "Designing a feature",
    "description": "Turn a rough idea into a spec before writing code",
    "skillCount": 3,
    "estimatedTime": "~20 min",
    "nextScenario": "building-a-feature",
    "steps": [
      {
        "number": 1,
        "title": "Start the brainstorming skill",
        "command": "/superpowers:brainstorming",
        "instruction": "Type this in Claude Code:",
        "whatClaudeDoes": "Asks you questions one at a time to understand what you're building — purpose, constraints, success criteria. Proposes 2–3 approaches with trade-offs, then presents a design spec in sections for your approval.",
        "whatToExpect": "3–6 questions about your idea. Each answer narrows the design."
      },
      {
        "number": 2,
        "title": "Answer Claude's questions",
        "command": null,
        "instruction": "No command needed — just reply in the terminal.",
        "whatClaudeDoes": "Asks one question at a time. For UI questions, may open a browser to show mockups.",
        "whatToExpect": "Claude proposes approaches and asks you to pick one before writing the spec."
      },
      {
        "number": 3,
        "title": "Approve the design spec",
        "command": null,
        "instruction": "Review each section and say yes, or ask for changes.",
        "whatClaudeDoes": "Presents the design in sections. Saves the approved spec to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md, then automatically invokes writing-plans.",
        "whatToExpect": "After approval, Claude transitions to writing an implementation plan."
      }
    ],
    "skillIds": ["brainstorming", "writing-plans", "using-git-worktrees"]
  }
]
```

_(All 7 scenarios follow this shape. Full content defined in implementation.)_

### skills.json

```json
[
  {
    "id": "systematic-debugging",
    "name": "systematic-debugging",
    "command": "/superpowers:systematic-debugging",
    "category": "Debugging",
    "description": "4-phase root cause process. Prevents guessing, wasted fixes, and recurring bugs.",
    "whenToUse": ["Any bug or test failure", "Unexpected behavior", "Before proposing a fix", "Recurring issues"],
    "phases": [
      { "number": 1, "label": "Observe", "color": "#4a9eff", "detail": "Reproduce the bug, capture exact symptoms. No theories yet." },
      { "number": 2, "label": "Hypothesize", "color": "#238636", "detail": "List possible causes. Rank by likelihood and ease of verification." },
      { "number": 3, "label": "Verify", "color": "#8957e5", "detail": "Test each hypothesis with minimal changes. Evidence before fixing." },
      { "number": 4, "label": "Fix & confirm", "color": "#f78166", "detail": "Apply minimal fix, verify it solves the root cause, not just symptoms." }
    ],
    "usedInScenarios": ["debugging", "building-a-feature"]
  }
]
```

_(All 13 skills follow this shape.)_

---

## Pages & Routing

| Route | View | Description |
|-------|------|-------------|
| `#/` | Home | 7 scenario cards in a 3-column grid + search bar in nav |
| `#/scenario/:id` | Scenario walkthrough | Numbered steps with copy buttons and "→ next scenario" |
| `#/skill/:id` | Skill detail | Command + when-to-use tags + phases grid + linked scenarios |
| `#/search?q=` | Search results | Results grouped: Scenarios first, then Skills |
| `#/skills` | All skills | Full skill library browsable by category |

---

## UI Components

### Nav bar (all pages)
- Left: back link (← Home or ← Scenario name) + logo
- Right: search input (triggers `#/search?q=` on input)

### Scenario card (home)
- Icon, title, description, skill count, estimated time
- Full card is clickable → `#/scenario/:id`

### Step block (scenario walkthrough)
- Numbered circle (color-coded: blue=1, green=2, purple=3…)
- Title
- Copy block: `<code>` + Copy button (copies to clipboard, shows "Copied!" for 2s)
- "💡 What Claude does" — italic grey description
- "What to expect" — additional context

### Skill card (skill detail)
- Category label, name, copy block
- When-to-use tags
- Phases grid (2×2 for 4-phase skills)
- "Used in" scenario links

### Search results
- Live: fires on `input` event with 300ms debounce
- Results grouped under "Scenarios" and "Skills" headings
- No results state: "No results for 'x' — try browsing all skills"

---

## Interaction Details

### Copy button
```
State 1: "Copy"
State 2 (after click): "Copied!" for 2000ms
State 3: back to "Copy"
```
Uses `navigator.clipboard.writeText()`.

### Search
- Fuse.js with `threshold: 0.3`
- Keys searched: `title`, `description`, `name`, `whenToUse`, `whatClaudeDoes`
- Results update live as user types (debounced 300ms)
- URL updated to `#/search?q=<term>` for shareability

### Hash routing
- `window.addEventListener('hashchange', router)`
- Router parses `location.hash`, renders the correct view
- Back/forward browser navigation works naturally

---

## The 7 Scenarios

| # | Icon | Title | Key Skills |
|---|------|-------|-----------|
| 1 | 🧠 | Designing a feature | brainstorming, writing-plans, using-git-worktrees |
| 2 | 🚀 | Building a feature | subagent-driven-development, test-driven-development, requesting-code-review, verification-before-completion |
| 3 | 🐛 | Debugging | systematic-debugging, verification-before-completion |
| 4 | 👀 | Code review | requesting-code-review, receiving-code-review |
| 5 | 🔀 | Merging & shipping | finishing-a-development-branch |
| 6 | 📚 | Understanding a skill | (links to skill detail pages) |
| 7 | ✍️ | Writing a custom skill | writing-skills |

---

## The 13 Skills

| Skill | Category | Command |
|-------|----------|---------|
| brainstorming | Planning | /superpowers:brainstorming |
| writing-plans | Planning | /superpowers:writing-plans |
| using-git-worktrees | Git | /superpowers:using-git-worktrees |
| subagent-driven-development | Building | /superpowers:subagent-driven-development |
| executing-plans | Building | /superpowers:executing-plans |
| dispatching-parallel-agents | Building | /superpowers:dispatching-parallel-agents |
| test-driven-development | Testing | /superpowers:test-driven-development |
| systematic-debugging | Debugging | /superpowers:systematic-debugging |
| verification-before-completion | Debugging | /superpowers:verification-before-completion |
| requesting-code-review | Review | /superpowers:requesting-code-review |
| receiving-code-review | Review | /superpowers:receiving-code-review |
| finishing-a-development-branch | Git | /superpowers:finishing-a-development-branch |
| writing-skills | Meta | /superpowers:writing-skills |

---

## Out of Scope

- Authentication (local tool, no auth needed)
- Editing content from the UI (edit JSON files directly)
- Dark/light mode toggle (dark only)
- Mobile responsiveness (desktop local tool)
- Persistence of user progress or bookmarks
