import pandas as pd
import re

# Read Excel file
df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

# Read mock data
with open('data/mock_data_ts.txt', 'r', encoding='utf-8') as f:
    mock_data_str = f.read()

# Parse mock data
mock_records = []
objects = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', mock_data_str, re.DOTALL)

for obj_str in objects:
    record = {}
    string_pattern = r"(\w+):\s*'([^']*)'"
    number_pattern = r"(\w+):\s*([0-9.]+)(?:[,\s]|$)"
    
    for match in re.finditer(string_pattern, obj_str):
        key, value = match.groups()
        record[key] = value
    
    for match in re.finditer(number_pattern, obj_str):
        key, value = match.groups()
        if key not in record:
            try:
                record[key] = float(value) if '.' in value else int(value)
            except:
                record[key] = value
    
    if record and 'id' in record:
        mock_records.append(record)

print("="*80)
print("VERIFICATION RESULTS FOR SCOPE 2 MARKET DATA")
print("="*80)

differences = 0
checked_rows = 0

for idx, excel_row in df.iterrows():
    if idx >= 28:
        break
    
    row_no = int(excel_row['No.']) if not pd.isna(excel_row['No.']) else idx + 1
    checked_rows += 1
    
    # Find mock record
    mock_row = None
    for mock in mock_records:
        if mock.get('no') == row_no:
            mock_row = mock
            break
    
    if not mock_row:
        print(f"Row {row_no}: MISSING IN MOCK DATA")
        differences += 1
        continue
    
    # Check critical fields
    excel_total = float(excel_row['Total Purchase Amount.2']) if not pd.isna(excel_row['Total Purchase Amount.2']) else 0
    excel_tco2eq = float(excel_row['tCO2eq']) if not pd.isna(excel_row['tCO2eq']) else 0
    mock_total = mock_row.get('total_amount', 0)
    mock_tco2eq = mock_row.get('tCO2eq', 0)
    
    if abs(excel_total - mock_total) > 0.01 or abs(excel_tco2eq - mock_tco2eq) > 0.01:
        print(f"Row {row_no}: MISMATCH")
        print(f"  Total Amount - Excel: {excel_total}, Mock: {mock_total}")
        print(f"  tCO2eq - Excel: {excel_tco2eq}, Mock: {mock_tco2eq}")
        differences += 1

print("\n" + "="*80)
print(f"Total rows checked: {checked_rows}")
print(f"Total mock records: {len(mock_records)}")
print(f"Total differences: {differences}")

if differences == 0:
    print("\nSTATUS: ALL DATA MATCHES PERFECTLY!")
else:
    print(f"\nSTATUS: {differences} ROWS HAVE DIFFERENCES")

print("="*80)
