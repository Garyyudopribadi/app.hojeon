// Emission Calculation Logic for GHG Scope 1
// Based on "Hojeon Limited_Scope 1, 2 emissions calculation.xlsx"

// GWP100 values from IPCC AR6 (2021)
export const GWP = {
  CO2: 1,
  CH4: 27,  // Methane - fossil
  N2O: 273, // Nitrous oxide
  'HCFC-22': 1960,
  'CFC-11': 6230,
  'HFC-125': 3740,
  'HFC-410A': 2256,
  'HFC-32': 771,
} as const

// Fuel Density (kg/Liter) from IEA
export const FUEL_DENSITY: Record<string, number> = {
  'Automotive gasoline (petrol)': 0.741,
  'Gas / Diesel oil': 0.844,
  'Liquefied Petroleum Gas (LPG)': 0.539,
  'Biodiesel': 0.845,
  'Automotive gasoline/diesel oil': 0.792, // Average of gasoline and diesel
  'Industrial Wastes': 1.0, // Already in kg
  'Hydrofluorocarbons(HFCs)': 1.0, // kg unit
  'ETC': 1.0, // kg unit
}

// Net Calorific Value (MJ/kg) - IPCC 2006 Guidelines
export const CALORIFIC_VALUE: Record<string, number> = {
  'Automotive gasoline (petrol)': 44.3,
  'Gas / Diesel oil': 43.0,
  'Liquefied Petroleum Gas (LPG)': 47.3,
  'Biodiesel': 37.0,
  'Automotive gasoline/diesel oil': 43.65, // Average
  'Industrial Wastes': 21.75, // Fabric/textile waste
  'Hydrofluorocarbons(HFCs)': 0, // No combustion
  'ETC': 0, // No combustion
}

// Emission Factors (kg/MJ) - IPCC 2006 Guidelines
export const EMISSION_FACTORS = {
  'Automotive gasoline (petrol)': {
    CO2: 0.0693, // kg CO2/MJ
    CH4: 0.000003, // kg CH4/MJ
    N2O: 0.0000006, // kg N2O/MJ
  },
  'Gas / Diesel oil': {
    CO2: 0.0741,
    CH4: 0.0000033,
    N2O: 0.0000006,
  },
  'Liquefied Petroleum Gas (LPG)': {
    CO2: 0.0631,
    CH4: 0.000001,
    N2O: 0.0000001,
  },
  'Biodiesel': {
    CO2: 0.0701,
    CH4: 0.0000033,
    N2O: 0.0000006,
  },
  'Automotive gasoline/diesel oil': {
    CO2: 0.0717, // Average
    CH4: 0.00000315,
    N2O: 0.0000006,
  },
  'Industrial Wastes': {
    CO2: 0.1391, // Higher for solid waste combustion
    CH4: 0.00003,
    N2O: 0.000004,
  },
  'Hydrofluorocarbons(HFCs)': {
    CO2: 0,
    CH4: 0,
    N2O: 0,
  },
  'ETC': {
    CO2: 0,
    CH4: 0,
    N2O: 0,
  },
} as const

export interface MonthlyUsage {
  january: number
  february: number
  maret: number
  april: number
  may: number
  june: number
  july: number
  augustus: number
  september: number
  october: number
  november: number
  december: number
}

export interface EmissionResult {
  fuelUsage: number // Total dari semua bulan
  fuelConsumptionKg: number
  energyConsumptionMJ: number
  ghgEmissionsTCO2eq: number
  kgCO2: number
  kgCH4: number
  kgN2O: number
}

