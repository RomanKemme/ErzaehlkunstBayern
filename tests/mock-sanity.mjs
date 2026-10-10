// Lokaler Ersatz für die Sanity-API: wertet GROQ-Abfragen mit groq-js gegen Testdaten aus.
// Start:  node mock-sanity.mjs <fixtures.ndjson> [port]
import http from 'node:http'
import fs from 'node:fs'
import { parse, evaluate } from 'groq-js'

const file = process.argv[2]
const port = Number(process.argv[3] || 8790)
const load = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
let dataset = file ? load(file) : []

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json')
    if (url.pathname === '/__dataset' && req.method === 'POST') {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        dataset = body.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
        res.end(JSON.stringify({ ok: true, count: dataset.length }))
      })
      return
    }
    try {
      const query = url.searchParams.get('query') || ''
      const params = {}
      for (const [k, v] of url.searchParams) if (k.startsWith('$')) params[k.slice(1)] = JSON.parse(v)
      const tree = parse(query, { params })
      // Wie die öffentliche Sanity-API: unveröffentlichte Entwürfe sind nicht sichtbar
      const published = dataset.filter((d) => !String(d._id).startsWith('drafts.'))
      const value = await evaluate(tree, { dataset: published, params })
      res.end(JSON.stringify({ query, result: await value.get() }))
    } catch (e) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: { description: String(e.message || e) } }))
    }
  })
  .listen(port, () => console.log('Mock-Sanity läuft auf Port ' + port + ' mit ' + dataset.length + ' Dokumenten'))
