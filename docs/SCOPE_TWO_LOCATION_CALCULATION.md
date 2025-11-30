# GHG Scope Two Location-Based Emission Calculation

## Overview

Sistem perhitungan emisi GHG Scope Two Location-Based untuk pembelian listrik dan steam berdasarkan **IPCC 2006 Guidelines** dan menggunakan **Global Warming Potential (GWP)** dari **IPCC AR6 (2021)**.

## Calculation Flow

```
User Input (Monthly Purchase Data in MWh)
        ↓
1. Total Purchase Calculation
   total_purchase = Σ(Jan + Feb + Mar + ... + Dec)
        ↓
2. Total Energy (MJ)
   total_energy(MJ) = total_purchase(MWh) × 3,600
        ↓
3. CO2 Emissions (kg)
   kgCO2 = total_purchase(MWh) × Grid_Emission_Factor(kgCO2/MWh)
        ↓
4. CH4 Emissions (kg)
   kgCH4 = total_energy(MJ) × CH4_Emission_Factor(kgCH4/MJ)
        ↓
5. N2O Emissions (kg)
   kgN2O = total_energy(MJ) × N2O_Emission_Factor(kgN2O/MJ)
        ↓
6. Total GHG Emissions (CO2 equivalent)
   tCO2eq = (kgCO2 × 1 + kgCH4 × 27 + kgN2O × 273) / 1000
```

## Emission Factors

### 1. Global Warming Potential (GWP100) - IPCC AR6 2021

| Gas | GWP100 Value |
|-----|--------------|
| CO2 | 1 |
| CH4 (fossil) | 27 |
| N2O | 273 |

### 2. Grid Electricity Emission Factors by Country

#### Korea (한국)
| Parameter | Value | Unit | Source |
|-----------|-------|------|--------|
| CO2 Emission Factor | 465.29 | kgCO2/MWh | Korea Power Exchange (2022-2024) |
| CH4 Emission Factor | 0.00000265 | kgCH4/MJ | IPCC 2006 Guidelines |
| N2O Emission Factor | 0.00000143 | kgN2O/MJ | IPCC 2006 Guidelines |

#### Indonesia
| Parameter | Value | Unit | Source |
|-----------|-------|------|--------|
| CO2 Emission Factor | 770 | kgCO2/MWh | PLN (Perusahaan Listrik Negara) |
| CH4 Emission Factor | 0.0000106 | kgCH4/MJ | IPCC 2006 Guidelines |
| N2O Emission Factor | 0.00000359 | kgN2O/MJ | IPCC 2006 Guidelines |

### 3. Energy Conversion
- 1 MWh = 3,600 MJ

## Calculation Examples

### Example 1: Korea - HOJEON LIMITED (2022)

**Input Data:**
```
Monthly Purchase (MWh):
- January:    32.46
- February:   30.06
- March:      28.30
- April:      25.64
- May:        31.62
- June:       37.44
- July:       45.30
- August:     45.91
- September:  35.62
- October:    24.90
- November:   26.75
- December:   34.34
```

**Step-by-Step Calculation:**

1. **Total Purchase**
   ```
   Total = 32.46 + 30.06 + 28.30 + 25.64 + 31.62 + 37.44 + 
           45.30 + 45.91 + 35.62 + 24.90 + 26.75 + 34.34
        = 398.33 MWh
   ```

2. **Total Energy (MJ)**
   ```
   Total Energy = 398.33 × 3,600
                = 1,434,005.52 MJ
   ```

3. **CO2 Emissions**
   ```
   kgCO2 = 398.33 × 465.29
         = 185,345.21 kg
   ```

4. **CH4 Emissions**
   ```
   kgCH4 = 1,434,005.52 × 0.00000265
         = 3.79 kg
   ```

5. **N2O Emissions**
   ```
   kgN2O = 1,434,005.52 × 0.00000143
         = 2.06 kg
   ```

6. **Total GHG Emissions (tCO2eq)**
   ```
   tCO2eq = (185,345.21 × 1 + 3.79 × 27 + 2.06 × 273) / 1000
          = (185,345.21 + 102.33 + 562.38) / 1000
          = 186,009.92 / 1000
          = 186.01 tCO2eq
   ```

**Result Summary:**
- ✅ Total Purchase: **398.33 MWh**
- ✅ Total Energy: **1,434,005.52 MJ**
- ✅ CO2 Emissions: **185,345.21 kg**
- ✅ CH4 Emissions: **3.79 kg**
- ✅ N2O Emissions: **2.06 kg**
- ✅ **Total GHG Emissions: 186.01 tCO2eq**

---

### Example 2: Indonesia - PT. KAHOINDAH CITRAGARMENT (2022)

**Input Data:**
```
Monthly Purchase (MWh):
- January:    133.18
- February:   126.64
- March:      119.65
- April:      143.57
- May:        131.12
- June:       117.15
- July:       162.06
- August:     163.09
- September:  162.14
- October:    137.82
- November:   132.26
- December:   133.74
```

**Step-by-Step Calculation:**

1. **Total Purchase**
   ```
   Total = 133.18 + 126.64 + 119.65 + 143.57 + 131.12 + 117.15 + 
           162.06 + 163.09 + 162.14 + 137.82 + 132.26 + 133.74
        = 1,662.42 MWh
   ```

