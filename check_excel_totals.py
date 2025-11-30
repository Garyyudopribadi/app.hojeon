import pandas as pd

df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

print('=== TOTAL PER TAHUN DARI EXCEL ===\n')

for year in [2022, 2023, 2024]:
    df_year = df[df['Data Collection Year'] == year]
    df_nonzero = df_year[df_year['Total Purchase Amount'] > 0]
    
    total = df_nonzero['tCO2eq'].sum()
    count = len(df_nonzero)
    
    print(f'{year}: {total:.2f} tCO2eq ({count} records)')
    print(f'  Record Numbers: {df_nonzero["No."].tolist()}')
    print()

print('\n=== DETAIL 2022 RECORDS ===\n')
df_2022 = df[df['Data Collection Year'] == 2022]
df_2022_nonzero = df_2022[df_2022['Total Purchase Amount'] > 0]

for idx, rec in df_2022_nonzero.iterrows():
    print(f"No. {rec['No.']}: {rec['Name of Entity']}")
    print(f"  Facility: {rec['Name of Facility']}")
    print(f"  Country: {rec['Country ']}")
    print(f"  Total MWh: {rec['Total Purchase Amount']}")
    print(f"  tCO2eq: {rec['tCO2eq']}")
    print()

total_2022 = df_2022_nonzero['tCO2eq'].sum()
print(f"Total 2022: {total_2022:.2f} tCO2eq")
print(f"Expected: 11,680.99 tCO2eq")
