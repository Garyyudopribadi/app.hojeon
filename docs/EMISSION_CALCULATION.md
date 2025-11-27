# GHG Scope One Emission Calculation

## Overview

Sistem perhitungan emisi GHG Scope One berdasarkan **IPCC 2006 Guidelines** dan menggunakan **Global Warming Potential (GWP)** dari **IPCC AR6 (2021)**.

## Calculation Flow

```
User Input (Monthly Data)
        ↓
1. Fuel Usage Calculation
   fuel_usage = Σ(Jan + Feb + Mar + ... + Dec)
        ↓
2. Fuel Consumption (Kg)
   IF unit = "㎥":
      fuel_consumption(Kg) = fuel_usage × density × 1000
   IF unit = "kg":
      fuel_consumption(Kg) = fuel_usage
        ↓
3. Energy Consumption (MJ)
   energy_consumption(MJ) = fuel_consumption(Kg) × calorific_value
        ↓
4. Individual Gas Emissions
   kgCO2 = energy_consumption(MJ) × CO2_emission_factor
   kgCH4 = energy_consumption(MJ) × CH4_emission_factor
   kgN2O = energy_consumption(MJ) × N2O_emission_factor
        ↓
5. Total GHG Emissions (CO2 equivalent)
   ghg_emissions(tCO2eq) = (kgCO2 × 1 + kgCH4 × 27 + kgN2O × 273) / 1000
```

## Emission Factors

### 1. Global Warming Potential (GWP100) - IPCC AR6 2021

| Gas | GWP100 Value |
|-----|--------------|
| CO2 | 1 |
| CH4 (fossil) | 27 |
| N2O | 273 |
| HCFC-22 | 1,960 |
| CFC-11 | 6,230 |
| HFC-125 | 3,740 |
| HFC-410A | 2,256 |
| HFC-32 | 771 |

### 2. Fuel Density (kg/Liter) - IEA

| Fuel Type | Density (kg/L) |
|-----------|----------------|
| Automotive gasoline (petrol) | 0.741 |
| Gas / Diesel oil | 0.844 |
| Liquefied Petroleum Gas (LPG) | 0.539 |
| Biodiesel | 0.845 |
| Industrial Wastes | 1.0 (already in kg) |

### 3. Net Calorific Value (MJ/kg) - IPCC 2006

| Fuel Type | Calorific Value (MJ/kg) |
|-----------|-------------------------|
| Automotive gasoline (petrol) | 44.3 |
| Gas / Diesel oil | 43.0 |
| Liquefied Petroleum Gas (LPG) | 47.3 |
| Biodiesel | 37.0 |
| Industrial Wastes (textile) | 21.75 |

### 4. Emission Factors (kg/MJ) - IPCC 2006

| Fuel Type | CO2 | CH4 | N2O |
|-----------|-----|-----|-----|
| Automotive gasoline (petrol) | 0.0693 | 0.000003 | 0.0000006 |
| Gas / Diesel oil | 0.0741 | 0.0000033 | 0.0000006 |
| Liquefied Petroleum Gas (LPG) | 0.0631 | 0.000001 | 0.0000001 |
| Biodiesel | 0.0701 | 0.0000033 | 0.0000006 |
| Industrial Wastes | 0.1391 | 0.00003 | 0.000004 |

## Example Calculation

### Automotive Gasoline (Petrol) - 2022 Data

**Input:**
- Monthly usage (㎥): Jan=1.79, Feb=1.63, Mar=1.65, Apr=2.03, May=1.98, Jun=1.54, Jul=2.10, Aug=2.09, Sep=2.07, Oct=1.57, Nov=1.35, Dec=2.09
- Fuel type: Automotive gasoline (petrol)
- Unit: ㎥

**Calculation Steps:**

1. **Fuel Usage**
   ```
   fuel_usage = 1.79 + 1.63 + 1.65 + 2.03 + 1.98 + 1.54 + 2.10 + 2.09 + 2.07 + 1.57 + 1.35 + 2.09
              = 21.90 ㎥
   ```

