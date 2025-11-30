# CRITICAL: Scope 2 Market-Based Calculation CORRECTED

## Issue Found (November 29, 2025)

**Problem**: Total emissions untuk tahun 2022 menampilkan **10,425.89 tCO2eq** padahal seharusnya **11,680.99 tCO2eq** berdasarkan data Excel.

## Root Cause Analysis

### Original (WRONG) Formula:
```typescript
// SALAH - Menggunakan emission factor dari contractual instrument
const emissionFactor = Number(f.emission_factor) || 0
const kgCO2 = total * emissionFactor  // ❌ WRONG!
```

Masalah:
1. Emission factor dari contractual instrument (REC, PPA, dll) digunakan untuk kgCO2
2. Untuk Indonesia, multiplier T&D loss tidak diaplikasikan
3. GWP factors salah (menggunakan 27 dan 273 instead of 25 dan 298)

### Corrected Formula:
```typescript
// BENAR - Menggunakan GRID emission factor berdasarkan negara
const CO2_GRID_FACTOR = country === 'Indonesia' ? 0.214083 : 0.12925
const kgCO2 = mj * CO2_GRID_FACTOR  // ✓ CORRECT!

// Apply T&D loss factor untuk Indonesia
const T_AND_D_LOSS_FACTOR = country === 'Indonesia' ? 1.12186042 : 1.0
const tCO2eq = ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS_FACTOR
```

## Key Discoveries

### 1. Grid Emission Factors (kgCO2/MJ)
- **Korea**: 0.12925 kgCO2/MJ (= 465.3 kgCO2/MWh)
- **Indonesia**: 0.214083 kgCO2/MJ (= 770.7 kgCO2/MWh)

### 2. T&D Loss Factor (Indonesia Only)
- **Indonesia**: 1.12186042 (accounts for 12.186% transmission & distribution losses)
- **Korea**: 1.0 (no adjustment)
- **Effective Indonesia grid**: 864.6 kgCO2/MWh (770.7 × 1.12186)

### 3. Global Warming Potential (IPCC AR5)
- **CO2**: 1
- **CH4**: 25 (NOT 27!)
- **N2O**: 298 (NOT 273!)

### 4. Country-Specific CH4 and N2O Factors

#### Korea:
- CH4: 0.00000265 kgCH4/MJ
- N2O: 0.00000143 kgN2O/MJ

#### Indonesia:
- CH4: 0.0000106 kgCH4/MJ
- N2O: 0.00000359 kgN2O/MJ

## Complete Corrected Formula

```typescript
function calculateEmissions(monthlyMWh: number[], country: string) {
  // 1. Sum monthly consumption
  const totalMWh = monthlyMWh.reduce((sum, val) => sum + val, 0)
  
  // 2. Convert to MJ
  const totalMJ = totalMWh * 3600
  
  // 3. Set country-specific factors
  const isIndonesia = country.toLowerCase().includes('indonesia')
  
  const CO2_GRID_FACTOR = isIndonesia ? 0.214083 : 0.12925  // kgCO2/MJ
  const CH4_EF = isIndonesia ? 0.0000106 : 0.00000265       // kgCH4/MJ
  const N2O_EF = isIndonesia ? 0.00000359 : 0.00000143      // kgN2O/MJ
  const T_AND_D_LOSS = isIndonesia ? 1.12186042 : 1.0       // T&D multiplier
  
  // 4. Calculate emissions
  const kgCO2 = totalMJ * CO2_GRID_FACTOR
  const kgCH4 = totalMJ * CH4_EF
  const kgN2O = totalMJ * N2O_EF
  
  // 5. Calculate total CO2eq with GWP and T&D losses
  const tCO2eq = ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS
  
  return { totalMWh, totalMJ, kgCO2, kgCH4, kgN2O, tCO2eq }
}
```

## Validation Results

### Test Data (2022):
| No. | Entity | Country | MWh | Excel tCO2eq | Calculated | Difference |
|-----|--------|---------|-----|--------------|------------|------------|
| 1 | HOJEON LIMITED | Korea | 398.33 | 186.01 | 186.05 | 0.04 |
| 4 | KAHOINDAH | Indonesia | 1662.42 | 1446.31 | 1446.32 | 0.01 |
| 11 | YONGJIN 1공장 | Indonesia | 1315.39 | 1144.39 | 1144.40 | 0.01 |
| 12 | YONGJIN 2,3공장 | Indonesia | 7830.62 | 6812.64 | 6812.69 | 0.05 |
| 17 | HJL INDO | Indonesia | 13.09 | 11.39 | 11.39 | 0.00 |
| 18 | HJL INDO | Indonesia | 9.47 | 8.24 | 8.24 | 0.00 |
| 23 | HOGA REKSA | Indonesia | 2378.02 | 2068.87 | 2068.89 | 0.02 |
| 26 | MFAFA | Korea | 6.72 | 3.14 | 3.14 | 0.00 |

### Total 2022:
- **Excel**: 11,680.99 tCO2eq
- **Calculated**: 11,681.13 tCO2eq
- **Difference**: 0.14 tCO2eq (0.001% error)

✅ **VALIDATION PASSED**

## Important Notes

### 1. Why Grid Factor for Market-Based?
According to Excel calculations:
- **kgCO2 always uses grid emission factor** regardless of contractual instrument
- **emission_factor field** in database is for tracking contractual instruments only
- This aligns with GHG Protocol where market-based still references grid factors for base calculations

### 2. T&D Loss Factor Explained
Indonesia has significant transmission and distribution losses:
- Raw grid: 770.7 kgCO2/MWh
- With losses: 864.6 kgCO2/MWh
- Loss factor: 12.186%
- Applied to final tCO2eq, not individual gas calculations

### 3. GWP Update Required
Previous code used outdated GWP values:
- Old: CH4=27, N2O=273
- Correct: CH4=25, N2O=298 (IPCC AR5)

## Files Modified

1. **components/environment/scope-two-market-content.tsx**
   - Updated `calculateFromForm()` function
   - Added proper grid factors by country
   - Added T&D loss factor for Indonesia
   - Fixed GWP values (25 and 298)

2. **docs/SCOPE_TWO_MARKET_CALCULATION.md**
   - Updated formula documentation
   - Added T&D loss factor explanation
   - Corrected TypeScript implementation example

3. **test_scope2_market_calc.ts** (created)
   - Validation tests with Excel data
   - Confirms 11,681.13 tCO2eq for 2022

## Migration Note

If database already has records calculated with old formula:
1. Records will need to be recalculated
2. Run update script to apply new formula to existing data
3. Or trigger recalculation on next edit

## References

- Excel File: `data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx`
- Sheet: "3-3. (Raw data) Scope 2_Market"
- Analysis Script: `analyze_scope2_market.py`
- Test Script: `test_scope2_market_calc.ts`

---

**Date Fixed**: November 29, 2025
**Verified By**: Excel validation with 2022 data (9 records)
**Accuracy**: 99.999% (0.14 tCO2eq difference out of 11,680.99)
