import Fuse from '/vendor/fuse.mjs'

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  scenarios: [],
  skills: [],
  fuse: null,
  lang: localStorage.getItem('lang') || 'en',
  meta: { superpowersVersion: '', contentUpdated: '' },
  translations: { ui: {}, categories: {}, scenarios: {}, skills: {} }
}

// ── English UI strings ─────────────────────────────────────────────────────
const EN = {
  copy: 'Copy',
  copied: 'Copied!',
  copyError: 'Error',
  backHome: '← Home',
  backAllSkills: '← All Skills',
  heroSubtitle: 'Pick a scenario to see exactly which skills to use and how.',
  browseSkills: 'Browse all {n} skills →',
  allSkillsSubtitle: '{n} superpowers skills across {c} categories',
  contentVersion: 'Content matches superpowers v{v}, updated {d}',
  skillCountUnit: '{n} skill|{n} skills',
  resultsFor: '{n} result for|{n} results for',
  skillsUsed: 'Skills used',
  nextScenario: 'Next scenario',
  whenToUse: 'When to use',
  howItWorks: 'How it works',
  usedIn: 'Used in scenarios',
  allSkillsH1: 'All Skills',
  searchStart: 'Start typing to search…',
  searchPlaceholder: '🔍  Search skills, scenarios…',
  noResults: 'No results for',
  noResultsTip: 'Try a different keyword, or',
  browseAllSkillsLink: 'browse all skills',
  scenariosLabel: 'Scenarios',
  skillsLabel: 'Skills',
  whatClaudeDoesLabel: 'What Claude does:',
  whatToExpectLabel: 'What to expect:',
  savesTo: 'Saves to:',
  browseSkillsLink: 'Browse skills →',
  scenarioNotFound: 'Scenario not found.',
  skillNotFound: 'Skill not found.',
  pageNotFound: 'Page not found.',
}

// ── Translation helpers ────────────────────────────────────────────────────
function ui(key) {
  if (state.lang === 'zh-TW') return state.translations.ui[key] || EN[key] || key
  return EN[key] || key
}

// Fill {placeholders}; for 'singular|plural' strings pick by vars.n
function fmt(key, vars) {
  let str = ui(key)
  if (str.includes('|')) {
    const [one, many] = str.split('|')
    str = vars.n === 1 ? one : many
  }
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

function trScenario(scenario, field) {
  if (state.lang === 'zh-TW') return state.translations.scenarios[scenario.id]?.[field] ?? scenario[field]
  return scenario[field]
}

function trStep(scenario, i, field) {
  if (state.lang === 'zh-TW') return state.translations.scenarios[scenario.id]?.steps?.[i]?.[field] ?? scenario.steps[i][field]
  return scenario.steps[i][field]
}

function trSkill(skill, field) {
  if (state.lang === 'zh-TW') return state.translations.skills[skill.id]?.[field] ?? skill[field]
  return skill[field]
}

function trPhase(skill, i, field) {
  if (state.lang === 'zh-TW') return state.translations.skills[skill.id]?.phases?.[i]?.[field] ?? skill.phases[i][field]
  return skill.phases[i][field]
}

function trCategory(cat) {
  if (state.lang === 'zh-TW') return state.translations.categories[cat] || cat
  return cat
}

// ── Utilities ──────────────────────────────────────────────────────────────
function copyToClipboard(text, btn) {
  const reset = () => {
    btn.textContent = ui('copy')
    btn.classList.remove('is-copied', 'is-error')
  }
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = ui('copied')
    btn.classList.add('is-copied')
    setTimeout(reset, 2000)
  }).catch(() => {
    btn.textContent = ui('copyError')
    btn.classList.add('is-error')
    setTimeout(reset, 2000)
  })
}