/**
 * Calculate emissions from monthly fuel usage
 * 
 * Formula:
 * 1. fuel_usage = sum of all monthly values
 * 2. fuel_consumption(Kg) = fuel_usage × density (if unit is ㎥) or fuel_usage (if unit is kg)
 * 3. energy_consumption(MJ) = fuel_consumption(Kg) × calorific_value
 * 4. For combustion fuels:
 *    - kgCO2 = energy_consumption(MJ) × CO2_emission_factor
 *    - kgCH4 = energy_consumption(MJ) × CH4_emission_factor  
 *    - kgN2O = energy_consumption(MJ) × N2O_emission_factor
 *    - ghg_emissions(tCO2eq) = (kgCO2 × 1 + kgCH4 × 27 + kgN2O × 273) / 1000
 * 5. For refrigerants (HFCs, ETC):
 *    - ghg_emissions(tCO2eq) = fuel_consumption(kg) × GWP / 1000
 */
export function calculateEmissions(
  monthlyUsage: MonthlyUsage,
  fuelType: string,
  unit: string = '㎥',
  detailedFuel?: string // For specific refrigerants like HFC-410A, HCFC-22
): EmissionResult {
  // Step 1: Calculate total fuel usage
  const fuelUsage = Object.values(monthlyUsage).reduce((sum, val) => sum + val, 0)

  // Step 2: Calculate fuel consumption in kg
  let fuelConsumptionKg = 0
  if (unit === '㎥') {
    // Convert cubic meters to kg using density
    const density = FUEL_DENSITY[fuelType] || 1.0
    fuelConsumptionKg = fuelUsage * density * 1000 // Convert to kg
  } else if (unit === 'kg') {
    // Already in kg
    fuelConsumptionKg = fuelUsage
  } else {
    // Default to kg
    fuelConsumptionKg = fuelUsage
  }

  // Step 3: Calculate energy consumption in MJ
  const calorificValue = CALORIFIC_VALUE[fuelType] || 0
  const energyConsumptionMJ = fuelConsumptionKg * calorificValue

  // Step 4 & 5: Calculate emissions
  let kgCO2 = 0
  let kgCH4 = 0
  let kgN2O = 0
  let ghgEmissionsTCO2eq = 0

  if (fuelType === 'Hydrofluorocarbons(HFCs)' || fuelType === 'ETC') {
    // For refrigerants, use GWP directly
    const gwpValue = detailedFuel ? (GWP[detailedFuel as keyof typeof GWP] || 0) : 0
    ghgEmissionsTCO2eq = (fuelConsumptionKg * gwpValue) / 1000
  } else {
    // For combustion fuels
    const emissionFactors = EMISSION_FACTORS[fuelType as keyof typeof EMISSION_FACTORS] || EMISSION_FACTORS['Automotive gasoline (petrol)']

    kgCO2 = energyConsumptionMJ * emissionFactors.CO2
    kgCH4 = energyConsumptionMJ * emissionFactors.CH4
    kgN2O = energyConsumptionMJ * emissionFactors.N2O

    // Convert to CO2 equivalent using GWP
    ghgEmissionsTCO2eq = (kgCO2 * GWP.CO2 + kgCH4 * GWP.CH4 + kgN2O * GWP.N2O) / 1000
  }

  return {
    fuelUsage,
    fuelConsumptionKg,
    energyConsumptionMJ,
    ghgEmissionsTCO2eq,
    kgCO2,
    kgCH4,
    kgN2O,
  }
}

/**
 * Format number with comma separators
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Parse monthly usage from string values
 */
export function parseMonthlyUsage(data: Record<string, any>): MonthlyUsage {
  const parseValue = (val: string | number): number => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return val
    // Remove commas and convert to number
    return parseFloat(val.replace(/,/g, '')) || 0
  }

  return {
    january: parseValue(data.january),
    february: parseValue(data.february),
    maret: parseValue(data.maret),
    april: parseValue(data.april),
    may: parseValue(data.may),
    june: parseValue(data.june),
    july: parseValue(data.july),
    augustus: parseValue(data.augustus),
    september: parseValue(data.september),
    october: parseValue(data.october),
    november: parseValue(data.november),
    december: parseValue(data.december),
  }
}
