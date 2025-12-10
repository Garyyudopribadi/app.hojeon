import sys
import pandas as pd

if len(sys.argv) < 2:
    print("Usage: python list_excel_sheets.py <excel_path>")
    sys.exit(1)

path = sys.argv[1]
try:
    xls = pd.ExcelFile(path, engine='openpyxl')
    print('SHEETS:')
    for name in xls.sheet_names:
        print('---', name)
        try:
            df = xls.parse(name, nrows=1)
            print('COLUMNS:', df.columns.tolist())
        except Exception as e:
            print('COLUMNS: error reading sheet:', e)
except Exception as e:
    print('Error opening file:', e)
    sys.exit(2)
