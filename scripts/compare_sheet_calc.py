import pandas as pd
import sys

path = sys.argv[1]
df = pd.read_excel(path, sheet_name='3-3. (Raw data) Scope 2_Market', header=4, engine='openpyxl')

EMISSION_FACTORS = {
    'indonesia': {'co2':770.7,'ch4':0.038095,'n2o':0.012903},
    'korea': {'co2':465.3,'ch4':0.009524,'n2o':0.005161},
}

def numeric(v):
    try:
        if pd.isna(v):
            return 0.0
        return float(v)
    except:
        return 0.0

rows = df[df['Data Collection Year']==2024]
print('rows:', len(rows))
total_sheet = rows['tCO2eq'].sum()
total_calc = 0.0
for i, r in rows.iterrows():
    facility = r.get('Name of Facility')
    country = str(r.get('Country ')).strip().lower()
    total_mwh = numeric(r.get('Total Purchase Amount'))
    factors = EMISSION_FACTORS.get(country)
    if not factors:
        print('skip', facility, country)
        continue
    kgco2 = total_mwh * factors['co2']
    kgch4 = total_mwh * factors['ch4']
    kgn2o = total_mwh * factors['n2o']
    tco2eq = (kgco2 + kgch4*27 + kgn2o*273)/1000.0
    total_calc += tco2eq
    print(facility, country, 'mwh', total_mwh, 'sheet_t', r.get('tCO2eq'), 'calc_t', round(tco2eq,6), 'diff', round(r.get('tCO2eq') - tco2eq,6))

print('sheet total', total_sheet)
print('calc total', total_calc)
