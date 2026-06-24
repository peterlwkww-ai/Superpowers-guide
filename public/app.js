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

// ── Render: Home ───────────────────────────────────────────────────────────
function renderHome(main) {
  const cards = state.scenarios.map(s => `
    <a href="#/scenario/${s.id}" class="scenario-card">
      <div class="scenario-icon">${escHtml(s.icon)}</div>
      <div class="scenario-title">${escHtml(s.title)}</div>
      <div class="scenario-desc">${escHtml(s.description)}</div>
      <div class="scenario-meta">${s.skillCount} skill${s.skillCount !== 1 ? 's' : ''} · ${escHtml(s.estimatedTime)}</div>
    </a>`).join('')

  main.innerHTML = `
    <div class="hero">
      <h1>⚡ Superpowers Guide</h1>
      <p>A scenario-first reference for building great projects with Claude's superpowers plugin.</p>
    </div>
    <div class="scenario-grid">${cards}</div>
    <div class="page-footer">
      <a href="#/skills">Browse all 13 skills →</a>
    </div>`
}

// ── Render: Scenario walkthrough ───────────────────────────────────────────
function renderScenario(main, id) {
  const scenario = state.scenarios.find(s => s.id === id)
  if (!scenario) { main.innerHTML = '<div class="error">Scenario not found.</div>'; return }

  const stepColors = ['var(--accent)', 'var(--success)', 'var(--purple)', 'var(--red)', 'var(--yellow)']

  const steps = scenario.steps.map(step => {
    const color = stepColors[(step.number - 1) % stepColors.length]
    const commandBlock = step.command ? makeCopyBlock(step.command) : ''
    const savesBlock = step.saves
      ? `<div class="step-saves" style="margin-top:8px">Saves to: <code>${escHtml(step.saves)}</code></div>`
      : ''
    const browseBlock = step.browseLink
      ? `<div style="margin-top:8px"><a href="${escHtml(step.browseLink)}" class="tag-link">Browse skills →</a></div>`
      : ''

    return `
      <div class="step-block">
        <div class="step-header">
          <div class="step-number" style="background:${color}">${step.number}</div>
          <div class="step-title">${escHtml(step.title)}</div>
        </div>
        <div class="step-body">
          <div class="step-instruction">${escHtml(step.instruction)}</div>
          ${commandBlock}
          <div class="step-hint"><strong>What Claude does:</strong> ${escHtml(step.whatClaudeDoes)}</div>
          <div class="step-expect"><strong style="color:var(--text)">What to expect:</strong> ${escHtml(step.whatToExpect)}</div>
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
        <span>Next scenario</span>
        <a href="#/scenario/${next.id}">${escHtml(next.icon)} ${escHtml(next.title)} →</a>
      </div>` : ''
  })() : ''

  main.innerHTML = `
    <div class="scenario-hero">
      <div class="scenario-hero-icon">${escHtml(scenario.icon)}</div>
      <h1>${escHtml(scenario.title)}</h1>
      <p>${escHtml(scenario.description)}</p>
    </div>
    ${skillLinks ? `<div class="section-label" style="margin-top:16px">Skills used</div><div class="tags">${skillLinks}</div>` : ''}
    <div style="margin-top:16px">${steps}</div>
    ${nextBlock}`
}

// ── Render: Skill detail ────────────────────────────────────────────────────
function renderSkill(main, id) {
  const skill = state.skills.find(s => s.id === id)
  if (!skill) { main.innerHTML = '<div class="error">Skill not found.</div>'; return }

  const whenTags = skill.whenToUse.map(w => `<span class="tag">${escHtml(w)}</span>`).join('')

  const phasesBlock = skill.phases ? `
    <div class="section-label">How it works</div>
    <div class="phases-grid">
      ${skill.phases.map(p => `
        <div class="phase-card">
          <div class="phase-label" style="color:${p.color}">${escHtml(p.label)}</div>
          <div class="phase-detail">${escHtml(p.detail)}</div>
        </div>`).join('')}
    </div>` : ''

  const scenarioLinks = (skill.usedInScenarios || []).map(sid => {
    const s = state.scenarios.find(sc => sc.id === sid)
    const label = s ? `${s.icon} ${s.title}` : sid
    return `<a href="#/scenario/${sid}" class="tag-link">${escHtml(label)}</a>`
  }).join('')

  main.innerHTML = `
    <div class="skill-header">
      <div class="skill-header-left">
        <div class="skill-category">${escHtml(skill.category)}</div>
        <div class="skill-name">${escHtml(skill.name)}</div>
        <div class="skill-desc">${escHtml(skill.description)}</div>
      </div>
      <div class="skill-header-right">${makeCopyBlock(skill.command)}</div>
    </div>
    <div class="section-label">When to use</div>
    <div class="tags">${whenTags}</div>
    ${phasesBlock}
    ${scenarioLinks ? `<div class="section-label">Used in scenarios</div><div class="tags">${scenarioLinks}</div>` : ''}`
}

// ── Render: Search results ─────────────────────────────────────────────────
function renderSearch(main, q) {
  if (!q) { main.innerHTML = '<div class="loading">Start typing to search…</div>'; return }
  if (!state.fuse) { main.innerHTML = '<div class="loading">Loading…</div>'; return }

  const results = state.fuse.search(q)
  const scenarios = results.filter(r => r.item._type === 'scenario').map(r => r.item)
  const skills = results.filter(r => r.item._type === 'skill').map(r => r.item)

  if (!results.length) {
    main.innerHTML = `
      <div class="search-summary">No results for <strong>${escHtml(q)}</strong></div>
      <div class="no-results">Try a different keyword, or <a href="#/skills" style="color:var(--accent)">browse all skills</a>.</div>`
    return
  }

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
    <div class="search-summary">${results.length} result${results.length !== 1 ? 's' : ''} for <strong>${escHtml(q)}</strong></div>
    ${scenarioItems ? `<div class="result-group-label">Scenarios</div>${scenarioItems}` : ''}
    ${skillItems ? `<div class="result-group-label">Skills</div>${skillItems}` : ''}`
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
          <div class="skill-item-desc">${escHtml(s.description)}</div>
        </div>
      </a>`).join('')
    return `
      <div class="skills-category">
        <div class="skills-category-title">${escHtml(cat)}</div>
        ${items}
      </div>`
  }).join('')

  main.innerHTML = `
    <div class="skills-page-header">
      <h1>All Skills</h1>
      <p>13 superpowers skills across ${categories.length} categories</p>
    </div>
    ${groups}`
}

document.addEventListener('DOMContentLoaded', init)
