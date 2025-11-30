import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phzyooddlafqozryxcqa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoenlvb2RkbGFmcW96cnl4Y3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTU4OTAsImV4cCI6MjA3NzYzMTg5MH0.CnwT-b-t4kxjFfbAjogb7dTFIAgkwdgPHgrB3QCmsc0'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Testing Supabase connection...\n')

// Test 1: Check if table exists and count records
const { data, error, count } = await supabase
  .from('ghg_scopeone')
  .select('*', { count: 'exact', head: false })
  .limit(5)

if (error) {
  console.error('❌ Error fetching data:', error.message)
  console.error('Error details:', error)
} else {
  console.log('✅ Connection successful!')
  console.log(`📊 Total records in ghg_scopeone: ${count}`)
  console.log(`📝 First 5 records:`)
  console.log(JSON.stringify(data, null, 2))
}

// Test 2: List all tables (this might require additional permissions)
console.log('\n🔍 Checking table structure...')
const { data: tableInfo, error: tableError } = await supabase
  .from('ghg_scopeone')
  .select('*')
  .limit(1)

if (tableError) {
  console.error('❌ Table error:', tableError.message)
} else {
  if (tableInfo && tableInfo.length > 0) {
    console.log('✅ Table columns:', Object.keys(tableInfo[0]))
  } else {
    console.log('⚠️ Table exists but has no data')
  }
}
