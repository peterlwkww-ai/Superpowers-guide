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

runTests()
  .then(() => server.close())
  .catch(err => {
    console.error('FAIL:', err.message)
    server.close()
    process.exit(1)
  })
