import pandas as pd

df = pd.read_excel('data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx', 
                   sheet_name='3-3. (Raw data) Scope 2_Market',
                   header=4)

df_2022 = df[df['Data Collection Year'] == 2022]

print("=== ANALYZING CO2 vs kgCO2 vs tCO2eq ===\n")

for i, rec in df_2022.iterrows():
    if rec['No.'] in [4, 11, 12]:  # Indonesia records with and without EF
        print(f"\nRecord {rec['No.']}: {rec['Name of Entity']}")
        print(f"Facility: {rec['Name of Facility']}")
        print(f"Country: {rec['Country ']}")
        print(f"Total MWh: {rec['Total Purchase Amount']}")
        print(f"Total MJ: {rec['Total Purchase Amount (MJ)']}")
        print(f"Emission Factor: {rec['Emission Factor']}")
        print(f"CO2 column (tCO2): {rec['CO2']}")
        print(f"kgCO2: {rec['kgCO2']}")
        print(f"kgCH4: {rec['kgCH4']}")
        print(f"kgN2O: {rec['kgN2O']}")
        print(f"tCO2eq (Excel): {rec['tCO2eq']}")
        
        # Calculate tCO2eq from kgCO2, kgCH4, kgN2O
        calc_tco2eq_standard = (rec['kgCO2'] + rec['kgCH4']*25 + rec['kgN2O']*298) / 1000
        print(f"\nCalculated tCO2eq (GWP 25/298): {calc_tco2eq_standard}")
        print(f"Difference: {abs(calc_tco2eq_standard - rec['tCO2eq'])}")
        
        # Try to find what multiplier is used
        if rec['CO2'] > 0 and pd.notna(rec['CO2']):
            # Check if tCO2eq = CO2 + contributions from CH4 and N2O
            co2_contrib = rec['CO2']  # This is from contractual instrument
            ch4_contrib = rec['kgCH4'] * 25 / 1000
            n2o_contrib = rec['kgN2O'] * 298 / 1000
            calc_with_co2_column = co2_contrib + ch4_contrib + n2o_contrib
            
            print(f"\nAlternative calculation using CO2 column:")
            print(f"  CO2 (from contract): {co2_contrib}")
            print(f"  CH4 contribution: {ch4_contrib}")
            print(f"  N2O contribution: {n2o_contrib}")
            print(f"  Total: {calc_with_co2_column}")
            print(f"  Difference from Excel: {abs(calc_with_co2_column - rec['tCO2eq'])}")
            
            # Check if there's a multiplier
            multiplier = rec['tCO2eq'] / calc_tco2eq_standard
            print(f"\nMultiplier: {rec['tCO2eq']} / {calc_tco2eq_standard} = {multiplier}")
        
        print("="*70)
