import pandas as pd
import csv

print("="*80)
print("EXPORTING SCOPE 2 MARKET DATA TO CSV FOR SUPABASE")
print("="*80)

# Read Excel file directly
df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

print(f"\nTotal rows in Excel: {len(df)}")

# Prepare data for CSV export
export_data = []

for idx, row in df.iterrows():
    if idx >= 28:  # Only first 28 rows
        break
    
    record = {
        'no': int(row['No.']) if not pd.isna(row['No.']) else idx + 1,
        'entity': str(row['Name of Entity']) if not pd.isna(row['Name of Entity']) else '',
        'facility': str(row['Name of Facility']) if not pd.isna(row['Name of Facility']) else '',
        'country': str(row['Country ']) if not pd.isna(row['Country ']) else '',
        'classification': str(row['Classification of Electricity/Steam']) if not pd.isna(row['Classification of Electricity/Steam']) else '',
        'january': float(row['Jan.1']) if not pd.isna(row['Jan.1']) else 0.0,
        'february': float(row['Feb.1']) if not pd.isna(row['Feb.1']) else 0.0,
        'march': float(row['Mar.1']) if not pd.isna(row['Mar.1']) else 0.0,
        'april': float(row['Apr.1']) if not pd.isna(row['Apr.1']) else 0.0,
        'may': float(row['May.1']) if not pd.isna(row['May.1']) else 0.0,
        'june': float(row['Jun.1']) if not pd.isna(row['Jun.1']) else 0.0,
        'july': float(row['Jul.1']) if not pd.isna(row['Jul.1']) else 0.0,
        'august': float(row['Aug.1']) if not pd.isna(row['Aug.1']) else 0.0,
        'september': float(row['Sep.1']) if not pd.isna(row['Sep.1']) else 0.0,
        'october': float(row['Oct.1']) if not pd.isna(row['Oct.1']) else 0.0,
        'november': float(row['Nov.1']) if not pd.isna(row['Nov.1']) else 0.0,
        'december': float(row['Dec.1']) if not pd.isna(row['Dec.1']) else 0.0,
        'unit': str(row['Unit.1']) if not pd.isna(row['Unit.1']) else '',
        'currency': str(row['Currency Unit']) if not pd.isna(row['Currency Unit']) else '',
        'supplier': str(row['Supplier Name']) if not pd.isna(row['Supplier Name']) else '',
        'year': int(row['Data Collection Year']) if not pd.isna(row['Data Collection Year']) else 0,
        'total_amount': float(row['Total Purchase Amount.2']) if not pd.isna(row['Total Purchase Amount.2']) else 0.0,
        'total_mj': float(row['Total Purchase Amount (MJ)']) if not pd.isna(row['Total Purchase Amount (MJ)']) else 0.0,
        'kgco2': float(row['kgCO2']) if not pd.isna(row['kgCO2']) else 0.0,
        'kgch4': float(row['kgCH4']) if not pd.isna(row['kgCH4']) else 0.0,
        'kgn2o': float(row['kgN2O']) if not pd.isna(row['kgN2O']) else 0.0,
        'tco2eq': float(row['tCO2eq']) if not pd.isna(row['tCO2eq']) else 0.0
    }
    
    export_data.append(record)

# Create DataFrame
df_export = pd.DataFrame(export_data)

# Export to CSV
csv_filename = 'data/scope2_market_import.csv'
df_export.to_csv(csv_filename, index=False, encoding='utf-8-sig')

print(f"\nSuccessfully exported {len(export_data)} rows to: {csv_filename}")
print("\nColumn names in CSV:")
for col in df_export.columns:
    print(f"  - {col}")

print("\nSample data (first 3 rows):")
print(df_export.head(3).to_string())

print("\n" + "="*80)
print("CSV EXPORT COMPLETE - READY FOR SUPABASE IMPORT")
print("="*80)

# Generate SQL INSERT statement sample
print("\nSample SQL INSERT statement:")
print("INSERT INTO ghg_scope2_market (")
print("  no, entity, facility, country, classification,")
print("  january, february, march, april, may, june,")
print("  july, august, september, october, november, december,")
print("  unit, currency, supplier, year,")
print("  total_amount, total_mj, kgco2, kgch4, kgn2o, tco2eq")
print(") VALUES")
print("  (1, 'HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', ...);")
