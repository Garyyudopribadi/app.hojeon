import pandas as pd
import re
import json
from decimal import Decimal

print("="*100)
print("EXCEL FILE ANALYSIS: Scope 2 Market-Based Emissions")
print("="*100)

# Read Excel file
try:
    df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                       sheet_name='3-3. (Raw data) Scope 2_Market',
                       header=4)
    print(f"\n✅ Excel file loaded successfully")
    print(f"Total rows in Excel: {len(df)}")
except Exception as e:
    print(f"\n❌ Error reading Excel file: {e}")
    exit(1)

print(f"\nColumn structure:")
for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

# Read mock data
print("\n" + "="*100)
print("READING MOCK DATA")
print("="*100)

try:
    with open('data/mock_data_ts.txt', 'r', encoding='utf-8') as f:
        mock_data_str = f.read()
    print(f"✅ Mock data file loaded successfully")
except Exception as e:
    print(f"❌ Error reading mock data: {e}")
    exit(1)

# Parse mock data (JavaScript object format)
mock_records = []
# Split by objects using regex
objects = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', mock_data_str, re.DOTALL)

for obj_str in objects:
    record = {}
    # Extract key-value pairs
    # Handle string values with quotes
    string_pattern = r"(\w+):\s*'([^']*)'"
    number_pattern = r"(\w+):\s*([0-9.]+)(?:[,\s]|$)"
    
    for match in re.finditer(string_pattern, obj_str):
        key, value = match.groups()
        record[key] = value
    
    for match in re.finditer(number_pattern, obj_str):
        key, value = match.groups()
        if key not in record:  # Don't override string values
            try:
                record[key] = float(value) if '.' in value else int(value)
            except:
                record[key] = value
    
    if record and 'id' in record:
        mock_records.append(record)

print(f"Total mock records parsed: {len(mock_records)}")

# Column mapping from Excel to mock data (based on actual Excel columns)
excel_to_mock = {
    'No.': 'no',
    'Name of Entity': 'entity',
    'Name of Facility': 'facility',
    'Country ': 'country',
    'Classification of Electricity/Steam': 'classification',
    'Jan.1': 'january',
    'Feb.1': 'february',
    'Mar.1': 'march',
    'Apr.1': 'april',
    'May.1': 'may',
    'Jun.1': 'june',
    'Jul.1': 'july',
    'Aug.1': 'august',
    'Sep.1': 'september',
    'Oct.1': 'october',
    'Nov.1': 'november',
    'Dec.1': 'december',
    'Unit.1': 'unit',
    'Currency Unit': 'currency',
    'Supplier Name': 'supplier',
    'Data Collection Year': 'year',
    'Total Purchase Amount.2': 'total_amount',
    'Total Purchase Amount (MJ)': 'total_mj',
    'kgCO2': 'kgCO2',
    'kgCH4': 'kgCH4',
    'kgN2O': 'kgN2O',
    'tCO2eq': 'tCO2eq'
}

month_cols_excel = ['Jan.1', 'Feb.1', 'Mar.1', 'Apr.1', 'May.1', 'Jun.1', 'Jul.1', 'Aug.1', 'Sep.1', 'Oct.1', 'Nov.1', 'Dec.1']
month_cols_mock = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

print("\n" + "="*100)
print("DETAILED ROW-BY-ROW COMPARISON")
print("="*100)

all_differences = []
excel_data_for_new_mock = []

def compare_values(excel_val, mock_val, field_name, tolerance=0.01):
    """Compare two values with tolerance for floating point numbers"""
    # Handle NaN and None
    if pd.isna(excel_val) and (mock_val is None or mock_val == '' or mock_val == 0):
        return True
    if pd.isna(excel_val) or mock_val is None:
        if pd.isna(excel_val) and field_name in ['currency', 'supplier']:
            return mock_val == ''
        return False
    
    # For numeric comparisons
    try:
        if isinstance(excel_val, (int, float)) and isinstance(mock_val, (int, float)):
            if excel_val == 0 and mock_val == 0:
                return True
            return abs(float(excel_val) - float(mock_val)) < tolerance
    except:
        pass
    
    # For string comparisons
    return str(excel_val).strip() == str(mock_val).strip()

