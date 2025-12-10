import sys
import pandas as pd

if len(sys.argv) < 2:
    print("Usage: python inspect_columns.py <excel_path>")
    sys.exit(1)

path = sys.argv[1]
sheet = '3-3. (Raw data) Scope 2_Market'
try:
    df = pd.read_excel(path, sheet_name=sheet, header=3, engine='openpyxl')
    for i, c in enumerate(df.columns):
        print(i, repr(c))
    print('\nColumns containing Total:')
    for c in df.columns:
        if 'Total' in str(c):
            print(repr(c))
except Exception as e:
    print('Error:', e)
    sys.exit(2)
