import { NextRequest, NextResponse } from 'next/server'
import { calculateEmissions, parseMonthlyUsage } from '@/lib/emissionCalculations'

/**
 * POST /api/ghg/scope-one/calculate
 * Calculate emissions for a single record based on monthly fuel usage
 * 
 * Request body:
 * {
 *   monthlyUsage: { january: number, february: number, ..., december: number },
 *   fuelType: string,
 *   unit: string, // '㎥' or 'kg'
 *   detailedFuel?: string // For refrigerants like 'HFC-410A'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { monthlyUsage, fuelType, unit, detailedFuel } = body

    if (!monthlyUsage || !fuelType) {
      return NextResponse.json(
        { error: 'Missing required fields: monthlyUsage, fuelType' },
        { status: 400 }
      )
    }

    const result = calculateEmissions(
      monthlyUsage,
      fuelType,
      unit || '㎥',
      detailedFuel
    )

    return NextResponse.json({
      success: true,
      data: result,
      calculation: {
        formula: 'Based on IPCC 2006 Guidelines and AR6 (2021) GWP values',
        steps: [
          '1. fuel_usage = sum of monthly values',
          '2. fuel_consumption(Kg) = fuel_usage × density (for ㎥) or fuel_usage (for kg)',
          '3. energy_consumption(MJ) = fuel_consumption(Kg) × calorific_value',
          '4. kgCO2 = energy(MJ) × CO2_emission_factor',
          '5. kgCH4 = energy(MJ) × CH4_emission_factor',
          '6. kgN2O = energy(MJ) × N2O_emission_factor',
          '7. ghg_emissions(tCO2eq) = (kgCO2×1 + kgCH4×27 + kgN2O×273) / 1000',
        ],
      },
    })
  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate emissions', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ghg/scope-one/calculate?test=true
 * Test calculation with sample data
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const test = searchParams.get('test')

  if (test === 'true') {
    // Example: Automotive gasoline calculation (same as Excel example)
    const sampleMonthlyUsage = {
      january: 1.79,
      february: 1.63,
      maret: 1.65,
      april: 2.03,
      may: 1.98,
      june: 1.54,
      july: 2.10,
      augustus: 2.09,
      september: 2.07,
      october: 1.57,
      november: 1.35,
      december: 2.09,
    }

    const result = calculateEmissions(
      sampleMonthlyUsage,
      'Automotive gasoline (petrol)',
      '㎥'
    )

    return NextResponse.json({
      example: 'Automotive Gasoline (Petrol) - 2022 Data',
      input: {
        monthlyUsage: sampleMonthlyUsage,
        fuelType: 'Automotive gasoline (petrol)',
        unit: '㎥',
      },
      result,
      expectedFromExcel: {
        fuelUsage: 21.90,
        fuelConsumptionKg: 16225.13,
        energyConsumptionMJ: 718773.18,
        ghgEmissionsTCO2eq: 49.99,
        kgCO2: 49810.98,
        kgCH4: 2.16,
        kgN2O: 0.43,
      },
      note: 'Minor differences may occur due to rounding in Excel vs exact calculations',
    })
  }

  return NextResponse.json({
    message: 'GHG Scope One Emission Calculator API',
    endpoints: {
      calculate: 'POST /api/ghg/scope-one/calculate',
      test: 'GET /api/ghg/scope-one/calculate?test=true',
    },
    documentation: {
      description: 'Calculate GHG emissions based on monthly fuel usage',
      method: 'POST',
      body: {
        monthlyUsage: 'Monthly fuel usage values (Jan-Dec)',
        fuelType: 'Type of fuel (e.g., Automotive gasoline (petrol))',
        unit: 'Unit of measurement (㎥ or kg)',
        detailedFuel: '(Optional) Specific refrigerant type for HFCs/ETC',
      },
    },
  })
}
