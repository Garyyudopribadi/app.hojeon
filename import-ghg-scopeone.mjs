import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables manually from .env.local
const envPath = path.join(process.cwd(), '.env.local')
let supabaseUrl = ''
let supabaseKey = ''

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].replace(/['"]/g, '')
    } else if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('=')[1].replace(/['"]/g, '')
    }
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simple CSV parser that handles quoted fields
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add the last field
  result.push(current)
  
  return result
}

async function importGHGScopeOneData() {
  try {
    console.log('🔍 Reading CSV file...')

    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'data', 'ghg_scopeone_rows.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')

    // Parse CSV with proper handling of quoted fields
    const lines = csvContent.split('\n').filter(line => line.trim())
    const rawHeaders = parseCSVLine(lines[0])
    const headers = rawHeaders.map(h => h.trim().replace(/\r$/, '')) // Remove trailing \r

    console.log(`📊 Found ${lines.length - 1} records to import`)
    console.log(`📋 Headers: ${headers.length}`, headers.slice(0, 5), '...')

    // Parse data rows
    const records = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length !== headers.length) {
        console.warn(`⚠️ Skipping line ${i + 1}: expected ${headers.length} columns, got ${values.length}`)
        continue
      }

      const record = {}
      headers.forEach((header, index) => {
        let value = values[index]?.trim() || ''

        // Convert comma decimal separators to dots for numeric fields
        if (['january', 'february', 'maret', 'april', 'may', 'june', 'july', 'augustus', 'september', 'october', 'november', 'december',
             'fuel_usage', 'fuel_consumption(Kg)', 'energy_consumption(MJ)', 'ghg_emissions(tCO2eq)', 'kgCO2', 'kgCH4', 'kgN2O'].includes(header)) {
          value = value.replace(/,/g, '.')
        }

        // Handle empty dates
        if (header === 'updated_date' && (!value || value === '')) {
          value = new Date().toISOString()
        }

        record[header] = value
      })

      records.push(record)
    }

    console.log('📤 Importing records to Supabase...')

    // Insert in batches to avoid payload size limits
    const batchSize = 50
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      console.log(`📦 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${batch.length} records)`)

      const { data, error } = await supabase
        .from('ghg_scopeone')
        .insert(batch)
        .select()

      if (error) {
        console.error('❌ Error inserting batch:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        console.error('Failed records sample:', batch.slice(0, 1))
        return
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Insert returned no data - possible constraint violation')
        console.warn('Sample record:', batch[0])
      } else {
        console.log(`✅ Successfully imported ${data?.length || 0} records`)
      }
    }

    console.log('🎉 Import completed successfully!')

    // Verify the import
    const { count, error: countError } = await supabase
      .from('ghg_scopeone')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error verifying count:', countError)
    } else {
      console.log(`📊 Total records in database: ${count}`)
    }

  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

importGHGScopeOneData()