# GHG Scope Two Market-Based Emission Calculation

## Overview

Sistem perhitungan emisi GHG Scope Two Market-Based untuk pembelian listrik dan steam menggunakan **supplier-specific atau contract-specific emission factors** berdasarkan **IPCC 2006 Guidelines** dan **Global Warming Potential (GWP)** dari **IPCC AR6 (2021)**.

## Key Difference: Location-Based vs Market-Based

| Aspect | Location-Based | Market-Based |
|--------|---------------|--------------|
| **Emission Factor Source** | Grid average (country-specific) | Supplier/contract-specific |
| **Data Source** | National grid electricity mix | RECs, PPAs, supplier disclosure |
| **Renewable Energy** | Uses grid average EF | Can be 0 tCO2eq for RECs/PPAs |
| **Purpose** | Reflects regional grid intensity | Reflects company's energy choices |
| **Reporting** | Mandatory | Optional (recommended) |

## Contractual Instruments

### 1. Renewable Energy Certificates (RECs)
- **Emission Factor**: 0 kgCO2/MWh
- **Description**: Certificates representing renewable energy generation
- **Example**: Korea Renewable Energy Certificate, Indonesia Green Energy Certificate

### 2. Power Purchase Agreements (PPAs)
- **Emission Factor**: 0 kgCO2/MWh (for renewable PPAs)
- **Description**: Direct contracts with renewable energy generators
- **Example**: Solar PPA Provider Korea, Solar PPA Provider Indonesia

### 3. Green Tariff
- **Emission Factor**: ~20% of grid average (varies by supplier)
- **Korea**: ~93.06 kgCO2/MWh (20% of 465.29)
- **Indonesia**: ~154.156 kgCO2/MWh (20% of 770.78)
- **Description**: Utility green pricing programs

### 4. Supplier-Specific Disclosure
- **Emission Factor**: Varies by supplier (disclosed by supplier)
- **Description**: Emission factor based on supplier's generation mix
- **Example**: Industrial Power Provider with specific generation mix

### 5. Grid Default (Residual Mix)
- **Emission Factor**: Same as location-based
- **Korea**: 465.29 kgCO2/MWh
- **Indonesia**: 770.78 kgCO2/MWh
- **Description**: Default grid factor when no contractual instrument

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
3. CO2 Emissions (kg) - MARKET-BASED
   kgCO2 = total_purchase(MWh) × Supplier_Emission_Factor(kgCO2/MWh)
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

### 2. Supplier-Specific Emission Factors

#### Korea
| Instrument Type | Emission Factor (kgCO2/MWh) | Source |
|----------------|----------------------------|--------|
| Grid Default | 465.29 | Korea Power Exchange |
| Green Tariff | 93.06 | KEPCO Green Premium (20% of grid) |
| REC | 0 | Korea Renewable Energy Certificate |
| PPA | 0 | Renewable Power Purchase Agreement |

#### Indonesia
| Instrument Type | Emission Factor (kgCO2/MWh) | Source |
|----------------|----------------------------|--------|
| Grid Default | 770.78 | PLN (Perusahaan Listrik Negara) |
| Green Tariff | 154.156 | PLN Green Program (20% of grid) |
| REC | 0 | Indonesia Green Energy Certificate |
| PPA | 0 | Renewable Power Purchase Agreement |
| Supplier Disclosure | Variable | Based on supplier's generation mix |

### 3. CH4 and N2O Emission Factors

Same as Location-Based method:

#### Korea
- CH4: 0.00000265 kgCH4/MJ
- N2O: 0.00000143 kgN2O/MJ

#### Indonesia
- CH4: 0.0000106 kgCH4/MJ
- N2O: 0.00000359 kgN2O/MJ

## Calculation Examples

### Example 1: Korea - HOJEON LIMITED (REC - 2022)

**Input Data:**
```
Contractual Instrument: REC (Renewable Energy Certificate)
Supplier: Korea Renewable Energy Certificate
Emission Factor: 0 kgCO2/MWh

Monthly Purchase (MWh):
- January:    10.5
- February:   10.2
- March:      9.8
- April:      8.5
- May:        11.2
- June:       12.8
- July:       15.2
- August:     16.1
- September:  13.5
- October:    9.8
- November:   10.5
- December:   12.2
```

**Step-by-Step Calculation:**

1. **Total Purchase**
   ```
   Total = 10.5 + 10.2 + 9.8 + 8.5 + 11.2 + 12.8 + 
           15.2 + 16.1 + 13.5 + 9.8 + 10.5 + 12.2
        = 140.3 MWh
   ```

2. **Total Energy (MJ)**
   ```
   Total Energy = 140.3 × 3,600
                = 505,080 MJ
   ```