// Map the hex colours stored in skills.json onto theme tokens so phase
// labels stay readable in both light and dark mode.
const PHASE_COLORS = {
  '#4a9eff': 'var(--accent)',
  '#238636': 'var(--success)',
  '#8957e5': 'var(--purple)',
  '#f78166': 'var(--red)',
  '#e3b341': 'var(--yellow)',
}
function phaseColor(hex) {
  return PHASE_COLORS[String(hex).toLowerCase()] || hex
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
      <button class="copy-btn" data-command="${escHtml(command)}">${ui('copy')}</button>
    </div>`
}

// ── Language toggle ────────────────────────────────────────────────────────
function toggleLang() {
  state.lang = state.lang === 'en' ? 'zh-TW' : 'en'
  localStorage.setItem('lang', state.lang)
  document.getElementById('lang-toggle').textContent = state.lang === 'en' ? '繁中' : 'EN'
  document.getElementById('search-input').placeholder = ui('searchPlaceholder')
  buildFuse()
  router()
}

// ── Theme toggle ───────────────────────────────────────────────────────────
function currentTheme() {
  const stored = document.documentElement.getAttribute('data-theme')
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem('theme', theme) } catch (e) {}
  const btn = document.getElementById('theme-toggle')
  btn.textContent = theme === 'dark' ? '☀' : '☾'
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
  btn.title = btn.getAttribute('aria-label')
}

function toggleTheme() {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark')
}

// ── Fuse index ─────────────────────────────────────────────────────────────
function buildFuse() {
  const searchData = [
    ...state.scenarios.map(s => ({
      ...s, _type: 'scenario',
      title: trScenario(s, 'title'),
      description: trScenario(s, 'description'),
    })),
    ...state.skills.map(s => ({
      ...s, _type: 'skill',
      description: trSkill(s, 'description'),
      whenToUse: trSkill(s, 'whenToUse'),
    }))
  ]
  state.fuse = new Fuse(searchData, {
    threshold: 0.3,
    keys: ['title', 'name', 'description', 'whenToUse']
  })
}

// ── Router ─────────────────────────────────────────────────────────────────
function router() {
  const hash = location.hash || '#/'
  const main = document.getElementById('main')
  const navBack = document.getElementById('nav-back')
  const searchInput = document.getElementById('search-input')

  if (!hash.startsWith('#/search')) searchInput.value = ''

  if (hash === '#/' || hash === '') {
    navBack.innerHTML = ''
    renderHome(main)
  } else if (hash.startsWith('#/scenario/')) {
    const id = hash.replace('#/scenario/', '').split('?')[0]
    navBack.innerHTML = `<a href="#/" class="back-link">${escHtml(ui('backHome'))}</a>`
    renderScenario(main, id)
  } else if (hash.startsWith('#/skill/')) {
    const parts = hash.replace('#/skill/', '').split('?')
    const id = parts[0]
    const from = new URLSearchParams(parts[1] || '').get('from')
    if (from) {
      const scenario = state.scenarios.find(s => s.id === from)
      navBack.innerHTML = scenario
        ? `<a href="#/scenario/${from}" class="back-link">← ${escHtml(scenario.icon)} ${escHtml(trScenario(scenario, 'title'))}</a>`
        : `<a href="#/" class="back-link">${escHtml(ui('backHome'))}</a>`
    } else {
      navBack.innerHTML = `<a href="#/skills" class="back-link">${escHtml(ui('backAllSkills'))}</a>`
    }
    renderSkill(main, id)
  } else if (hash.startsWith('#/search')) {
    const params = new URLSearchParams(hash.split('?')[1] || '')
    navBack.innerHTML = `<a href="#/" class="back-link">${escHtml(ui('backHome'))}</a>`
    renderSearch(main, params.get('q') || '')
  } else if (hash === '#/skills') {
    navBack.innerHTML = `<a href="#/" class="back-link">${escHtml(ui('backHome'))}</a>`
    renderAllSkills(main)
  } else {
    navBack.innerHTML = ''
    main.innerHTML = `<div class="error">${escHtml(ui('pageNotFound'))}</div>`
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
    const [scenariosRes, skillsRes, zhRes, metaRes] = await Promise.all([
      fetch('/data/scenarios.json'),
      fetch('/data/skills.json'),
      fetch('/data/zh-TW.json'),
      fetch('/data/meta.json')
    ])
    state.scenarios = await scenariosRes.json()
    state.skills = await skillsRes.json()
    state.translations = await zhRes.json()
    state.meta = await metaRes.json()

    const toggle = document.getElementById('lang-toggle')
    toggle.textContent = state.lang === 'en' ? '繁中' : 'EN'
    toggle.addEventListener('click', toggleLang)

    const themeBtn = document.getElementById('theme-toggle')
    themeBtn.addEventListener('click', toggleTheme)
    themeBtn.textContent = currentTheme() === 'dark' ? '☀' : '☾'
    document.getElementById('search-input').placeholder = ui('searchPlaceholder')

    buildFuse()
    setupNavSearch()
    window.addEventListener('hashchange', router)
    router()
  } catch (err) {
    document.getElementById('main').innerHTML =
      `<div class="error">Failed to load data: ${escHtml(err.message)}</div>`
  }
}

// ── Render: Home ───────────────────────────────────────────────────────────
function renderHome(main) {
  const cards = state.scenarios.map(s => {
    const skillWord = fmt('skillCountUnit', { n: s.skillCount })
    return `
    <a href="#/scenario/${s.id}" class="scenario-card">
      <div class="scenario-icon">${escHtml(s.icon)}</div>
      <div class="scenario-title">${escHtml(trScenario(s, 'title'))}</div>
      <div class="scenario-desc">${escHtml(trScenario(s, 'description'))}</div>
      <div class="scenario-meta">${skillWord} · ${escHtml(trScenario(s, 'estimatedTime'))}</div>
    </a>`
  }).join('')

  main.innerHTML = `
    <div class="hero">
      <h1>⚡ Superpowers Guide</h1>
      <p>${escHtml(ui('heroSubtitle'))}</p>
    </div>
    <div class="scenario-grid">${cards}</div>
    <div class="page-footer">
      <a href="#/skills">${escHtml(fmt('browseSkills', { n: state.skills.length }))}</a>
      <div class="version-note">${escHtml(fmt('contentVersion', { v: state.meta.superpowersVersion, d: state.meta.contentUpdated }))}</div>
    </div>`
}

// ── Render: Scenario walkthrough ───────────────────────────────────────────
function renderScenario(main, id) {
  const scenario = state.scenarios.find(s => s.id === id)
  if (!scenario) { main.innerHTML = `<div class="error">${escHtml(ui('scenarioNotFound'))}</div>`; return }

  const stepColors = ['var(--accent)', 'var(--success)', 'var(--purple)', 'var(--red)', 'var(--yellow)']

  const steps = scenario.steps.map((step, i) => {
    const color = stepColors[i % stepColors.length]
    const commandBlock = step.command ? makeCopyBlock(step.command) : ''
    const saves = trStep(scenario, i, 'saves')
    const savesBlock = saves
      ? `<div class="step-saves" style="margin-top:8px">${escHtml(ui('savesTo'))} <code>${escHtml(saves)}</code></div>`
      : ''
    const browseBlock = step.browseLink
      ? `<div style="margin-top:8px"><a href="${escHtml(step.browseLink)}" class="tag-link">${escHtml(ui('browseSkillsLink'))}</a></div>`
      : ''

    return `
      <div class="step-block">
        <div class="step-header">
          <div class="step-number" style="background:${color}">${step.number}</div>
          <div class="step-title">${escHtml(trStep(scenario, i, 'title'))}</div>
        </div>
        <div class="step-body">
          <div class="step-instruction">${escHtml(trStep(scenario, i, 'instruction'))}</div>
          ${commandBlock}
          <div class="step-hint"><strong>${escHtml(ui('whatClaudeDoesLabel'))}</strong> ${escHtml(trStep(scenario, i, 'whatClaudeDoes'))}</div>
          <div class="step-expect"><strong>${escHtml(ui('whatToExpectLabel'))}</strong> ${escHtml(trStep(scenario, i, 'whatToExpect'))}</div>
          ${savesBlock}${browseBlock}
        </div>
      </div>`
  }).join('')

  const skillLinks = (scenario.skillIds || []).map(sid => {
    const skill = state.skills.find(sk => sk.id === sid)
    return `<a href="#/skill/${sid}?from=${id}" class="tag-link">${escHtml(skill ? skill.name : sid)}</a>`
  }).join('')

  const nextBlock = scenario.nextScenario ? (() => {
    const next = state.scenarios.find(s => s.id === scenario.nextScenario)
    return next ? `
      <div class="next-scenario">
        <span>${escHtml(ui('nextScenario'))}</span>
        <a href="#/scenario/${next.id}">${escHtml(next.icon)} ${escHtml(trScenario(next, 'title'))} →</a>
      </div>` : ''
  })() : ''

  main.innerHTML = `
    <div class="scenario-hero">
      <div class="scenario-hero-icon">${escHtml(scenario.icon)}</div>
      <h1>${escHtml(trScenario(scenario, 'title'))}</h1>
      <p>${escHtml(trScenario(scenario, 'description'))}</p>
    </div>
    ${skillLinks ? `<div class="section-label" style="margin-top:16px">${escHtml(ui('skillsUsed'))}</div><div class="tags">${skillLinks}</div>` : ''}
    <div style="margin-top:16px">${steps}</div>
    ${nextBlock}`
}

// ── Render: Skill detail ────────────────────────────────────────────────────
function renderSkill(main, id) {
  const skill = state.skills.find(s => s.id === id)
  if (!skill) { main.innerHTML = `<div class="error">${escHtml(ui('skillNotFound'))}</div>`; return }

  const whenTags = trSkill(skill, 'whenToUse').map(w => `<span class="tag">${escHtml(w)}</span>`).join('')

  const phasesBlock = skill.phases ? `
    <div class="section-label">${escHtml(ui('howItWorks'))}</div>
    <div class="phases-grid">
      ${skill.phases.map((p, i) => `
        <div class="phase-card">
          <div class="phase-label" style="color:${phaseColor(p.color)}">${escHtml(trPhase(skill, i, 'label'))}</div>
          <div class="phase-detail">${escHtml(trPhase(skill, i, 'detail'))}</div>
        </div>`).join('')}
    </div>` : ''

  const scenarioLinks = (skill.usedInScenarios || []).map(sid => {
    const s = state.scenarios.find(sc => sc.id === sid)
    const label = s ? `${s.icon} ${trScenario(s, 'title')}` : sid
    return `<a href="#/scenario/${sid}" class="tag-link">${escHtml(label)}</a>`
  }).join('')

  main.innerHTML = `
    <div class="skill-header">
      <div class="skill-header-left">
        <div class="skill-category">${escHtml(trCategory(skill.category))}</div>
        <div class="skill-name">${escHtml(skill.name)}</div>
        <div class="skill-desc">${escHtml(trSkill(skill, 'description'))}</div>
      </div>
      <div class="skill-header-right">${makeCopyBlock(skill.command)}</div>
    </div>
    <div class="section-label">${escHtml(ui('whenToUse'))}</div>
    <div class="tags">${whenTags}</div>
    ${phasesBlock}
    ${scenarioLinks ? `<div class="section-label">${escHtml(ui('usedIn'))}</div><div class="tags">${scenarioLinks}</div>` : ''}`
}

// ── Render: Search results ─────────────────────────────────────────────────
function renderSearch(main, q) {
  if (!q) { main.innerHTML = `<div class="loading">${escHtml(ui('searchStart'))}</div>`; return }
  if (!state.fuse) { main.innerHTML = '<div class="loading">Loading…</div>'; return }

  const results = state.fuse.search(q)
  const scenarios = results.filter(r => r.item._type === 'scenario').map(r => r.item)
  const skills = results.filter(r => r.item._type === 'skill').map(r => r.item)

  if (!results.length) {
    const browseLink = `<a href="#/skills" style="color:var(--accent)">${escHtml(ui('browseAllSkillsLink'))}</a>`
    main.innerHTML = `
      <div class="search-summary">${escHtml(ui('noResults'))} <strong>${escHtml(q)}</strong></div>
      <div class="no-results">${escHtml(ui('noResultsTip'))} ${browseLink}.</div>`
    return
  }

  const countLabel = `${escHtml(fmt('resultsFor', { n: results.length }))} <strong>${escHtml(q)}</strong>`

  const scenarioItems = scenarios.map(s => `
    <a href="#/scenario/${s.id}" class="result-item">
      <div class="result-icon">${escHtml(s.icon)}</div>
      <div>
        <div class="result-title">${escHtml(s.title)}</div>
        <div class="result-desc">${escHtml(s.description)}</div>
      </div>
      <div class="result-arrow">→</div>
    </a>`).join('')

  const skillItems = skills.map(s => `
    <a href="#/skill/${s.id}" class="result-item">
      <div class="result-command"><code>${escHtml(s.command)}</code></div>
      <div>
        <div class="result-title">${escHtml(s.name)}</div>
        <div class="result-desc">${escHtml(s.description)}</div>
      </div>
      <div class="result-arrow">→</div>
    </a>`).join('')

  main.innerHTML = `
    <div class="search-summary">${countLabel}</div>
    ${scenarioItems ? `<div class="result-group-label">${escHtml(ui('scenariosLabel'))}</div>${scenarioItems}` : ''}
    ${skillItems ? `<div class="result-group-label">${escHtml(ui('skillsLabel'))}</div>${skillItems}` : ''}`
}

// ── Render: All skills ─────────────────────────────────────────────────────
function renderAllSkills(main) {
  const categories = [...new Set(state.skills.map(s => s.category))]

  const groups = categories.map(cat => {
    const items = state.skills.filter(s => s.category === cat).map(s => `
      <a href="#/skill/${s.id}" class="skill-item">
        <div class="skill-item-command"><code>${escHtml(s.command)}</code></div>
        <div>
          <div class="skill-item-name">${escHtml(s.name)}</div>
          <div class="skill-item-desc">${escHtml(trSkill(s, 'description'))}</div>
        </div>
      </a>`).join('')
    return `
      <div class="skills-category">
        <div class="skills-category-title">${escHtml(trCategory(cat))}</div>
        ${items}
      </div>`
  }).join('')

  const subtitle = fmt('allSkillsSubtitle', { n: state.skills.length, c: categories.length })

  main.innerHTML = `
    <div class="skills-page-header">
      <h1>${escHtml(ui('allSkillsH1'))}</h1>
      <p>${escHtml(subtitle)}</p>
    </div>
    ${groups}`
}

document.addEventListener('DOMContentLoaded', init)
