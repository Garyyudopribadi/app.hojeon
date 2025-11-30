import pandas as pd

df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

print('=== SEMUA RECORDS 2022 (INCLUDING ZERO) ===\n')

df_2022 = df[df['Data Collection Year'] == 2022]

for idx, rec in df_2022.iterrows():
    total_mwh = rec['Total Purchase Amount']
    tco2eq = rec['tCO2eq']
    
    status = "✓ INCLUDED" if total_mwh > 0 else "✗ EXCLUDED (ZERO)"
    
    print(f"No. {rec['No.']}: {rec['Name of Entity']}")
    print(f"  Total MWh: {total_mwh}")
    print(f"  tCO2eq: {tco2eq}")
    print(f"  Status: {status}")
    print()

print('='*60)
print('SUMMARY:')
print(f"Total records in Excel: {len(df_2022)}")
print(f"Non-zero records: {len(df_2022[df_2022['Total Purchase Amount'] > 0])}")
print(f"Zero records: {len(df_2022[df_2022['Total Purchase Amount'] == 0])}")
print()
print(f"Total tCO2eq (all): {df_2022['tCO2eq'].sum():.2f}")
print(f"Total tCO2eq (non-zero only): {df_2022[df_2022['Total Purchase Amount'] > 0]['tCO2eq'].sum():.2f}")
