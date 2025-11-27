import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

function splitCSVLine(line: string) {
  const result: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = splitCSVLine(lines[0]).map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const values = splitCSVLine(line)
    const obj: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = values[i] ?? ''
    }
    return obj
  })
  return rows
}

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'ghg_scopeone_rows.csv')
    const content = await fs.readFile(csvPath, 'utf8')
    const data = parseCsv(content)
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message ?? 'Failed to read CSV' }, { status: 500 })
  }
}