# Compare each row
for idx, excel_row in df.iterrows():
    if idx >= 28:  # Only process first 28 rows
        break
    
    row_no = int(excel_row['No.']) if not pd.isna(excel_row['No.']) else idx + 1
    
    print(f"\n{'='*100}")
    print(f"ROW {row_no}")
    print(f"{'='*100}")
    
    # Extract Excel data
    excel_data = {
        'no': row_no,
        'entity': str(excel_row['Name of Entity']) if not pd.isna(excel_row['Name of Entity']) else '',
        'facility': str(excel_row['Name of Facility']) if not pd.isna(excel_row['Name of Facility']) else '',
        'country': str(excel_row['Country ']) if not pd.isna(excel_row['Country ']) else '',
        'classification': str(excel_row['Classification of Electricity/Steam']) if not pd.isna(excel_row['Classification of Electricity/Steam']) else '',
        'unit': str(excel_row['Unit.1']) if not pd.isna(excel_row['Unit.1']) else '',
        'currency': str(excel_row['Currency Unit']) if not pd.isna(excel_row['Currency Unit']) else '',
        'supplier': str(excel_row['Supplier Name']) if not pd.isna(excel_row['Supplier Name']) else '',
        'year': int(excel_row['Data Collection Year']) if not pd.isna(excel_row['Data Collection Year']) else 0,
    }
    
    # Add monthly values
    for excel_col, mock_col in zip(month_cols_excel, month_cols_mock):
        excel_data[mock_col] = float(excel_row[excel_col]) if not pd.isna(excel_row[excel_col]) else 0
    
    # Add calculated values
    excel_data['total_amount'] = float(excel_row['Total Purchase Amount.2']) if not pd.isna(excel_row['Total Purchase Amount.2']) else 0
    excel_data['total_mj'] = float(excel_row['Total Purchase Amount (MJ)']) if not pd.isna(excel_row['Total Purchase Amount (MJ)']) else 0
    excel_data['kgCO2'] = float(excel_row['kgCO2']) if not pd.isna(excel_row['kgCO2']) else 0
    excel_data['kgCH4'] = float(excel_row['kgCH4']) if not pd.isna(excel_row['kgCH4']) else 0
    excel_data['kgN2O'] = float(excel_row['kgN2O']) if not pd.isna(excel_row['kgN2O']) else 0
    excel_data['tCO2eq'] = float(excel_row['tCO2eq']) if not pd.isna(excel_row['tCO2eq']) else 0
    
    excel_data_for_new_mock.append(excel_data)
    
    # Print Excel data
    print(f"\nEXCEL DATA:")
    print(f"  Entity: {excel_data['entity']}")
    print(f"  Facility: {excel_data['facility']}")
    print(f"  Country: {excel_data['country']}")
    print(f"  Year: {excel_data['year']}")
    print(f"  Total Amount: {excel_data['total_amount']}")
    print(f"  tCO2eq: {excel_data['tCO2eq']}")
    
    # Find corresponding mock record
    mock_row = None
    for mock in mock_records:
        if mock.get('no') == row_no:
            mock_row = mock
            break
    
    if not mock_row:
        print(f"\n  ⚠️  WARNING: No corresponding mock data found for row {row_no}")
        all_differences.append({
            'row': row_no,
            'issue': 'Missing in mock data',
            'excel_entity': excel_data['entity']
        })
        continue
    
    print(f"\nMOCK DATA:")
    print(f"  Entity: {mock_row.get('entity', 'N/A')}")
    print(f"  Facility: {mock_row.get('facility', 'N/A')}")
    print(f"  Country: {mock_row.get('country', 'N/A')}")
    print(f"  Year: {mock_row.get('year', 'N/A')}")
    print(f"  Total Amount: {mock_row.get('total_amount', 'N/A')}")
    print(f"  tCO2eq: {mock_row.get('tCO2eq', 'N/A')}")
    
    # Compare all fields
    row_differences = []
    
    for mock_col in excel_data.keys():
        if mock_col == 'no':
            continue
            
        excel_val = excel_data[mock_col]
        mock_val = mock_row.get(mock_col)
        
        if not compare_values(excel_val, mock_val, mock_col):
            diff = {
                'row': row_no,
                'field': mock_col,
                'excel_value': excel_val,
                'mock_value': mock_val
            }
            row_differences.append(diff)
            all_differences.append(diff)
    
    if row_differences:
        print(f"\n  ❌ DIFFERENCES FOUND ({len(row_differences)}):")
        for diff in row_differences:
            print(f"    Field: {diff['field']}")
            print(f"      Excel: {diff['excel_value']}")
            print(f"      Mock:  {diff['mock_value']}")
    else:
        print(f"\n  ✅ All fields match!")

