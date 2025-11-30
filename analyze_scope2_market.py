import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)  # Data starts at row 5 (0-indexed row 4)

# Display column names
print("=== COLUMN NAMES ===")
print(df.columns.tolist())
print("\n")

# Filter data for year 2022
df_2022 = df[df['Data Collection Year'] == 2022].copy()

print(f"=== DATA TAHUN 2022 ===")
print(f"Jumlah records: {len(df_2022)}")
print("\n")

# Show relevant columns
columns_to_show = ['No.', 'Name of Entity', 'Name of Facility', 'Country', 
                   'Total Purchase Amount', 'Unit', 'Emission Factor', 
                   'kgCO2', 'kgCH4', 'kgN2O', 'tCO2eq']

print("=== DETAIL DATA 2022 ===")
for idx, row in df_2022.iterrows():
    print(f"\nRecord {row['No.']}:")
    for col in columns_to_show:
        if col in df.columns:
            print(f"  {col}: {row[col]}")

# Calculate total tCO2eq for 2022
total_tco2eq_2022 = df_2022['tCO2eq'].sum()
print(f"\n=== TOTAL EMISI 2022 ===")
print(f"Total tCO2eq: {total_tco2eq_2022}")

# Show formula structure
print("\n=== FORMULA ANALYSIS ===")
print("Checking calculation for first 2022 record:")
first_2022 = df_2022.iloc[0]
print(f"Total Purchase Amount: {first_2022['Total Purchase Amount']} {first_2022['Unit']}")
print(f"Total Purchase Amount (MJ): {first_2022['Total Purchase Amount (MJ)']}")
print(f"Emission Factor: {first_2022['Emission Factor']} {first_2022.get('Emission Factor Unit (option)', 'N/A')}")
print(f"Country: {first_2022['Country ']}")  # Note: ada spasi
print(f"kgCO2: {first_2022['kgCO2']}")
print(f"kgCH4: {first_2022['kgCH4']}")
print(f"kgN2O: {first_2022['kgN2O']}")
print(f"tCO2eq: {first_2022['tCO2eq']}")

# Check if there are GWP factors used
print("\n=== CHECKING GWP CALCULATION ===")
if 'kgCO2' in df.columns and 'kgCH4' in df.columns and 'kgN2O' in df.columns and 'tCO2eq' in df.columns:
    for idx, row in df_2022.iterrows():
        # Standard GWP: CH4=25, N2O=298
        calc_tco2eq = (row['kgCO2'] + row['kgCH4']*25 + row['kgN2O']*298) / 1000
        actual_tco2eq = row['tCO2eq']
        print(f"Record {row['No.']}: Calculated={calc_tco2eq:.6f}, Actual={actual_tco2eq:.6f}, Diff={abs(calc_tco2eq-actual_tco2eq):.6f}")
