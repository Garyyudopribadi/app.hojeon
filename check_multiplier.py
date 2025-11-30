import pandas as pd

df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

df_2022 = df[df['Data Collection Year'] == 2022]

print("=== CHECKING MULTIPLIER PATTERN ===\n")

for i, rec in df_2022.iterrows():
    country = str(rec['Country '])
    if rec['Total Purchase Amount'] > 0:
        calc = (rec['kgCO2'] + rec['kgCH4']*25 + rec['kgN2O']*298) / 1000
        multiplier = rec['tCO2eq'] / calc if calc > 0 else 0
        
        print(f"Record {rec['No.']}: {rec['Name of Entity']:30s} ({country:10s}) Multiplier = {multiplier:.10f}")

print("\n=== ANALYSIS ===")
print("Indonesia multiplier: ~1.12186")
print("Korea multiplier: ~1.0")
print("\nLet's check what 1.12186 might represent:")
print(f"1 / 1.12186 = {1/1.12186}")
print(f"Grid loss factor? Transmission loss factor?")
print(f"\nOr maybe it's related to emission factors:")
print(f"Indonesia grid: 770.7 kgCO2/MWh")
print(f"Indonesia grid with losses: 770.7 × 1.12186 = {770.7 * 1.12186} kgCO2/MWh")
print(f"\nOr contractual instrument adjustment factor?")
