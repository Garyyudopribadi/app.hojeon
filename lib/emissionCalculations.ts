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
  const s = num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  // Replace the final decimal dot with a comma for locale display, e.g. 309.240.189,80
  const lastDot = s.lastIndexOf('.')
  if (lastDot === -1) return s
  return s.slice(0, lastDot) + ',' + s.slice(lastDot + 1)
}

/**
 * Format numeric value according to currency locale rules (without currency symbol)
 * - IDR: Indonesian format (dot thousands, comma decimal) with 2 decimals
 * - KRW: Korean format (comma thousands, no decimals)
 * - fallback: uses `formatNumber`
 */
export function formatCurrency(value: number, currency?: string): string {
  if (value == null || isNaN(value)) return ''
  try {
    const c = (currency || '').toString().trim().toUpperCase()
    if (c === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    }
    if (c === 'KRW') {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
    }
    // fallback: use existing formatNumber behavior (dot thousands + comma decimal)
    return formatNumber(value)
  } catch (e) {
    return formatNumber(value)
  }
}

/**
 * Parse monthly usage from string values
 */
export function parseMonthlyUsage(data: Record<string, any>): MonthlyUsage {
  const parseValue = (val: string | number): number => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return val
    // Remove dots and convert to number
    return parseFloat(val.replace(/\./g, '')) || 0
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

// ==========================================
// SCOPE 2 MARKET-BASED CALCULATION
// ==========================================

export interface ScopeTwoMarketData {
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
  country: string
  contractual_instrument: string
  supplier_emission_factor?: number // kgCO2/MWh
  rec_coverage_percent?: number // 0-100 percent of energy covered by REC/PPA
}

export interface ScopeTwoMarketResult {
  total_purchase_amount: number // MWh
  total_purchase_mj: number // MJ
  kgCO2: number
  kgCH4: number
  kgN2O: number
  tCO2eq: number
}

// Emission Factors for Scope 2 Market (per MJ)
export const SCOPE_TWO_EMISSION_FACTORS = {
  Korea: {
    CO2: 465.3 / 3600, // 0.12925 kgCO2/MJ (465.3 kgCO2/MWh)
    CH4: 0.010 / 3600, // 0.0000027778 kgCH4/MJ (0.010 kgCH4/MWh)
    N2O: 0.005 / 3600, // 0.0000013889 kgN2O/MJ (0.005 kgN2O/MWh)
    GWP_CH4: 27,
    GWP_N2O: 273,
    TD_LOSS: 1.0, // No additional T&D loss
  },
  Indonesia: {
    CO2: 870 / 3600, // 0.241666 kgCO2/MJ (0.87 ton CO2/MWh = 870 kgCO2/MWh)
    CH4: 0.038 / 3600, // 0.0000105556 kgCH4/MJ (0.038 kgCH4/MWh)
    N2O: 0.013 / 3600, // 0.0000036111 kgN2O/MJ (0.013 kgN2O/MWh)
    GWP_CH4: 25,
    GWP_N2O: 298,
    TD_LOSS: 1.12186042, // Transmission & Distribution loss multiplier
  },
} as const

// Renewable Energy Instruments (Zero Emissions)
export const RENEWABLE_INSTRUMENTS = [
  'REC',
  'PPA',
  'Green Tariff',
  'Unbundled EAC',
  'Direct Line',
] as const

/**
 * Calculate Scope 2 Market-Based Emissions
 * 
 * Formula:
 * 1. total_purchase = sum of all monthly values (MWh)
 * 2. total_energy(MJ) = total_purchase × 3,600
 * 3. Check contractual_instrument:
 *    - If REC/PPA/Green Tariff/etc → ALL EMISSIONS = 0
 *    - If Grid Default or Other → Calculate emissions
 * 4. For Grid Default:
 *    - kgCO2 = total_energy(MJ) × CO2_emission_factor(per MJ)
 *    - kgCH4 = total_energy(MJ) × CH4_emission_factor(per MJ)
 *    - kgN2O = total_energy(MJ) × N2O_emission_factor(per MJ)
 * 5. tCO2eq = ((kgCO2 + kgCH4 × GWP_CH4 + kgN2O × GWP_N2O) / 1000) × T&D_Loss
 * 
 * @param data - Monthly purchase data with country and contractual instrument
 * @returns Emission calculation results
 */
export function calculateScopeTwoMarket(
  data: ScopeTwoMarketData
): ScopeTwoMarketResult {
  // Step 1: Calculate total purchase amount (MWh)
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ] as const
  
  const total_purchase_amount = months.reduce(
    (sum, month) => sum + (Number(data[month]) || 0),
    0
  )

  // Step 2: Convert MWh to MJ
  const total_purchase_mj = total_purchase_amount * 3600

  // Step 3: Check if renewable instrument
  const isRenewable = RENEWABLE_INSTRUMENTS.includes(
    data.contractual_instrument as any
  )

  // Helper: apply REC coverage percentage to emissions (0-100)
  const applyRecCoverage = (kgCO2: number, kgCH4: number, kgN2O: number, recPercent?: number) => {
    const pct = recPercent && !isNaN(recPercent) ? Math.max(0, Math.min(100, Number(recPercent))) : 100
    const coveredFraction = pct / 100
    // If pct === 100 => fully covered by REC -> zero emissions
    // If 0 < pct < 100 -> remaining emissions = (1 - coveredFraction) * baseline
    const remainingFraction = 1 - coveredFraction
    return {
      kgCO2: kgCO2 * remainingFraction,
      kgCH4: kgCH4 * remainingFraction,
      kgN2O: kgN2O * remainingFraction,
    }
  }

  // If a supplier-specific emission factor is provided (kgCO2 per MWh), use it as baseline.
  if (typeof data.supplier_emission_factor === 'number' && !isNaN(data.supplier_emission_factor)) {
    const baselineKgCO2 = total_purchase_amount * data.supplier_emission_factor
    const baselineKgCH4 = 0
    const baselineKgN2O = 0

    if (isRenewable) {
      // Apply REC coverage percentage if provided
      const recPercent = data.rec_coverage_percent ?? 100
      const applied = applyRecCoverage(baselineKgCO2, baselineKgCH4, baselineKgN2O, recPercent)
      const tCO2eq = applied.kgCO2 / 1000
      return {
        total_purchase_amount,
        total_purchase_mj,
        kgCO2: applied.kgCO2,
        kgCH4: applied.kgCH4,
        kgN2O: applied.kgN2O,
        tCO2eq,
      }
    }

    const tCO2eq = baselineKgCO2 / 1000
    return {
      total_purchase_amount,
      total_purchase_mj,
      kgCO2: baselineKgCO2,
      kgCH4: baselineKgCH4,
      kgN2O: baselineKgN2O,
      tCO2eq,
    }
  }

  // Determine country-specific factors
  const country = data.country.toLowerCase()
  const isKorea = country.includes('korea') || country.includes('한국')
  
  const factors = isKorea
    ? SCOPE_TWO_EMISSION_FACTORS.Korea
    : SCOPE_TWO_EMISSION_FACTORS.Indonesia

  // Step 5: Calculate individual gas emissions baseline (country factors)
  const baselineKgCO2 = total_purchase_mj * factors.CO2
  const baselineKgCH4 = total_purchase_mj * factors.CH4
  const baselineKgN2O = total_purchase_mj * factors.N2O

  // If renewable instrument, apply REC coverage percent (default 100%)
  if (isRenewable) {
    const recPercent = data.rec_coverage_percent ?? 100
    const applied = applyRecCoverage(baselineKgCO2, baselineKgCH4, baselineKgN2O, recPercent)
    const tCO2eq = ((applied.kgCO2 + applied.kgCH4 * factors.GWP_CH4 + applied.kgN2O * factors.GWP_N2O) / 1000) * factors.TD_LOSS
    return {
      total_purchase_amount,
      total_purchase_mj,
      kgCO2: applied.kgCO2,
      kgCH4: applied.kgCH4,
      kgN2O: applied.kgN2O,
      tCO2eq,
    }
  }

  // Step 6: Calculate total CO2 equivalent with T&D loss for baseline
  const tCO2eq = ((baselineKgCO2 + baselineKgCH4 * factors.GWP_CH4 + baselineKgN2O * factors.GWP_N2O) / 1000) * factors.TD_LOSS

  return {
    total_purchase_amount,
    total_purchase_mj,
    kgCO2: baselineKgCO2,
    kgCH4: baselineKgCH4,
    kgN2O: baselineKgN2O,
    tCO2eq,
  }
}

/**
 * Get contractual instrument display name
 */
export function getContractualInstrumentLabel(instrument: string): string {
  const labels: Record<string, string> = {
    'Grid Default': 'Grid Default (Standard)',
    'REC': 'REC (Renewable Energy Certificate)',
    'PPA': 'PPA (Power Purchase Agreement)',
    'Green Tariff': 'Green Tariff',
    'Unbundled EAC': 'Unbundled EAC',
    'Direct Line': 'Direct Line',
    'Other': 'Other / Supplier-Specific',
  }
  return labels[instrument] || instrument
}

/**
 * Check if contractual instrument is renewable
 */
export function isRenewableInstrument(instrument: string): boolean {
  return RENEWABLE_INSTRUMENTS.includes(instrument as any)
}

/**
 * Format date/time for display
 */
export function formatDateTime(date: string | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid Date'
  }
}