2. **Total Energy (MJ)**
   ```
   Total Energy = 1,662.42 × 3,600
                = 5,984,712 MJ
   ```

3. **CO2 Emissions**
   ```
   kgCO2 = 1,662.42 × 770
         = 1,280,063.40 kg
   ```

4. **CH4 Emissions**
   ```
   kgCH4 = 5,984,712 × 0.0000106
         = 63.44 kg
   ```

5. **N2O Emissions**
   ```
   kgN2O = 5,984,712 × 0.00000359
         = 21.49 kg
   ```

6. **Total GHG Emissions (tCO2eq)**
   ```
   tCO2eq = (1,280,063.40 × 1 + 63.44 × 27 + 21.49 × 273) / 1000
          = (1,280,063.40 + 1,712.88 + 5,866.77) / 1000
          = 1,287,643.05 / 1000
          = 1,287.64 tCO2eq
   ```

**Result Summary:**
- ✅ Total Purchase: **1,662.42 MWh**
- ✅ Total Energy: **5,984,712 MJ**
- ✅ CO2 Emissions: **1,280,063.40 kg**
- ✅ CH4 Emissions: **63.44 kg**
- ✅ N2O Emissions: **21.49 kg**
- ✅ **Total GHG Emissions: 1,287.64 tCO2eq**

---

## Formula Summary

### For Korea:
```javascript
total_purchase_mwh = sum(monthly_purchases)
total_energy_mj = total_purchase_mwh × 3,600
kgCO2 = total_purchase_mwh × 465.29
kgCH4 = total_energy_mj × 0.00000265
kgN2O = total_energy_mj × 0.00000143
tCO2eq = (kgCO2 + kgCH4 × 27 + kgN2O × 273) / 1000
```

### For Indonesia:
```javascript
total_purchase_mwh = sum(monthly_purchases)
total_energy_mj = total_purchase_mwh × 3,600
kgCO2 = total_purchase_mwh × 770
kgCH4 = total_energy_mj × 0.0000106
kgN2O = total_energy_mj × 0.00000359
tCO2eq = (kgCO2 + kgCH4 × 27 + kgN2O × 273) / 1000
```

## Implementation

### TypeScript Function (Live Calculation in Form)

```typescript
const calculateFromForm = (formData: FormData) => {
  // Step 1: Sum all monthly purchases
  const months = ['january','february','march','april','may','june',
                  'july','august','september','october','november','december']
  const total = months.reduce((sum, month) => 
    sum + (Number(formData[month]) || 0), 0
  )
  
  // Step 2: Convert MWh to MJ
  const mj = total * 3600
  
  // Step 3: Calculate kgCO2 based on country
  const country = (formData.country || '').toLowerCase()
  const co2_ef = country.includes('korea') ? 465.29 : 770
  const kgCO2 = total * co2_ef
  
  // Step 4: Calculate CH4 and N2O
  let ch4_ef = 0.00000265  // Korea default
  let n2o_ef = 0.00000143  // Korea default
  
  if (country.includes('indonesia') || country.includes('indon')) {
    ch4_ef = 0.0000106
    n2o_ef = 0.00000359
  }
  
  const kgCH4 = mj * ch4_ef
  const kgN2O = mj * n2o_ef
  
  // Step 5: Calculate total CO2 equivalent
  const tCO2eq = (kgCO2 * 1 + kgCH4 * 27 + kgN2O * 273) / 1000
  
  return { 
    total_amount: total, 
    total_mj: mj, 
    kgCO2, 
    kgCH4, 
    kgN2O, 
    tCO2eq 
  }
}
```

## Key Features

### 1. Real-time Calculation
- Menghitung otomatis saat user mengisi data bulanan
- Menampilkan hasil langsung di preview panel

### 2. Country-Specific Factors
- Korea: Grid emission factor lebih rendah (~465 kgCO2/MWh)
- Indonesia: Grid emission factor lebih tinggi (~770 kgCO2/MWh)

### 3. Individual Gas Tracking
- Menampilkan breakdown emisi per gas (CO2, CH4, N2O)
- Menggunakan GWP terbaru dari IPCC AR6

### 4. Data Validation
- Auto-populate country berdasarkan entity selection
- Validasi input untuk setiap bulan
- Currency auto-select (KRW untuk Korea, IDR untuk Indonesia)

## Data Sources

1. **Korea Power Exchange (KPX)** - Grid emission factors for Korea
2. **PLN (Perusahaan Listrik Negara)** - Grid emission factors for Indonesia
3. **IPCC 2006 Guidelines** - CH4 and N2O emission factors for electricity
4. **IPCC AR6 (2021)** - Global Warming Potential values

## Files Modified

- **`components/environment/scope-two-location-content.tsx`** - Form UI and calculation logic
- **`docs/SCOPE_TWO_LOCATION_CALCULATION.md`** - This documentation

## References

- IPCC 2006 Guidelines: https://www.ipcc-nggip.iges.or.jp/
- IPCC AR6 Report: https://www.ipcc.ch/report/ar6/
- Excel Source: `data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx`
- CSV Data: `docs/SCOPE_TWO_LOCATION_CSV.csv`

---

**Last Updated:** November 29, 2025  
**Based On:** Hojeon Limited Scope 1, 2 emissions calculation.xlsx (Scope 2 - Location Based sheet)