2. **Fuel Consumption**
   ```
   fuel_consumption(Kg) = 21.90 × 0.741 × 1000
                        = 16,225.13 kg
   ```

3. **Energy Consumption**
   ```
   energy_consumption(MJ) = 16,225.13 × 44.3
                          = 718,773.18 MJ
   ```

4. **Individual Gas Emissions**
   ```
   kgCO2 = 718,773.18 × 0.0693 = 49,810.98 kg
   kgCH4 = 718,773.18 × 0.000003 = 2.16 kg
   kgN2O = 718,773.18 × 0.0000006 = 0.43 kg
   ```

5. **Total GHG Emissions**
   ```
   ghg_emissions(tCO2eq) = (49,810.98 × 1 + 2.16 × 27 + 0.43 × 273) / 1000
                         = (49,810.98 + 58.32 + 117.39) / 1000
                         = 49,986.69 / 1000
                         = 49.99 tCO2eq
   ```

**Result:**
- ✅ Fuel Usage: 21.90 ㎥
- ✅ Fuel Consumption: 16,225 kg
- ✅ Energy Consumption: 718,773 MJ
- ✅ GHG Emissions: **49.99 tCO2eq**
- ✅ kgCO2: 49,811 kg
- ✅ kgCH4: 2.16 kg
- ✅ kgN2O: 0.43 kg

## Special Cases

### Refrigerants (HFCs, HCFC, CFC)

For refrigerants, the calculation is simpler:

```
ghg_emissions(tCO2eq) = fuel_consumption(kg) × GWP / 1000
```

**Example: HFC-410A**
```
Input: 11.3 kg of HFC-410A
ghg_emissions = 11.3 × 2256 / 1000 = 25.49 tCO2eq
```

## API Usage

### Calculate Emissions

**Endpoint:** `POST /api/ghg/scope-one/calculate`

**Request Body:**
```json
{
  "monthlyUsage": {
    "january": 1.79,
    "february": 1.63,
    "maret": 1.65,
    "april": 2.03,
    "may": 1.98,
    "june": 1.54,
    "july": 2.10,
    "augustus": 2.09,
    "september": 2.07,
    "october": 1.57,
    "november": 1.35,
    "december": 2.09
  },
  "fuelType": "Automotive gasoline (petrol)",
  "unit": "㎥"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fuelUsage": 21.90,
    "fuelConsumptionKg": 16225.13,
    "energyConsumptionMJ": 718773.18,
    "ghgEmissionsTCO2eq": 49.99,
    "kgCO2": 49810.98,
    "kgCH4": 2.16,
    "kgN2O": 0.43
  }
}
```

### Test Endpoint

**URL:** `GET /api/ghg/scope-one/calculate?test=true`

Returns a sample calculation with expected results from Excel.

## Implementation Files

- **`lib/emissionCalculations.ts`** - Core calculation logic and emission factors
- **`app/api/ghg/scope-one/calculate/route.ts`** - API endpoint for calculations
- **`components/environment/scope-one-page.tsx`** - UI implementation

## Data Sources

1. **IPCC 2006 Guidelines** for National Greenhouse Gas Inventories
2. **IPCC AR6 (2021)** - Sixth Assessment Report for GWP values
3. **IEA** (International Energy Agency) - Fuel density data
4. **Korea Petroleum Management Institute** (한국석유관리원) - Biodiesel density

## References

- IPCC Guidelines: https://www.ipcc-nggip.iges.or.jp/
- IPCC AR6 Report: https://www.ipcc.ch/report/ar6/
- Excel Source: `data/Hojeon Limited_Scope 1, 2 emissions calculation.xlsx`

---

**Last Updated:** November 27, 2025  
**Based On:** Hojeon Limited Scope 1, 2 emissions calculation.xlsx
