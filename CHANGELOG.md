# Changelog

Version control log for this repository: what changed, when, and by whom.
Newest entries first. Each entry names the tool or person that made the change.

## 2026-09-05 — Claude Code (Claude Fable 5.1), on behalf of Peter

**README review**

- Rewrote the intro: the guide is no longer "local only"; online vs local comparison table.
- Added a real `docs/screenshot.png` (the README linked to a file that did not exist).
- Node.js requirement raised from v16 to v18 (v16 is end-of-life).
- Phone section now leads with the online URL; the local-server steps stay as the alternative.
- New sections: Project structure, Keeping up with new superpowers releases, Contributing (pull first, test, commit, CHANGELOG).
- Same changes mirrored in the Traditional Chinese half.

## 2026-09-05 — Claude Code (Claude Fable 5.1), on behalf of Peter

**GitHub Pages deployment**

- `public/` is now a self-contained static site: `data/` moved to `public/data/`, Fuse.js vendored into `public/vendor/`, all asset and fetch paths made relative so the app works under `/Superpowers-guide/`.
- `index.js` reduced to serving `public/` with an SPA fallback.
- Added `.github/workflows/pages.yml`: runs `npm test`, then deploys `public/` to GitHub Pages on every push to `master`.
- `test.js` guards against root-absolute paths creeping back in and checks the vendored Fuse.js is served.
- README: online URL, "Editing the content" section, updated tech stack notes.

## 2026-09-05 — Claude Code (Claude Fable 5.1), on behalf of Peter

**Visual refresh**

- Light mode added alongside dark. Follows the system setting by default; the ☾/☀ button in the nav overrides it and the choice is remembered.
- Type scale raised for readability: 16px base, 15px body copy, 12px minimum. Muted text contrast improved in both themes.
- Copy button is now a solid accent button with green "Copied!" and red error states.
- Cards, steps, and result rows: more padding, larger radius, subtle shadow in light mode, hover lift.
- "What Claude does" callout uses a tinted background instead of italic grey text.
- Phase label colours in skills.json are mapped to theme tokens so they stay readable on light backgrounds.
- Keyboard focus rings and a reduced-motion rule added.

## 2026-09-05 — Claude Code (Claude Fable 5.1), on behalf of Peter

**Content updated to superpowers v6.3.0**

- Added the 14th skill, `using-superpowers`, the entry point that decides when other skills are invoked.
- Rewrote `brainstorming` for the three paths introduced in v6: spike, bounded, architectural.
- Renamed the `systematic-debugging` phases to match the plugin: root cause investigation, pattern analysis, hypothesis and testing, implementation.
- Rewrote `subagent-driven-development` for the task reviewer, five-round fix loop, and final whole-branch review.
- Updated `executing-plans` (now for environments without subagents), `requesting-code-review` (Critical / Important / Minor), `finishing-a-development-branch` (three options, discard on request), `writing-plans`, `writing-skills`, and `verification-before-completion`.
- Updated the scenario walkthroughs that describe those skills, in English and Traditional Chinese.
- Added `data/meta.json` with the plugin version the content matches; shown in the home page footer.
- Removed hard-coded skill counts from the UI; counts now come from the data files.
- `test.js` now checks cross-references between scenarios and skills, and that every scenario, step, skill, and phase has a zh-TW translation.
- Replaced `20260629.txt` with this changelog.

## 2026-06-29 — Codex (OpenAI), on behalf of Peter

- Added `20260629.txt` containing the text "From Codex". A connectivity test confirming Codex could push to this repository.

## 2026-06-24 — Claude Code, on behalf of Peter

- Mobile responsive layout: phone and tablet breakpoints, language toggle moved into the nav-left group.
- README: mobile access guide and Traditional Chinese version.
- Skill name colour adjustments on the skills page.

## 2026-06-23 — Claude Code, on behalf of Peter

- Initial release: Express server, SPA shell, 7 scenarios, 13 skills, Fuse.js search, copy buttons.
- Traditional Chinese (zh-TW) language toggle.
- Design spec and implementation plan under `docs/superpowers/`.
