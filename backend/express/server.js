const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5055

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'alss-express', version: '0.1.0' })
})

app.post('/api/scan', (req, res) => {
  const { url } = req.body || {}
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ status: 'error', details: 'Missing or invalid url' })
  }
  // Simulated response per requirements
  return res.json({ status: 'safe', details: 'No malicious content detected.' })
})

app.listen(PORT, () => {
  console.log(`[alss-express] listening on http://127.0.0.1:${PORT}`)
})
