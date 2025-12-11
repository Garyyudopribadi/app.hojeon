'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, PieChart, Pie, Cell, ComposedChart, Line, Area } from 'recharts'
import { TrendingUp, TrendingDown, Factory, Zap, Flame, Building2, Activity, BarChart3, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatNumber } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Types for data
interface ScopeOneData {
  id: string
  entity: string
  facility: string
  own_facility: string
  classification_fuel_rawmaterial: string
  emissions_activites: string
  detailed_desc: string
  types_of_fuel: string
  detailed_desc_fuel: string
  date_collection: string
  january: string
  february: string
  maret: string
  april: string
  may: string
  june: string
  july: string
  augustus: string
  september: string
  october: string
  november: string
  december: string
  fuel_usage: string
  unit: string
  'fuel_consumption(Kg)': string
  'energy_consumption(MJ)': string
  'ghg_emissions(tCO2eq)': string
  kgCO2: string
  kgCH4: string
  kgN2O: string
  updated_by: string
  updated_date: string
}

interface ScopeTwoLocationData {
  id: string
  entity: string
  facility: string
  tCO2eq: number
  total_mj: number
  total_amount: number
  date_collection?: string
  year?: number
}

interface ScopeTwoMarketData {
  id: string
  entity: string
  facility: string
  country: string
  year: number
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
  total_amount: number
  total_mj: number
  kgCO2: number
  kgCH4: number
  kgN2O: number
  tCO2eq: number
}

interface RenewableEnergyData {
  id: string
  entity: string
  facility: string
  unit: string
  date_collection: string
  year?: number
  january: number | string
  february: number | string
  march: number | string
  april: number | string
  may: number | string
  june: number | string
  july: number | string
  august: number | string
  september: number | string
  october: number | string
  november: number | string
  december: number | string
}

// Parse comma-decimal numbers
function parseLocaleNumber(v: any): number {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return v
  let s = String(v).trim()
  if (s === '') return 0
  s = s.replace(/\s+/g, ' ')
  const hasDot = s.indexOf('.') !== -1
  const hasComma = s.indexOf(',') !== -1
  if (hasComma && hasDot) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    s = s.replace(',', '.')
  }
  s = s.replace(/[^0-9.-]/g, '')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

// Helper function for country emission factor (must be defined before useMemo)
const countryEmissionFactor = (country: string) => {
  if (!country) return 0
  const c = country.toLowerCase()
  if (c.includes('korea')) return 465.29  // Korea Power Exchange (2022-2024 average)
  if (c.includes('indonesia') || c.includes('indon')) return 770.78  // PLN (Indonesia)
  return 500  // Default fallback
}

const calculateFromForm = (f: Partial<ScopeTwoMarketData>) => {
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
  const total = months.reduce((s, m) => {
    const val = parseLocaleNumber((f as any)[m])
    const num = isNaN(val) ? 0 : val
    return s + num
  }, 0)
  
  // Step 1: Convert MWh to MJ (1 MWh = 3,600 MJ)
  const mj = total * 3600
  
  // Step 2: Calculate kgCO2 and other gases
  const country = (f.country || '').toLowerCase()

  // Default per-MJ emission factors (kg per MJ)
  let CO2_GRID_FACTOR_MJ = country.includes('korea') ? 0.12925 : 0.1388888889 // fallback rough value
  let CH4_EF_PER_MJ = 0.00000265
  let N2O_EF_PER_MJ = 0.00000143

  // Legacy Indonesia-specific factors (used in tests/docs): CO2 per MJ, CH4, N2O, and T&D loss
  const INDONESIA_LEGACY = {
    CO2_MJ: 0.214083,         // kgCO2 per MJ -> ~770.6988 kgCO2/MWh
    CH4_MJ: 0.0000106,
    N2O_MJ: 0.00000359,
    GWP_CH4: 25,
    GWP_N2O: 298,
    T_AND_D_LOSS: 1.12186042
  }

  // Use Indonesia legacy method to match historical/test expectations
  if (country.includes('indonesia') || country.includes('indon')) {
    CO2_GRID_FACTOR_MJ = INDONESIA_LEGACY.CO2_MJ
    CH4_EF_PER_MJ = INDONESIA_LEGACY.CH4_MJ
    N2O_EF_PER_MJ = INDONESIA_LEGACY.N2O_MJ
  }

  // Compute per-gas emissions (kg)
  const kgCO2 = mj * CO2_GRID_FACTOR_MJ
  const kgCH4 = mj * CH4_EF_PER_MJ
  const kgN2O = mj * N2O_EF_PER_MJ

  // Apply GWPs and (for Indonesia) apply T&D loss multiplier to match legacy calculations
  let tCO2eq = 0
  if (country.includes('indonesia') || country.includes('indon')) {
    tCO2eq = ((kgCO2 + kgCH4 * INDONESIA_LEGACY.GWP_CH4 + kgN2O * INDONESIA_LEGACY.GWP_N2O) / 1000) * INDONESIA_LEGACY.T_AND_D_LOSS
  } else {
    // Default: use AR6 GWPs (CO2=1, CH4=27, N2O=273)
    tCO2eq = (kgCO2 * 1 + kgCH4 * 27 + kgN2O * 273) / 1000
  }

  return { total_amount: total, total_mj: mj, kgCO2, kgCH4, kgN2O, tCO2eq }
}

