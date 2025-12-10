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

async function verifyRecord() {
  try {
    console.log('Fetching all records from ghg_scopetwo_renewableenergy...')

    const { data, error } = await supabase
      .from('ghg_scopetwo_renewableenergy')
      .select('id, october, november, december, total_energy_used, unit')
      .order('id')

    if (error) {
      console.error('Error fetching records:', error)
      return
    }

    console.log('All records:', data)
    console.log('Total records:', data?.length || 0)
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

verifyRecord()