# Summary
print("\n" + "="*100)
print("SUMMARY")
print("="*100)
print(f"\nTotal Excel rows analyzed: {min(len(df), 28)}")
print(f"Total mock records: {len(mock_records)}")
print(f"Total differences found: {len(all_differences)}")

if all_differences:
    print(f"\nDifferences by row:")
    from collections import defaultdict
    diffs_by_row = defaultdict(list)
    for diff in all_differences:
        diffs_by_row[diff['row']].append(diff)
    
    for row_no in sorted(diffs_by_row.keys()):
        print(f"\n  Row {row_no}: {len(diffs_by_row[row_no])} difference(s)")
        for diff in diffs_by_row[row_no]:
            if 'field' in diff:
                print(f"    - {diff['field']}: Excel={diff['excel_value']} vs Mock={diff['mock_value']}")
            else:
                print(f"    - {diff.get('issue', 'Unknown issue')}")
else:
    print("\n✅ All data matches perfectly!")

# Generate new mock data in TypeScript format
print("\n" + "="*100)
print("GENERATING NEW MOCK DATA FILE")
print("="*100)

with open('data/mock_data_ts_corrected.txt', 'w', encoding='utf-8') as f:
    for i, record in enumerate(excel_data_for_new_mock):
        if i > 0:
            f.write(",\n")
        
        f.write("  {\n")
        f.write(f"    id: '{record['no']}',\n")
        f.write(f"    no: {record['no']},\n")
        f.write(f"    entity: '{record['entity']}',\n")
        f.write(f"    facility: '{record['facility']}',\n")
        f.write(f"    country: '{record['country']}',\n")
        f.write(f"    classification: '{record['classification']}',\n")
        
        # Monthly values
        for month in month_cols_mock:
            f.write(f"    {month}: {record[month]},\n")
        
        f.write(f"    unit: '{record['unit']}',\n")
        f.write(f"    currency: '{record['currency']}',\n")
        f.write(f"    supplier: '{record['supplier']}',\n")
        f.write(f"    year: {record['year']},\n")
        f.write(f"    total_amount: {record['total_amount']},\n")
        f.write(f"    total_mj: {record['total_mj']},\n")
        f.write(f"    kgCO2: {record['kgCO2']},\n")
        f.write(f"    kgCH4: {record['kgCH4']},\n")
        f.write(f"    kgN2O: {record['kgN2O']},\n")
        f.write(f"    tCO2eq: {record['tCO2eq']}\n")
        f.write("  }")

print(f"\n✅ New mock data file generated: data/mock_data_ts_corrected.txt")
print(f"   Total records: {len(excel_data_for_new_mock)}")

print("\n" + "="*100)
print("ANALYSIS COMPLETE")
print("="*100)
