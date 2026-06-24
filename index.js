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
