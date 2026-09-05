const express = require('express')
const path = require('path')

// public/ is a self-contained static site (also deployed to GitHub Pages).
// Express only serves it locally and falls back to index.html for the SPA.
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Superpowers Guide running at http://localhost:${PORT}`)
  }
})

module.exports = server
