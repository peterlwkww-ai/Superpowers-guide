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
  assert.ok(index.body.includes('id="main"'), 'index.html should contain #main')
  console.log('✓ GET / returns 200 with #main')

  const scenarios = await get('http://localhost:3001/data/scenarios.json')
  assert.strictEqual(scenarios.status, 200, 'GET /data/scenarios.json should return 200')
  assert.ok(!scenarios.body.includes('<html'), '/data/scenarios.json should not return HTML')
  console.log('✓ GET /data/scenarios.json returns 200')

  const skills = await get('http://localhost:3001/data/skills.json')
  assert.strictEqual(skills.status, 200, 'GET /data/skills.json should return 200')
  assert.ok(!skills.body.includes('<html'), '/data/skills.json should not return HTML')
  console.log('✓ GET /data/skills.json returns 200')

  console.log('\nAll tests passed.')
}

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

runTests()
  .then(() => server.close())
  .catch(err => {
    console.error('FAIL:', err.message)
    server.close()
    process.exit(1)
  })
