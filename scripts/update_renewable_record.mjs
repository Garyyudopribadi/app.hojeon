import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env.local')

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const envContent = readFileSync(envPath, 'utf8')
    const envLines = envContent.split('\n')
    envLines.forEach(line => {
      const [key, value] = line.split('=')
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value
      } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        supabaseAnonKey = value
      }
    })
  } catch (err) {
    console.error('Could not read .env.local file')
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateRenewableRecord() {
  try {
    console.log('Inserting new record...')

    const { data, error } = await supabase
      .from('ghg_scopetwo_renewableenergy')
      .insert({
        id: 4,
        october: 152.6216,
        november: 158.3761,
        december: 131.1382,
        total_energy_used: 442.136,
        unit: 'MWh',
        // Add other required fields with default values
        entity: 'Test Entity',
        facility: 'Test Facility',
        year: 2024,
        classification: 'Solar',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        total_purchase: 442.136,
        currency: 'IDR',
        supplier_name: 'Test Supplier',
        distinction: 'Renewable',
        energy_source: 'Solar',
        contract_duration: '1 year',
        date_collection: '2024',
        certificate_availability: true,
        contract_information: 'Test contract',
        updated_by: 'System'
      })

    if (error) {
      console.error('Error inserting record:', error)
      return
    }

    console.log('Record inserted successfully:', data)
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

updateRenewableRecord()