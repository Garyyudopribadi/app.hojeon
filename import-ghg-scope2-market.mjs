import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
    }
  } catch (error) {
    console.log('⚠️  Could not load .env.local file');
  }
}

loadEnv();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('='.repeat(80));
console.log('IMPORTING SCOPE 2 MARKET DATA TO SUPABASE');
console.log('='.repeat(80));

const csvFilePath = './data/scope2_market_import.csv';
const tableName = 'ghg_scope2_market';

// Check if table exists and get structure
async function checkTable() {
  console.log(`\n📋 Checking table: ${tableName}`);
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error checking table:', error.message);
    console.log('\n💡 Please ensure the table exists with the following structure:');
    console.log(`
CREATE TABLE IF NOT EXISTS ${tableName} (
  id BIGSERIAL PRIMARY KEY,
  no INTEGER NOT NULL,
  entity TEXT NOT NULL,
  facility TEXT NOT NULL,
  country TEXT NOT NULL,
  classification TEXT NOT NULL,
  january DECIMAL(20, 10) DEFAULT 0,
  february DECIMAL(20, 10) DEFAULT 0,
  march DECIMAL(20, 10) DEFAULT 0,
  april DECIMAL(20, 10) DEFAULT 0,
  may DECIMAL(20, 10) DEFAULT 0,
  june DECIMAL(20, 10) DEFAULT 0,
  july DECIMAL(20, 10) DEFAULT 0,
  august DECIMAL(20, 10) DEFAULT 0,
  september DECIMAL(20, 10) DEFAULT 0,
  october DECIMAL(20, 10) DEFAULT 0,
  november DECIMAL(20, 10) DEFAULT 0,
  december DECIMAL(20, 10) DEFAULT 0,
  unit TEXT DEFAULT 'MWh',
  currency TEXT,
  supplier TEXT,
  year INTEGER NOT NULL,
  total_amount DECIMAL(20, 10) DEFAULT 0,
  total_mj DECIMAL(20, 10) DEFAULT 0,
  kgco2 DECIMAL(20, 10) DEFAULT 0,
  kgch4 DECIMAL(20, 10) DEFAULT 0,
  kgn2o DECIMAL(20, 10) DEFAULT 0,
  tco2eq DECIMAL(20, 10) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_scope2_market_entity_year ON ${tableName}(entity, year);
CREATE INDEX IF NOT EXISTS idx_scope2_market_facility ON ${tableName}(facility);
    `);
    return false;
  }
  
  console.log('✅ Table exists and is accessible');
  return true;
}

// Clear existing data (optional)
async function clearExistingData() {
  console.log('\n🗑️  Checking for existing data...');
  
  const { data: existingData, error: countError } = await supabase
    .from(tableName)
    .select('id', { count: 'exact' });
  
  if (countError) {
    console.error('❌ Error checking existing data:', countError.message);
    return false;
  }
  
  if (existingData && existingData.length > 0) {
    console.log(`⚠️  Found ${existingData.length} existing records`);
    console.log('🗑️  Deleting existing data...');
    
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error deleting existing data:', deleteError.message);
      return false;
    }
    
    console.log('✅ Existing data cleared');
  } else {
    console.log('✅ No existing data found');
  }
  
  return true;
}

// Parse CSV line manually
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

// Read CSV and import data
async function importData() {
  try {
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header
    const headers = parseCSVLine(lines[0]);
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length < headers.length) continue; // Skip incomplete rows
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Parse to proper types
      const record = {
        no: parseInt(row.no),
        entity: row.entity,
        facility: row.facility,
        country: row.country,
        classification: row.classification,
        january: parseFloat(row.january) || 0,
        february: parseFloat(row.february) || 0,
        march: parseFloat(row.march) || 0,
        april: parseFloat(row.april) || 0,
        may: parseFloat(row.may) || 0,
        june: parseFloat(row.june) || 0,
        july: parseFloat(row.july) || 0,
        august: parseFloat(row.august) || 0,
        september: parseFloat(row.september) || 0,
        october: parseFloat(row.october) || 0,
        november: parseFloat(row.november) || 0,
        december: parseFloat(row.december) || 0,
        unit: row.unit || 'MWh',
        currency: row.currency || '',
        supplier: row.supplier || '',
        year: parseInt(row.year),
        total_amount: parseFloat(row.total_amount) || 0,
        total_mj: parseFloat(row.total_mj) || 0,
        kgco2: parseFloat(row.kgco2) || 0,
        kgch4: parseFloat(row.kgch4) || 0,
        kgn2o: parseFloat(row.kgn2o) || 0,
        tco2eq: parseFloat(row.tco2eq) || 0
      };
      
      records.push(record);
    }
    console.log(`\n📊 Read ${records.length} records from CSV`);
    console.log('\n📤 Inserting data to Supabase...');
    
    // Insert in batches of 10
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully inserted: ${successCount} records`);
    if (errorCount > 0) {
      console.log(`❌ Failed to insert: ${errorCount} records`);
    }
    console.log('='.repeat(80));
    
    // Verify data
    console.log('\n🔍 Verifying imported data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from(tableName)
      .select('*')
      .order('no', { ascending: true });
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError.message);
    } else {
      console.log(`✅ Total records in database: ${verifyData.length}`);
      console.log('\n📊 Sample records:');
      verifyData.slice(0, 3).forEach(record => {
        console.log(`  - Row ${record.no}: ${record.entity} (${record.facility}) - Year ${record.year}`);
        console.log(`    Total: ${record.total_amount} ${record.unit}, tCO2eq: ${record.tco2eq}`);
      });
    }
    
    return successCount;
  } catch (error) {
    console.error('❌ Error reading or parsing CSV:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ CSV file not found: ${csvFilePath}`);
      console.log('💡 Please run: python export_scope2_market_to_csv.py');
      process.exit(1);
    }
    
    console.log(`✅ Found CSV file: ${csvFilePath}`);
    
    // Check table
    const tableExists = await checkTable();
    if (!tableExists) {
      console.log('\n❌ Table check failed. Please create the table first.');
      process.exit(1);
    }
    
    // Clear existing data
    const cleared = await clearExistingData();
    if (!cleared) {
      console.log('\n⚠️  Warning: Could not clear existing data. Proceeding anyway...');
    }
    
    // Import data
    await importData();
    
    console.log('\n✅ IMPORT COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
main();
