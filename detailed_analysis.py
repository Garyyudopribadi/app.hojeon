import pandas as pd

# Read the Excel file
df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

# Filter data for year 2022
df_2022 = df[df['Data Collection Year'] == 2022].copy()

print("=== DETAILED FORMULA ANALYSIS FOR 2022 ===\n")

for idx, row in df_2022.iterrows():
    print(f"\n{'='*80}")
    print(f"Record {row['No.']}: {row['Name of Facility']}")
    print(f"Country: {row['Country ']}")
    print(f"{'='*80}")
    
    # Data pembelian
    total_mwh = row['Total Purchase Amount']
    total_mj = row['Total Purchase Amount (MJ)']
    
    print(f"\n1. KONSUMSI LISTRIK:")
    print(f"   Total MWh: {total_mwh}")
    print(f"   Total MJ: {total_mj}")
    print(f"   Conversion check: {total_mwh} MWh × 3600 = {total_mwh * 3600} MJ")
    print(f"   Excel MJ value: {total_mj}")
    
    # Emission Factor
    emission_factor = row['Emission Factor']
    ef_unit = row['Emission Factor Unit (option)']
    
    print(f"\n2. EMISSION FACTOR:")
    print(f"   Emission Factor: {emission_factor}")
    print(f"   Unit: {ef_unit}")
    
    # CO2 Calculation
    kgco2_excel = row['kgCO2']
    print(f"\n3. kgCO2 CALCULATION:")
    print(f"   Excel kgCO2: {kgco2_excel}")
    
    if pd.notna(emission_factor):
        # Market-based dengan Emission Factor
        calc_kgco2 = total_mwh * emission_factor
        print(f"   Formula: {total_mwh} MWh × {emission_factor} = {calc_kgco2}")
    else:
        # Grid default (location-based approach untuk Korea)
        country = row['Country ']
        if 'Korea' in str(country):
            # Check for Korea grid factor
            korea_ef = 465.3  # kgCO2/MWh (typical Korea grid)
            calc_kgco2 = total_mwh * korea_ef
            print(f"   Korea Grid: {total_mwh} MWh × {korea_ef} kgCO2/MWh = {calc_kgco2}")
        print(f"   Note: Emission Factor is NaN, likely using grid default")
    
    # CH4 and N2O
    kgch4_excel = row['kgCH4']
    kgn2o_excel = row['kgN2O']
    
    print(f"\n4. CH4 & N2O CALCULATION:")
    print(f"   Excel kgCH4: {kgch4_excel}")
    print(f"   Excel kgN2O: {kgn2o_excel}")
    
    country = row['Country ']
    if 'Indonesia' in str(country):
        CH4_EF = 0.0000106  # kgCH4/MJ
        N2O_EF = 0.00000359  # kgN2O/MJ
        calc_ch4 = total_mj * CH4_EF
        calc_n2o = total_mj * N2O_EF
        print(f"   Indonesia factors:")
        print(f"     CH4: {total_mj} MJ × {CH4_EF} = {calc_ch4}")
        print(f"     N2O: {total_mj} MJ × {N2O_EF} = {calc_n2o}")
    else:
        CH4_EF = 0.00000265  # kgCH4/MJ  
        N2O_EF = 0.00000143  # kgN2O/MJ
        calc_ch4 = total_mj * CH4_EF
        calc_n2o = total_mj * N2O_EF
        print(f"   Default (Korea) factors:")
        print(f"     CH4: {total_mj} MJ × {CH4_EF} = {calc_ch4}")
        print(f"     N2O: {total_mj} MJ × {N2O_EF} = {calc_n2o}")
    
    # tCO2eq calculation
    tco2eq_excel = row['tCO2eq']
    calc_tco2eq = (kgco2_excel + kgch4_excel * 25 + kgn2o_excel * 298) / 1000
    
    print(f"\n5. tCO2eq CALCULATION:")
    print(f"   Formula: (kgCO2 + kgCH4×25 + kgN2O×298) / 1000")
    print(f"   = ({kgco2_excel} + {kgch4_excel}×25 + {kgn2o_excel}×298) / 1000")
    print(f"   = {calc_tco2eq}")
    print(f"   Excel tCO2eq: {tco2eq_excel}")
    print(f"   Difference: {abs(calc_tco2eq - tco2eq_excel)}")

print("\n\n" + "="*80)
print("SUMMARY FOR 2022")
print("="*80)
total_excel = df_2022['tCO2eq'].sum()
print(f"Total tCO2eq (Excel): {total_excel}")
print(f"Expected: 11,681")
print(f"Difference: {abs(total_excel - 11681)}")
