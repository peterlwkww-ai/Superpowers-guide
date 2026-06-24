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

// ── Stub render functions (replaced in Tasks 6–10) ────────────────────────
function renderHome(main) { main.innerHTML = '<div class="loading">Home view coming soon…</div>' }
function renderScenario(main, id) { main.innerHTML = `<div class="loading">Scenario: ${escHtml(id)}</div>` }
function renderSkill(main, id) { main.innerHTML = `<div class="loading">Skill: ${escHtml(id)}</div>` }
function renderSearch(main, q) { main.innerHTML = `<div class="loading">Search: ${escHtml(q)}</div>` }
function renderAllSkills(main) { main.innerHTML = '<div class="loading">All skills coming soon…</div>' }

document.addEventListener('DOMContentLoaded', init)