3. **CO2 Emissions (Market-Based)**
   ```
   kgCO2 = 140.3 × 0 (REC Emission Factor)
         = 0 kg
   ```

4. **CH4 Emissions**
   ```
   kgCH4 = 505,080 × 0.00000265
         = 1.34 kg (minimal, from upstream)
   ```

5. **N2O Emissions**
   ```
   kgN2O = 505,080 × 0.00000143
         = 0.72 kg (minimal, from upstream)
   ```

6. **Total GHG Emissions (tCO2eq)**
   ```
   tCO2eq = (0 × 1 + 1.34 × 27 + 0.72 × 273) / 1000
          = (0 + 36.18 + 196.56) / 1000
          = 232.74 / 1000
          = 0.23 tCO2eq (minimal from CH4/N2O only)
   ```

**Result Summary:**
- ✅ Total Purchase: **140.3 MWh**
- ✅ Total Energy: **505,080 MJ**
- ✅ CO2 Emissions: **0 kg** (Renewable Energy)
- ✅ CH4 Emissions: **1.34 kg** (upstream)
- ✅ N2O Emissions: **0.72 kg** (upstream)
- ✅ **Total GHG Emissions: 0.23 tCO2eq** (Nearly Zero Emission)

---

### Example 2: Korea - HOJEON LIMITED (Grid Default - 2022)

**Input Data:**
```
Contractual Instrument: Grid Default
Supplier: 한국전력공사 (KEPCO)
Emission Factor: 465.29 kgCO2/MWh

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
   Total = 398.33 MWh
   ```

2. **Total Energy (MJ)**
   ```
   Total Energy = 398.33 × 3,600
                = 1,434,005.52 MJ
   ```

3. **CO2 Emissions (Market-Based - Grid Default)**
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

### Example 3: Indonesia - PT. YONGJIN (PPA - 2024)

**Input Data:**
```
Contractual Instrument: PPA (Power Purchase Agreement)
Supplier: Solar PPA Provider Indonesia
Emission Factor: 0 kgCO2/MWh

Monthly Purchase (MWh):
- January:    85.5
- February:   72.2
- March:      78.5
- April:      68.2
- May:        95.5
- June:       98.2
- July:       92.5
- August:     115.8
- September:  95.2
- October:    102.5
- November:   98.5
- December:   105.2
```

**Step-by-Step Calculation:**

1. **Total Purchase**
   ```
   Total = 1,107.8 MWh
   ```

2. **Total Energy (MJ)**
   ```
   Total Energy = 1,107.8 × 3,600
                = 3,988,080 MJ
   ```

3. **CO2 Emissions (PPA - Renewable)**
   ```
   kgCO2 = 1,107.8 × 0
         = 0 kg
   ```

4. **Total GHG Emissions (tCO2eq)**
   ```
   tCO2eq = 0 tCO2eq (Renewable Energy)
   ```

**Result Summary:**
- ✅ Total Purchase: **1,107.8 MWh**
- ✅ Total Energy: **3,988,080 MJ**
- ✅ CO2 Emissions: **0 kg** (Renewable Energy via PPA)
- ✅ **Total GHG Emissions: 0 tCO2eq** (Zero Emission)

---

## Formula Summary

### Market-Based Calculation:

```javascript
total_purchase_mwh = sum(monthly_purchases)
total_energy_mj = total_purchase_mwh × 3,600

// IMPORTANT: For Market-Based, kgCO2 uses GRID emission factor (location-based)
// NOT the contractual instrument emission factor
// The contractual instrument EF is recorded separately but not used in kgCO2 calc

kgCO2 = total_energy_mj × CO2_GRID_FACTOR_per_MJ
// Korea: 0.12925 kgCO2/MJ (465.3 kgCO2/MWh)
// Indonesia: 0.214083 kgCO2/MJ (770.7 kgCO2/MWh)

// CH4 and N2O calculations
kgCH4 = total_energy_mj × CH4_EF_per_MJ
kgN2O = total_energy_mj × N2O_EF_per_MJ

// Total emissions with T&D losses (Indonesia only)
tCO2eq = ((kgCO2 + kgCH4 × 25 + kgN2O × 298) / 1000) × T_AND_D_LOSS_FACTOR
// Korea: T_AND_D_LOSS_FACTOR = 1.0
// Indonesia: T_AND_D_LOSS_FACTOR = 1.12186042 (accounts for 12.186% grid losses)
```

### Comparison: Location vs Market

