import pandas as pd

df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

df_2022 = df[df['Data Collection Year'] == 2022]

print("=== ANALYZING kgCO2 CALCULATION ===\n")

for i, rec in df_2022.iterrows():
    print(f"Record {rec['No.']}: {rec['Name of Entity']}")
    print(f"Country: {rec['Country ']}")
    print(f"Total MWh: {rec['Total Purchase Amount']}")
    print(f"Total MJ: {rec['Total Purchase Amount (MJ)']}")
    print(f"Emission Factor: {rec['Emission Factor']}")
    print(f"CO2 column value: {rec['CO2']}")
    print(f"kgCO2 column value: {rec['kgCO2']}")
    
    if rec['Total Purchase Amount (MJ)'] > 0:
        co2_per_mj = rec['kgCO2'] / rec['Total Purchase Amount (MJ)']
        print(f"Derived CO2 factor: {co2_per_mj} kgCO2/MJ")
        print(f"                  = {co2_per_mj * 1000} gCO2/MJ")
        
        # Check if it matches Emission Factor
        if pd.notna(rec['Emission Factor']):
            mwh_to_kg = rec['Emission Factor'] / 3.6  # Convert kgGHG/MWh to kgGHG/MJ
            print(f"Expected from EF: {rec['Emission Factor']} kgGHG/MWh ÷ 3.6 = {mwh_to_kg} kgGHG/MJ")
            print(f"Match: {abs(co2_per_mj - mwh_to_kg) < 0.01}")
        else:
            print(f"No Emission Factor (using grid default)")
    
    print()

print("\n=== KEY INSIGHT ===")
print("For Market-based Scope 2:")
print("- Emission Factor in Excel is in kgGHG/MWh")
print("- To get kgCO2: Total_MJ × (Emission_Factor / 3.6)")
print("- OR: Total_MWh × Emission_Factor")
print("\nBut looking at Indonesia data, kgCO2 seems to include full combustion emissions")
print("not just the contractual instrument factor!")
