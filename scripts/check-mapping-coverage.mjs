#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const workspaceRoot = process.cwd()
const mockPath = path.join(workspaceRoot, 'public', 'data', 'scope2_market_mock.json')
const mapPath = path.join(workspaceRoot, 'public', 'data', 'scope2_market_excel_map.json')
const outDir = path.join(workspaceRoot, 'scripts', 'output')
const outPath = path.join(outDir, 'mapping_coverage_report.json')

function safeReadJson(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read', p, e.message)
    return null
  }
}

function norm(s) {
  if (s === null || s === undefined) return ''
  return String(s)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .toUpperCase()
}

const mock = safeReadJson(mockPath)
const mapping = safeReadJson(mapPath) || {}

if (!mock) {
  console.error('Mock data not found at', mockPath)
  process.exit(1)
}

// Build reverse index of mapping keys and detect duplicates
// Build normalized mapping index and detect duplicates
const normalizedMapping = {}
const mapKeyCounts = new Map()
Object.keys(mapping).forEach(k => {
  const nk = norm(k)
  normalizedMapping[nk] = mapping[k]
  mapKeyCounts.set(nk, (mapKeyCounts.get(nk) || 0) + 1)
})
const duplicateMapKeys = Array.from(mapKeyCounts.entries()).filter(([,c]) => c > 1).map(([k]) => k)

const results = []
let matchedByNoYear = 0
let matchedByEntityFacilityYear = 0

for (const row of mock) {
  const no = row.no != null ? String(row.no) : ''
  const year = row.year != null ? String(row.year) : ''
  const e = norm(row.entity)
  const f = norm(row.facility)
  const keyNoYear = `${no}||${year}`
  const keyEFYraw = `${e}||${f}||${year}`
  const keyEFY = norm(keyEFYraw)
  const keyEFY_alt_raw = `${e}||${e}||${year}`
  const keyEFY_alt = norm(keyEFY_alt_raw)

  const foundNoYear = Object.prototype.hasOwnProperty.call(mapping, keyNoYear) || Object.prototype.hasOwnProperty.call(normalizedMapping, norm(keyNoYear))
  const foundEFY = Object.prototype.hasOwnProperty.call(normalizedMapping, keyEFY) || Object.prototype.hasOwnProperty.call(normalizedMapping, keyEFY_alt)

  if (foundNoYear) matchedByNoYear++
  if (foundEFY) matchedByEntityFacilityYear++

  const mappedValueNo = foundNoYear ? (mapping[keyNoYear] != null ? Number(mapping[keyNoYear]) : (normalizedMapping[norm(keyNoYear)] != null ? Number(normalizedMapping[norm(keyNoYear)]) : null)) : null
  const mappedValueEfy = foundEFY ? (normalizedMapping[keyEFY] != null ? Number(normalizedMapping[keyEFY]) : (normalizedMapping[keyEFY_alt] != null ? Number(normalizedMapping[keyEFY_alt]) : null)) : null

  results.push({
    no: no || null,
    year: year || null,
    entity: row.entity || null,
    facility: row.facility || null,
    mock_tCO2eq: row.tCO2eq != null ? Number(row.tCO2eq) : null,
    keyNoYear,
    keyEFY: keyEFYraw,
    keyEFY_alternative: keyEFY_alt_raw,
    mappedValueNo,
    mappedValueEfy,
    matchedNoYear: foundNoYear,
    matchedEFY: foundEFY
  })
}

const unmatched = results.filter(r => !r.matchedNoYear && !r.matchedEFY)
const matchedEither = results.filter(r => r.matchedNoYear || r.matchedEFY)

const report = {
  generated_at: new Date().toISOString(),
  counts: {
    total_rows: mock.length,
    matched_by_no_year: matchedByNoYear,
    matched_by_entity_facility_year: matchedByEntityFacilityYear,
    matched_either: matchedEither.length,
    unmatched: unmatched.length,
    duplicate_mapping_keys: duplicateMapKeys.length
  },
  duplicates: duplicateMapKeys,
  unmatched_rows: unmatched,
  sample_matches: matchedEither.slice(0, 50),
}

try {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')
  console.log('Wrote mapping coverage report to', outPath)
  console.log('Summary:', report.counts)
} catch (e) {
  console.error('Failed to write report', e.message)
  process.exit(2)
}