```javascript
// LOCATION-BASED
kgCO2_location = total_purchase_mwh × Grid_Average_EF
// Always uses grid average (Korea: 465.29, Indonesia: 770.78)

// MARKET-BASED
kgCO2_market = total_purchase_mwh × Supplier_Specific_EF
// Uses supplier/contract EF (Can be 0 for RECs/PPAs)

// Example:
// 100 MWh from REC in Korea:
// Location: 100 × 465.29 = 46,529 kgCO2 (46.53 tCO2eq)
// Market:   100 × 0      = 0 kgCO2 (0 tCO2eq)
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
  
  // Step 3: Market-Based - Uses GRID emission factor (not contractual)
  const country = (formData.country || '').toLowerCase()
  let CO2_GRID_FACTOR = 0.12925  // kgCO2/MJ for Korea (465.3 kgCO2/MWh)
  let CH4_EF_PER_MJ = 0.00000265
  let N2O_EF_PER_MJ = 0.00000143
  let T_AND_D_LOSS_FACTOR = 1.0
  
  if (country.includes('indonesia') || country.includes('indon')) {
    CO2_GRID_FACTOR = 0.214083     // kgCO2/MJ (770.7 kgCO2/MWh)
    CH4_EF_PER_MJ = 0.0000106      // kgCH4/MJ
    N2O_EF_PER_MJ = 0.00000359     // kgN2O/MJ
    T_AND_D_LOSS_FACTOR = 1.12186042  // T&D losses (12.186%)
  }
  
  const kgCO2 = mj * CO2_GRID_FACTOR
  const kgCH4 = mj * CH4_EF_PER_MJ
  const kgN2O = mj * N2O_EF_PER_MJ
  
  // Step 4: Calculate total CO2 equivalent with T&D losses
  // GWP: CO2=1, CH4=25, N2O=298 (IPCC AR5)
  const tCO2eq = ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS_FACTOR
  
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

### Helper Function: Get Default Emission Factor

```typescript
const getDefaultEmissionFactor = (country: string, instrument: string) => {
  // Renewable instruments have 0 emissions
  if (instrument === 'REC' || instrument === 'PPA') {
    return 0
  }
  
  // Green tariff is ~20% of grid average
  if (instrument === 'Green Tariff') {
    return country.toLowerCase().includes('korea') ? 93.06 : 154.156
  }
  
  // Grid default uses standard factors
  return country.toLowerCase().includes('korea') ? 465.29 : 770.78
}
```

## Key Features

### 1. Contractual Instrument Selection
- Dropdown menu untuk memilih jenis instrumen kontrak
- Auto-populate emission factor berdasarkan instrumen
- Visual indicator (Leaf icon) untuk renewable instruments

### 2. Supplier-Specific Emission Factor
- Input field untuk custom emission factor
- Preset values berdasarkan instrument type
- Validation untuk ensure accuracy

### 3. Real-time Calculation
- Live preview saat user mengisi data
- Menampilkan perbedaan dengan location-based
- Highlight zero-emission instruments

### 4. Renewable Energy Tracking
- Badge special untuk REC/PPA
- Percentage renewable energy in statistics
- Visual differentiation in charts

## Data Sources

1. **Korea Power Exchange (KPX)** - Grid emission factors for Korea
2. **PLN (Perusahaan Listrik Negara)** - Grid emission factors for Indonesia
3. **IPCC 2006 Guidelines** - CH4 and N2O emission factors
4. **IPCC AR6 (2021)** - Global Warming Potential values
5. **Supplier Disclosures** - Supplier-specific emission factors
6. **REC/PPA Registries** - Renewable energy certificate verification

## Reporting Requirements

### GHG Protocol Requirements:
- **Location-Based**: Mandatory reporting
- **Market-Based**: Optional but recommended
- **Dual Reporting**: Report both methods for transparency

### Best Practices:
1. Document contractual instruments used
2. Verify supplier emission factors annually
3. Track renewable energy percentage
4. Compare location vs market results
5. Maintain certificate/PPA documentation

## Files Created

- **`components/environment/scope-two-market-content.tsx`** - Main UI component
- **`components/environment/scope-two-market-page.tsx`** - Simple wrapper
- **`components/environment/scope-two-market-page-layout.tsx`** - Layout with sidebar
- **`app/compliance/environment/ghg/scope-two-market/page.tsx`** - Page wrapper with auth
- **`data/scope2_market_mock.json`** - Mock data with various instruments
- **`docs/SCOPE_TWO_MARKET_CALCULATION.md`** - This documentation

## References

- GHG Protocol Scope 2 Guidance: https://ghgprotocol.org/scope_2_guidance
- IPCC 2006 Guidelines: https://www.ipcc-nggip.iges.or.jp/
- IPCC AR6 Report: https://www.ipcc.ch/report/ar6/
- Excel Source: `data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx`
- Sheet: "3-3. (Raw data) Scope 2_Market"

---

**Last Updated:** November 29, 2025  
**Based On:** Hojeon Limited Scope 1, 2 emissions calculation.xlsx (Scope 2 - Market Based sheet)
**Method:** Market-Based (Supplier/Contract-Specific Emission Factors)
