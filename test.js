const http = require('http')
const assert = require('assert')
const fs = require('fs')

// Start server for testing
process.env.PORT = '3001'
const server = require('./index.js')

const SKILL_COUNT = 14
const SCENARIO_COUNT = 7

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
  assert.ok(index.body.includes('id="main"'), 'index.html should contain #main')
  console.log('✓ GET / returns 200 with #main')

  for (const file of ['scenarios.json', 'skills.json', 'zh-TW.json', 'meta.json']) {
    const res = await get(`http://localhost:3001/data/${file}`)
    assert.strictEqual(res.status, 200, `GET /data/${file} should return 200`)
    assert.ok(!res.body.includes('<html'), `/data/${file} should not return HTML`)
    console.log(`✓ GET /data/${file} returns 200`)
  }

  console.log('\nAll tests passed.')
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(`./data/${file}`, 'utf8'))
}

// Validate scenarios.json structure
function validateScenarios() {
  const scenarios = loadJson('scenarios.json')
  assert.ok(Array.isArray(scenarios), 'scenarios must be an array')
  assert.strictEqual(scenarios.length, SCENARIO_COUNT, `must have exactly ${SCENARIO_COUNT} scenarios`)
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
  console.log(`✓ scenarios.json valid — ${SCENARIO_COUNT} scenarios, all steps valid`)
  return scenarios
}

function validateSkills() {
  const skills = loadJson('skills.json')
  assert.ok(Array.isArray(skills), 'skills must be an array')
  assert.strictEqual(skills.length, SKILL_COUNT, `must have exactly ${SKILL_COUNT} skills`)
  skills.forEach((s, i) => {
    assert.ok(s.id, `skill[${i}] must have id`)
    assert.ok(s.name, `skill[${i}] must have name`)
    assert.ok(s.command, `skill[${i}] must have command`)
    assert.ok(s.category, `skill[${i}] must have category`)
    assert.ok(s.description, `skill[${i}] must have description`)
    assert.ok(Array.isArray(s.whenToUse), `skill[${i}] must have whenToUse array`)
  })
  console.log(`✓ skills.json valid — ${SKILL_COUNT} skills, all fields present`)
  return skills
}

// Every scenario/skill referenced from the other file must exist
function validateCrossRefs(scenarios, skills) {
  const scenarioIds = new Set(scenarios.map(s => s.id))
  const skillIds = new Set(skills.map(s => s.id))
  scenarios.forEach(s => {
    ;(s.skillIds || []).forEach(id => assert.ok(skillIds.has(id), `scenario ${s.id} references unknown skill ${id}`))
    if (s.nextScenario) assert.ok(scenarioIds.has(s.nextScenario), `scenario ${s.id} has unknown nextScenario ${s.nextScenario}`)
  })
  skills.forEach(s => {
    ;(s.usedInScenarios || []).forEach(id => assert.ok(scenarioIds.has(id), `skill ${s.id} references unknown scenario ${id}`))
  })
  console.log('✓ cross-references between scenarios and skills are valid')
}

// Every scenario, step, skill and phase must have a zh-TW translation
function validateTranslations(scenarios, skills) {
  const zh = loadJson('zh-TW.json')
  assert.ok(zh.ui && zh.categories && zh.scenarios && zh.skills, 'zh-TW.json must have ui, categories, scenarios, skills')

  scenarios.forEach(s => {
    const t = zh.scenarios[s.id]
    assert.ok(t, `zh-TW missing scenario ${s.id}`)
    for (const f of ['title', 'description', 'estimatedTime']) assert.ok(t[f], `zh-TW scenario ${s.id} missing ${f}`)
    assert.strictEqual((t.steps || []).length, s.steps.length, `zh-TW scenario ${s.id} step count mismatch`)
    s.steps.forEach((step, i) => {
      for (const f of ['title', 'instruction', 'whatClaudeDoes', 'whatToExpect']) {
        assert.ok(t.steps[i][f], `zh-TW scenario ${s.id} step ${i + 1} missing ${f}`)
      }
    })
    assert.ok(zh.categories, 'categories')
  })

  skills.forEach(s => {
    const t = zh.skills[s.id]
    assert.ok(t, `zh-TW missing skill ${s.id}`)
    assert.ok(t.description, `zh-TW skill ${s.id} missing description`)
    assert.strictEqual((t.whenToUse || []).length, s.whenToUse.length, `zh-TW skill ${s.id} whenToUse count mismatch`)
    if (s.phases) assert.strictEqual((t.phases || []).length, s.phases.length, `zh-TW skill ${s.id} phase count mismatch`)
    assert.ok(zh.categories[s.category], `zh-TW missing category ${s.category}`)
  })
  console.log('✓ zh-TW.json covers every scenario, step, skill and phase')
}

function validateMeta() {
  const meta = loadJson('meta.json')
  assert.ok(/^\d+\.\d+\.\d+$/.test(meta.superpowersVersion), 'meta.json must have superpowersVersion like 6.3.0')
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(meta.contentUpdated), 'meta.json must have contentUpdated as YYYY-MM-DD')
  console.log(`✓ meta.json valid — content matches superpowers v${meta.superpowersVersion}`)
}

const scenarios = validateScenarios()
const skills = validateSkills()
validateCrossRefs(scenarios, skills)
validateTranslations(scenarios, skills)
validateMeta()

runTests()
  .then(() => server.close())
  .catch(err => {
    console.error('FAIL:', err.message)
    server.close()
    process.exit(1)
  })