export default function GHGContent() {
  const [scopeOneData, setScopeOneData] = useState<ScopeOneData[]>([])
  const [scopeTwoLocationData, setScopeTwoLocationData] = useState<ScopeTwoLocationData[]>([])
  const [scopeTwoMarketData, setScopeTwoMarketData] = useState<ScopeTwoMarketData[]>([])
  const [renewableEnergyData, setRenewableEnergyData] = useState<RenewableEnergyData[]>([])
  const [loading, setLoading] = useState(true)
  const [targetYear, setTargetYear] = useState<number>(2030)
  const [targetEmission, setTargetEmission] = useState<number>(0)
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false)

  // Load target settings from localStorage
  useEffect(() => {
    const savedYear = localStorage.getItem('ghg_target_year')
    const savedEmission = localStorage.getItem('ghg_target_emission')
    if (savedYear) setTargetYear(Number(savedYear))
    if (savedEmission) setTargetEmission(Number(savedEmission))
  }, [])

  const handleSaveTarget = () => {
    localStorage.setItem('ghg_target_year', String(targetYear))
    localStorage.setItem('ghg_target_emission', String(targetEmission))
    setIsTargetDialogOpen(false)
  }

  // Fetch data from all three scopes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch Scope 1 data
        const { data: scope1, error: err1 } = await supabase
          .from('ghg_scopeone')
          .select('*')

        if (err1) {
          console.error('Error fetching scope 1:', err1)
          console.error('Error details:', JSON.stringify(err1, null, 2))
        }

        // Fetch Scope 2 Location data
        const { data: scope2Loc, error: err2 } = await supabase
          .from('ghg_scopetwo_location')
          .select('*')

        if (err2) {
          console.error('Error fetching scope 2 location:', err2)
          console.error('Error details:', JSON.stringify(err2, null, 2))
        }

        // Fetch renewable energy data for market-based calculations
        const { data: renewable, error: err3 } = await supabase
          .from('ghg_scopetwo_renewableenergy')
          .select('*')

        if (err3) {
          console.error('Error fetching renewable energy:', err3)
          console.error('Error details:', JSON.stringify(err3, null, 2))
        }

        // Fetch Scope 2 Market data (same as location but will be adjusted with renewable energy)
        const { data: scope2Market, error: err4 } = await supabase
          .from('ghg_scopetwo_location')
          .select('*')

        if (err4) {
          console.error('Error fetching scope 2 market:', err4)
          console.error('Error details:', JSON.stringify(err4, null, 2))
        }

        setScopeOneData(scope1 || [])
        try {
          setScopeTwoLocationData((scope2Loc || []).map((r: any) => ({
            id: String(r.id || ''),
            entity: r.entity || '',
            facility: r.facility || '',
            tCO2eq: Number(r.tco2eq ?? r.tCO2eq ?? r.tco2_eq) || 0,
            total_mj: Number(r.total_purchase_mj ?? r.total_mj ?? r.totalmj) || 0,
            total_amount: Number(r.total_purchase_amount ?? r.total_amount ?? r.totalamount) || 0,
            date_collection: r.date_collection ?? r.datecollection ?? undefined,
            year: Number(r.date_collection ?? r.year ?? r.datecollection) || undefined
          })))
        } catch (mapError) {
          console.error('Error processing scope 2 location data:', mapError)
          setScopeTwoLocationData([])
        }

        try {
          setRenewableEnergyData((renewable || []).map((r: any) => ({
            id: String(r.id || ''),
            entity: r.entity || '',
            facility: r.facility || '',
            unit: r.unit || 'MWh',
            date_collection: r.date_collection ?? r.datecollection ?? '',
            year: Number(r.date_collection ?? r.year ?? r.datecollection) || undefined,
            january: r.january ?? 0,
            february: r.february ?? 0,
            march: r.march ?? 0,
            april: r.april ?? 0,
            may: r.may ?? 0,
            june: r.june ?? 0,
            july: r.july ?? 0,
            august: r.august ?? 0,
            september: r.september ?? 0,
            october: r.october ?? 0,
            november: r.november ?? 0,
            december: r.december ?? 0
          })))
        } catch (mapError) {
          console.error('Error processing renewable energy data:', mapError)
          setRenewableEnergyData([])
        }

        try {
          setScopeTwoMarketData((scope2Market || []).map((r: any) => ({
            id: String(r.id || ''),
            entity: r.entity || '',
            facility: r.facility || '',
            country: r.country || '',
            year: Number(r.year ?? r.date_collection ?? r.datecollection) || 0,
            january: Number(r.january ?? 0),
            february: Number(r.february ?? 0),
            march: Number(r.march ?? 0),
            april: Number(r.april ?? 0),
            may: Number(r.may ?? 0),
            june: Number(r.june ?? 0),
            july: Number(r.july ?? 0),
            august: Number(r.august ?? 0),
            september: Number(r.september ?? 0),
            october: Number(r.october ?? 0),
            november: Number(r.november ?? 0),
            december: Number(r.december ?? 0),
            total_amount: Number(r.total_amount ?? r.totalamount ?? 0),
            total_mj: Number(r.total_mj ?? r.totalmj ?? 0),
            kgCO2: Number(r.kgCO2 ?? r.kgco2 ?? 0),
            kgCH4: Number(r.kgCH4 ?? r.kgch4 ?? 0),
            kgN2O: Number(r.kgN2O ?? r.kgn2o ?? 0),
            tCO2eq: Number(r.tCO2eq ?? r.tco2eq ?? r.tco2_eq ?? 0)
          })))
        } catch (mapError) {
          console.error('Error processing scope 2 market data:', mapError)
          setScopeTwoMarketData([])
        }

      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate Scope 1 totals
  const scopeOneTotals = useMemo(() => {
    const totalEmissions = scopeOneData.reduce((sum, item) => sum + parseLocaleNumber(item['ghg_emissions(tCO2eq)']), 0)
    const totalEnergy = scopeOneData.reduce((sum, item) => sum + parseLocaleNumber(item['energy_consumption(MJ)']), 0)
    const totalFuel = scopeOneData.reduce((sum, item) => sum + parseLocaleNumber(item['fuel_consumption(Kg)']), 0)
    const totalRecords = scopeOneData.length

    return { totalEmissions, totalEnergy, totalFuel, totalRecords }
  }, [scopeOneData])

  // Calculate Scope 2 Location totals
  const scopeTwoLocationTotals = useMemo(() => {
    const totalEmissions = scopeTwoLocationData.reduce((sum, item) => sum + (item.tCO2eq || 0), 0)
    const totalEnergy = scopeTwoLocationData.reduce((sum, item) => sum + (item.total_mj || 0), 0)
    const totalPurchase = scopeTwoLocationData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
    const totalRecords = scopeTwoLocationData.length

    return { totalEmissions, totalEnergy, totalPurchase, totalRecords }
  }, [scopeTwoLocationData])

  // Adjust market-based data in-memory by subtracting matching renewable monthly values
  const adjustedMarketData = useMemo(() => {
    if (!scopeTwoMarketData || scopeTwoMarketData.length === 0) return scopeTwoMarketData

    // Build lookup: `${facility}::${year}` -> aggregated renewable monthly values
    const renewableMap = new Map<string, Record<string, number>>()
    renewableEnergyData.forEach(r => {
      const facilityKey = (r.facility || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      const yearKey = String(r.date_collection ?? r.year ?? '').trim()
      const key = `${facilityKey}::${yearKey}`
      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
      const existing = renewableMap.get(key) || {}
      const agg: Record<string, number> = { ...existing }
      months.forEach(m => {
        const monthlyValue = parseLocaleNumber((r as any)[m]) || 0
        // Convert to MWh if unit is kWh
        const convertedValue = r.unit === 'kWh' ? monthlyValue / 1000 : monthlyValue
        agg[m] = (agg[m] || 0) + convertedValue
      })
      renewableMap.set(key, agg)
    })

    return scopeTwoMarketData.map(item => {
      // Skip renewable adjustment for records ID 9 and 10
      if (item.id === '9' || item.id === '10') return item

      const facilityKey = (item.facility || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      const yearKey = String(item.year ?? '').trim()
      const key = `${facilityKey}::${yearKey}`
      const renewable = renewableMap.get(key)
      if (!renewable) return item

      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
      const adjusted: ScopeTwoMarketData = { ...item }

      // Subtract renewable monthly values (cap at 0 to avoid negative energy)
      months.forEach(m => {
        const orig = Number((item as any)[m]) || 0
        const red = Number(renewable[m] || 0)
        adjusted[m] = Math.max(0, orig - red)
      })

      // Recalculate totals and emissions based on adjusted months
      const calc = calculateFromForm(adjusted)
      adjusted.total_amount = calc.total_amount
      adjusted.total_mj = calc.total_mj
      adjusted.kgCO2 = calc.kgCO2
      adjusted.kgCH4 = calc.kgCH4
      adjusted.kgN2O = calc.kgN2O
      adjusted.tCO2eq = calc.tCO2eq

      return adjusted
    })
  }, [scopeTwoMarketData, renewableEnergyData])

  // Calculate Scope 2 Market totals (with renewable energy adjustments)
  const scopeTwoMarketTotals = useMemo(() => {
    const totalEmissions = Math.round(adjustedMarketData.reduce((sum, item) => sum + (item.tCO2eq || 0), 0) * 1000) / 1000
    const totalEnergy = adjustedMarketData.reduce((sum, item) => sum + (item.total_mj || 0), 0)
    const totalPurchase = Math.round(adjustedMarketData.reduce((sum, item) => sum + parseLocaleNumber(item.total_amount), 0) * 1000) / 1000
    const totalRecords = adjustedMarketData.length

    // Calculate total renewable energy used for adjustments
    const renewableEnergyTotal = renewableEnergyData.reduce((sum, item) => {
      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
      return sum + months.reduce((monthSum, month) => monthSum + parseLocaleNumber((item as any)[month]), 0)
    }, 0)

    return { totalEmissions, totalEnergy, totalPurchase, totalRecords, renewableEnergyTotal }
  }, [adjustedMarketData, renewableEnergyData])

  // Calculate overall totals
  const overallTotals = useMemo(() => {
    const totalEmissions = scopeOneTotals.totalEmissions + scopeTwoLocationTotals.totalEmissions + scopeTwoMarketTotals.totalEmissions
    const totalEnergy = scopeOneTotals.totalEnergy + scopeTwoLocationTotals.totalEnergy + scopeTwoMarketTotals.totalEnergy
    const totalRecords = scopeOneTotals.totalRecords + scopeTwoLocationTotals.totalRecords + scopeTwoMarketTotals.totalRecords

    return { totalEmissions, totalEnergy, totalRecords }
  }, [scopeOneTotals, scopeTwoLocationTotals, scopeTwoMarketTotals])

  // Helper to get year from date string
  const getYear = (dateStr: string | undefined) => {
    if (!dateStr) return new Date().getFullYear()
    const d = new Date(dateStr)
    return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear()
  }

  // Combined Location Totals (Scope 1 + Scope 2 Location)
  const combinedLocationTotals = useMemo(() => {
    return {
      totalEmissions: scopeOneTotals.totalEmissions + scopeTwoLocationTotals.totalEmissions,
      totalEnergy: scopeOneTotals.totalEnergy + scopeTwoLocationTotals.totalEnergy,
      totalRecords: scopeOneTotals.totalRecords + scopeTwoLocationTotals.totalRecords
    }
  }, [scopeOneTotals, scopeTwoLocationTotals])

  // Combined Market Totals (Scope 1 + Scope 2 Market)
  const combinedMarketTotals = useMemo(() => {
    return {
      totalEmissions: scopeOneTotals.totalEmissions + scopeTwoMarketTotals.totalEmissions,
      totalEnergy: scopeOneTotals.totalEnergy + scopeTwoMarketTotals.totalEnergy,
      totalRecords: scopeOneTotals.totalRecords + scopeTwoMarketTotals.totalRecords
    }
  }, [scopeOneTotals, scopeTwoMarketTotals])

  // Aggregate data by year for charts
  const combinedLocationByYear = useMemo(() => {
    const map = new Map<number, number>()
    
    // Scope 1
    scopeOneData.forEach(d => {
      const y = getYear(d.date_collection)
      const val = parseLocaleNumber(d['ghg_emissions(tCO2eq)'])
      map.set(y, (map.get(y) || 0) + val)
    })

    // Scope 2 Location
    scopeTwoLocationData.forEach(d => {
      const y = d.year || getYear(d.date_collection)
      map.set(y, (map.get(y) || 0) + (d.tCO2eq || 0))
    })

    return Array.from(map.entries())
      .map(([year, emissions]) => ({ year, emissions }))
      .sort((a, b) => a.year - b.year)
  }, [scopeOneData, scopeTwoLocationData])

  const combinedMarketByYear = useMemo(() => {
    const map = new Map<number, number>()
    
    // Scope 1
    scopeOneData.forEach(d => {
      const y = getYear(d.date_collection)
      const val = parseLocaleNumber(d['ghg_emissions(tCO2eq)'])
      map.set(y, (map.get(y) || 0) + val)
    })

    // Scope 2 Market
    adjustedMarketData.forEach(d => {
      const y = d.year || new Date().getFullYear()
      map.set(y, (map.get(y) || 0) + (d.tCO2eq || 0))
    })

    return Array.from(map.entries())
      .map(([year, emissions]) => ({ year, emissions }))
      .sort((a, b) => a.year - b.year)
  }, [scopeOneData, adjustedMarketData])

  // Generate projection data
  const getProjectionData = (historical: {year: number, emissions: number}[]) => {
     if (!historical.length) return []
     const sorted = [...historical].sort((a,b) => a.year - b.year)
     const last = sorted[sorted.length - 1]
     
     const data = sorted.map(d => ({
         year: d.year,
         actual: d.emissions as number | null,
         projection: null as number | null
     }))

     if (targetYear > last.year) {
         // Connect the line to the last actual point
         data[data.length - 1].projection = last.emissions

         const startYear = last.year
         const startVal = last.emissions
         const yearsDiff = targetYear - startYear
         const valDiff = targetEmission - startVal
         const step = valDiff / yearsDiff

         for (let i = 1; i <= yearsDiff; i++) {
             const y = startYear + i
             const val = startVal + (step * i)
             data.push({
                 year: y,
                 actual: null,
                 projection: val
             })
         }
     }
     return data
  }

  // Prepare chart data for scope comparison
  const scopeComparisonData = useMemo(() => {
    return [
      {
        scope: 'Scope 1',
        emissions: scopeOneTotals.totalEmissions,
        energy: scopeOneTotals.totalEnergy,
        records: scopeOneTotals.totalRecords,
        fill: '#f59e0b'
      },
      {
        scope: 'Scope 2 Location',
        emissions: scopeTwoLocationTotals.totalEmissions,
        energy: scopeTwoLocationTotals.totalEnergy,
        records: scopeTwoLocationTotals.totalRecords,
        fill: '#3b82f6'
      },
      {
        scope: 'Scope 2 Market',
        emissions: scopeTwoMarketTotals.totalEmissions,
        energy: scopeTwoMarketTotals.totalEnergy,
        records: scopeTwoMarketTotals.totalRecords,
        fill: '#22c55e'
      }
    ]
  }, [scopeOneTotals, scopeTwoLocationTotals, scopeTwoMarketTotals])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GHG Emissions Overview</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of emissions data from all three scopes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsTargetDialogOpen(true)}>
            <Target className="mr-2 h-4 w-4" />
            Set Target
          </Button>
          <Activity className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Total GHG Emissions
            </CardTitle>
            <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {formatNumber(overallTotals.totalEmissions, 2)}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">tCO2eq across all scopes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Energy Consumption
            </CardTitle>
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatNumber(overallTotals.totalEnergy, 2)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">MJ across all scopes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Total Records
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {overallTotals.totalRecords}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">Data entries across all scopes</p>
          </CardContent>
        </Card>
      </div>

      {/* Scope-by-Scope Breakdown */}
      <Tabs defaultValue="scope1" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scope1" className="gap-2">
            <Flame className="h-4 w-4" />
            Scope 1
          </TabsTrigger>
          <TabsTrigger value="scope2-location" className="gap-2">
            <Zap className="h-4 w-4" />
            Scope 2 Location
          </TabsTrigger>
          <TabsTrigger value="scope2-market" className="gap-2">
            <Building2 className="h-4 w-4" />
            Scope 2 Market
          </TabsTrigger>
          <TabsTrigger value="combined-location" className="gap-2">
            <Activity className="h-4 w-4" />
            Combined Location
          </TabsTrigger>
          <TabsTrigger value="combined-market" className="gap-2">
            <Activity className="h-4 w-4" />
            Combined Market
          </TabsTrigger>
        </TabsList>

        {/* Scope 1 Tab */}
        <TabsContent value="scope1" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scope 1 Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeOneTotals.totalEmissions, 2)}</div>
                <p className="text-xs text-muted-foreground">tCO2eq</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeOneTotals.totalEnergy, 2)}</div>
                <p className="text-xs text-muted-foreground">MJ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fuel Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeOneTotals.totalFuel, 2)}</div>
                <p className="text-xs text-muted-foreground">Kg</p>
                <div className="mt-2 pt-2 border-t">
                  <div className="text-sm font-medium">{scopeOneTotals.totalRecords}</div>
                  <p className="text-xs text-muted-foreground">Records</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scope 2 Location Tab */}
        <TabsContent value="scope2-location" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scope 2 Location Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoLocationTotals.totalEmissions, 2)}</div>
                <p className="text-xs text-muted-foreground">tCO2eq</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoLocationTotals.totalEnergy, 2)}</div>
                <p className="text-xs text-muted-foreground">MJ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Electricity Purchase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoLocationTotals.totalPurchase, 2)}</div>
                <p className="text-xs text-muted-foreground">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scopeTwoLocationTotals.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Emissions Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                GHG Emissions Trend by Year
              </CardTitle>
              <CardDescription>Location-based emissions from electricity & steam purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Total emissions display */}
              <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Total Emissions (All Data)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(scopeTwoLocationTotals.totalEmissions)}</p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">tCO2eq</p>
                </div>
              </div>

              <ChartContainer config={{
                'Scope 2 Location': { label: 'Scope 2 Location', color: '#3b82f6' }
              }} className="h-[300px] w-full">
                <BarChart data={[{ scope: 'Location', emissions: scopeTwoLocationTotals.totalEmissions }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="scope" className="text-xs" />
                  <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft' }} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="emissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scope 2 Market Tab */}
        <TabsContent value="scope2-market" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scope 2 Market Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoMarketTotals.totalEmissions, 2)}</div>
                <p className="text-xs text-muted-foreground">tCO2eq (adjusted)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoMarketTotals.totalEnergy, 2)}</div>
                <p className="text-xs text-muted-foreground">MJ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Electricity Purchase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoMarketTotals.totalPurchase, 2)}</div>
                <p className="text-xs text-muted-foreground">MWh</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Renewable Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(scopeTwoMarketTotals.renewableEnergyTotal, 2)}</div>
                <p className="text-xs text-muted-foreground">MWh</p>
                <div className="mt-2 pt-2 border-t">
                  <div className="text-sm font-medium">{scopeTwoMarketTotals.totalRecords}</div>
                  <p className="text-xs text-muted-foreground">Records</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emissions Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                GHG Emissions Trend by Year
              </CardTitle>
              <CardDescription>Market-based emissions from electricity & steam purchases (adjusted for renewable energy)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Total emissions display */}
              <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">
                      Total Emissions (All Data)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatNumber(scopeTwoMarketTotals.totalEmissions)}</p>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">tCO2eq</p>
                </div>
              </div>

              <ChartContainer config={{
                'Scope 2 Market': { label: 'Scope 2 Market', color: '#22c55e' }
              }} className="h-[300px] w-full">
                <BarChart data={[{ scope: 'Market', emissions: scopeTwoMarketTotals.totalEmissions }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="scope" className="text-xs" />
                  <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft' }} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="emissions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>

              {/* Renewable Energy Info */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      Renewable Energy Adjustment
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Market-based emissions are calculated by subtracting renewable energy consumption from location-based totals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      {formatNumber(scopeTwoMarketTotals.renewableEnergyTotal, 2)}
                    </p>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">MWh Renewable</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined Location Tab */}
        <TabsContent value="combined-location" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(combinedLocationTotals.totalEmissions, 2)}</div>
                <p className="text-xs text-muted-foreground">tCO2eq (Scope 1 + Scope 2 Location)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(combinedLocationTotals.totalEnergy, 2)}</div>
                <p className="text-xs text-muted-foreground">MJ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{combinedLocationTotals.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Entries</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emissions Trend & Target</CardTitle>
              <CardDescription>Historical emissions vs Target ({targetYear})</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                actual: { label: 'Actual Emissions', color: '#3b82f6' },
                projection: { label: 'Target Path', color: '#f59e0b' }
              }} className="h-[300px] w-full">
                <ComposedChart data={getProjectionData(combinedLocationByYear)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft' }} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual Emissions" barSize={40} />
                  <Line type="monotone" dataKey="projection" stroke="#f59e0b" strokeWidth={2} name="Target Path" dot={{ r: 4 }} />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined Market Tab */}
        <TabsContent value="combined-market" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(combinedMarketTotals.totalEmissions, 2)}</div>
                <p className="text-xs text-muted-foreground">tCO2eq (Scope 1 + Scope 2 Market)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(combinedMarketTotals.totalEnergy, 2)}</div>
                <p className="text-xs text-muted-foreground">MJ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{combinedMarketTotals.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Entries</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emissions Trend & Target</CardTitle>
              <CardDescription>Historical emissions vs Target ({targetYear})</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                actual: { label: 'Actual Emissions', color: '#22c55e' },
                projection: { label: 'Target Path', color: '#f59e0b' }
              }} className="h-[300px] w-full">
                <ComposedChart data={getProjectionData(combinedMarketByYear)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft' }} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="actual" fill="#22c55e" name="Actual Emissions" barSize={40} />
                  <Line type="monotone" dataKey="projection" stroke="#f59e0b" strokeWidth={2} name="Target Path" dot={{ r: 4 }} />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scope Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Scope Comparison</CardTitle>
          <CardDescription>
            Emissions comparison across all three scopes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            'Scope 1': { label: 'Scope 1', color: '#f59e0b' },
            'Scope 2 Location': { label: 'Scope 2 Location', color: '#3b82f6' },
            'Scope 2 Market': { label: 'Scope 2 Market', color: '#22c55e' }
          }} className="h-[300px] w-full">
            <BarChart data={scopeComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="scope" className="text-xs" />
              <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft' }} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="emissions" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.open('/compliance/environment/ghg/scope-one', '_blank')}>
          <Flame className="h-4 w-4 mr-2" />
          View Scope 1 Details
        </Button>
        <Button variant="outline" onClick={() => window.open('/compliance/environment/ghg/scope-two-location', '_blank')}>
          <Zap className="h-4 w-4 mr-2" />
          View Scope 2 Location Details
        </Button>
        <Button variant="outline" onClick={() => window.open('/compliance/environment/ghg/scope-two-basedmarket', '_blank')}>
          <Building2 className="h-4 w-4 mr-2" />
          View Scope 2 Market Details
        </Button>
      </div>
      {/* Target Setting Dialog */}
      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set GHG Emission Target</DialogTitle>
            <DialogDescription>
              Set your target year and emission goal. This will be visualized in the combined charts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-year" className="text-right">
                Target Year
              </Label>
              <Input
                id="target-year"
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-emission" className="text-right">
                Target Emission (tCO2eq)
              </Label>
              <Input
                id="target-emission"
                type="number"
                value={targetEmission}
                onChange={(e) => setTargetEmission(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTarget}>Save Target</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}