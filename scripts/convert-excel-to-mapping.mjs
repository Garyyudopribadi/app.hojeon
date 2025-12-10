import fs from 'fs'
import path from 'path'

const inspectPath = path.join('scripts', 'output', 'scope2_market_sheet_inspect.json')
const outPath = path.join('public', 'data', 'scope2_market_excel_map.json')

if (!fs.existsSync(inspectPath)) {
  console.error('Inspect output not found:', inspectPath)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(inspectPath, 'utf8'))
const rows = raw.rows || []
const map = {}

rows.forEach(r => {
  const vals = r.values || {}
  const entity = (vals.col_1 || vals['Name of Entity'] || vals['Name of Entity '] || '').toString().trim()
  const facility = (vals.col_2 || vals['Name of Facility'] || vals['Name of Facility '] || '').toString().trim()
  if (!entity && !facility) return

  ['2022','2023','2024'].forEach(y => {
    const v = vals[y]
    if (v !== null && v !== undefined && v !== '') {
      const key = `${entity}||${facility}||${y}`
      // store numeric value (ensure number)
      map[key] = Number(v)
    }
  })
})

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(map, null, 2))
console.log('Wrote mapping to', outPath)
