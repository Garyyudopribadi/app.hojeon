// This file was auto-generated from Excel data
'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Plus, Search, Download, Filter, TrendingUp, ChevronLeft, ChevronRight, Calculator, X, Eye, Pencil, Leaf, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/emissionCalculations'

interface GHGScopeTwoMarketData {
  id: string
  no?: number
  entity: string
  facility: string
  country: string
  classification: string
  contractual_instrument: string
  emission_factor: number
  emission_factor_unit: string
  certificate_id?: string
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
  unit: string
  currency?: string
  currency_unit?: string
  supplier?: string
  supplier_name?: string
  year: string | number
  total_amount: number
  total_mj: number
  kgCO2: number
  kgCH4: number
  kgN2O: number
  tCO2eq: number
  updated_by?: string | null
  updated_date?: string | null
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return 'N/A'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'Invalid date'
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return String(iso)
  }
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  'Electricity': '#3b82f6',
  'Steam': '#f59e0b',
}

const INSTRUMENT_COLORS: Record<string, string> = {
  'REC': '#10b981',           // Green - Renewable
  'PPA': '#22c55e',            // Light Green - Power Purchase Agreement
  'Green Tariff': '#84cc16',  // Lime - Green Tariff
  'Supplier Disclosure': '#f59e0b', // Amber - Supplier Specific
  'Grid Default': '#6b7280',  // Gray - Default Grid
}

const ENTITY_COLORS: Record<string, string> = {
  'HOJEON LIMITED': '#3b82f6',
  'PT. KAHOINDAH CITRAGARMENT': '#ef4444',
  'PT.KAHOINDAH CITRAGARMENT': '#ef4444',
  'PT.HOGA REKSA GARMENT': '#06b6d4',
  'PT. HOGA REKSA GARMENT': '#06b6d4',
  'PT.YONGJIN JAVASUKA GARMENT': '#22c55e',
  'PT. YONGJIN JAVASUKA GARMENT': '#22c55e',
  'PT.HJL INDO NETWORKS': '#f97316',
  'PT. HJL INDO NETWORKS': '#f97316',
  'PT. HCI INDONESIA': '#f59e0b',
  '㈜다산': '#8b5cf6',
  '㈜엠파파': '#ec4899',
  'default': '#6b7280'
}

const EXTENDED_COLORS = [
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', 
  '#a855f7', '#eab308', '#22c55e', '#f43f5e', '#0ea5e9'
]

const getEntityColor = (entity: string, index?: number): string => {
  if (ENTITY_COLORS[entity]) return ENTITY_COLORS[entity]
  if (index !== undefined) return EXTENDED_COLORS[index % EXTENDED_COLORS.length]
  return ENTITY_COLORS['default']
}

export default function ScopeTwoMarketContent() {
  const { toast } = useToast()
  const [data, setData] = useState<GHGScopeTwoMarketData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [filterInstrument, setFilterInstrument] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [chartFilterEntity, setChartFilterEntity] = useState<string>('all')
  const [chartFilterCountry, setChartFilterCountry] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly')
  const [selectedMonthlyYear, setSelectedMonthlyYear] = useState<string>('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GHGScopeTwoMarketData | null>(null)
  const [viewingRecord, setViewingRecord] = useState<GHGScopeTwoMarketData | null>(null)

  const emptyForm: Partial<GHGScopeTwoMarketData> = {
    entity: '', facility: '', country: '', classification: 'Electricity',
    contractual_instrument: 'Grid Default', emission_factor: 0, emission_factor_unit: 'kgCO2/MWh',
    january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
    july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
    unit: 'MWh', currency: '', supplier: '', year: new Date().getFullYear(),
    total_amount: 0, total_mj: 0, kgCO2: 0, kgCH4: 0, kgN2O: 0, tCO2eq: 0,
    updated_by: '', updated_date: null
  }

  const [formData, setFormData] = useState<Partial<GHGScopeTwoMarketData>>(emptyForm)
  const [businesses, setBusinesses] = useState<{entity: string, facility: string, country: string}[]>([])
  const [suppliersList, setSuppliersList] = useState<string[]>([])

  const loadData = useCallback(async () => {
    try {
      // Try to load from database first
      const { data: dbRows, error } = await supabase
        .from('ghg_scopetwo_market')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Supabase fetch error ghg_scopetwo_market:', error)
        toast({ title: 'Data load error', description: error.message || 'Failed to fetch ghg_scopetwo_market' })
      }

      if (!error && dbRows && dbRows.length > 0) {
        // Map database fields to component interface and RECALCULATE ALL emissions
        const mapped: GHGScopeTwoMarketData[] = (dbRows as any[]).map(r => {
          // Normalize month names (some tables use Indonesian month names)
          const jan = Number(r.january || 0)
          const feb = Number(r.february || 0)
          const mar = Number(r.march ?? r.maret ?? 0)
          const apr = Number(r.april || 0)
          const may = Number(r.may || 0)
          const jun = Number(r.june || 0)
          const jul = Number(r.july || 0)
          const aug = Number(r.august ?? r.augustus ?? 0)
          const sep = Number(r.september || 0)
          const oct = Number(r.october || 0)
          const nov = Number(r.november || 0)
          const dec = Number(r.december || 0)

          const months = [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
          const totalMWh = months.reduce((sum, val) => sum + (Number(val) || 0), 0)
          const totalMJ = totalMWh * 3600

          const contractualInstrument = (r.contractual_instrument || '').toUpperCase()
          const isRenewable = contractualInstrument === 'REC' || contractualInstrument === 'PPA'

          let kgCO2 = 0
          let kgCH4 = 0
          let kgN2O = 0
          let tCO2eq = 0

          if (totalMWh > 0) {
            const country = (r.country || '').toLowerCase()
            let CH4_EF_PER_MJ = 0.00000265
            let N2O_EF_PER_MJ = 0.00000143
            let T_AND_D_LOSS_FACTOR = 1.0

            if (country.includes('indonesia') || country.includes('indon')) {
              CH4_EF_PER_MJ = 0.0000106
              N2O_EF_PER_MJ = 0.00000359
              T_AND_D_LOSS_FACTOR = 1.12186042
            }

            // Recalculate emissions per Excel Market sheet logic
            // CO2 uses supplier emission_factor (kgCO2/MWh), not grid factor per MJ
            const emissionFactor = Number(r.emission_factor) || 0
            kgCO2 = isRenewable ? 0 : totalMWh * emissionFactor
            kgCH4 = totalMJ * CH4_EF_PER_MJ
            kgN2O = totalMJ * N2O_EF_PER_MJ
            tCO2eq = ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS_FACTOR
          }

          return {
            id: r.id,
            entity: r.entity || '',
            facility: r.facility || '',
            country: r.country || '',
            classification: r.classification || 'Electricity',
            contractual_instrument: r.contractual_instrument || 'Grid Default',
            emission_factor: r.emission_factor || 0,
            emission_factor_unit: r.emission_factor_unit || 'kgCO2/MWh',
            certificate_id: r.certificate_id || '',
            january: jan,
            february: feb,
            march: mar,
            april: apr,
            may: may,
            june: jun,
            july: jul,
            august: aug,
            september: sep,
            october: oct,
            november: nov,
            december: dec,
            unit: r.unit || 'MWh',
            currency_unit: r.currency || r.currency_unit || '',
            supplier_name: r.supplier || r.supplier_name || '',
            supplier: r.supplier || r.supplier_name || '',
            year: r.year || r.date_collection || '',
            total_amount: totalMWh,
            total_mj: totalMJ,
            kgCO2: kgCO2,
            kgCH4: kgCH4,
            kgN2O: kgN2O,
            tCO2eq: tCO2eq,
            updated_by: r.updated_by || '',
            updated_date: r.updated_date || '',
          }
        })

        // Resolve nicknames for updated_by
        const ids = [...new Set(mapped.map(x => x.updated_by).filter(Boolean))]
        if (ids.length > 0) {
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id,nickname')
            .in('id', ids)
          
          const nickMap = new Map((profiles || []).map((p: any) => [p.id, p.nickname || p.id]))
          mapped.forEach(row => {
            if (row.updated_by) {
              row.updated_by = nickMap.get(row.updated_by) || row.updated_by
            }
          })
        }

        setData(mapped)
      } else {
        // Fallback to mock data if database is empty or has error
        const response = await fetch('/data/scope2_market_mock.json')
        const mockData = await response.json()
        setData(mockData)
      }
    } catch (error) {
      // Fallback to mock data on error
      try {
        const response = await fetch('/data/scope2_market_mock.json')
        const mockData = await response.json()
        setData(mockData)
      } catch (mockError) {
        toast({ title: 'Load error', description: 'Failed to load data' })
      }
    }
  }, [toast])

  const loadLookups = useCallback(async () => {
    try {
      const { data: bizRows } = await supabase
        .from('general_information_business')
        .select('entity,facility,country')

      if (bizRows) {
        const mapped = (bizRows as any[]).map(r => ({ 
          entity: r.entity || '', 
          facility: r.facility || '', 
          country: r.country || '' 
        }))
        setBusinesses(mapped)
      }
    } catch (e) {
      // ignore lookup errors
    }
  }, [])

  useEffect(() => { 
    loadData()
    loadLookups() 
  }, [loadData, loadLookups])

  useEffect(() => {
    if (!isAddOpen) return
    ;(async () => {
      try {
        const name = await getUpdaterName()
        setFormData(prev => ({ 
          ...(prev || {}), 
          updated_by: name, 
          updated_date: new Date().toISOString() 
        }))
      } catch (e) {
        // ignore
      }
    })()
  }, [isAddOpen])

  const getUpdaterName = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = (userData as any)?.user
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .maybeSingle()

        if (profile && (profile as any).nickname) return (profile as any).nickname
      }
      return user?.user_metadata?.nickname || user?.email || 'System'
    } catch (e) {
      return 'System'
    }
  }

  const years = useMemo(() => {
    const yearSet = new Set(data.map(item => item.year.toString()))
    const sortedYears = Array.from(yearSet).sort()
    if (sortedYears.length > 0 && !selectedMonthlyYear) {
      setSelectedMonthlyYear(sortedYears[sortedYears.length - 1])
    }
    return sortedYears
  }, [data, selectedMonthlyYear])

  const entities = useMemo(() => {
    const entitySet = new Set(data.map(item => item.entity))
    return Array.from(entitySet).sort()
  }, [data])

  const countries = useMemo(() => {
    const countrySet = new Set(data.map(item => item.country))
    return Array.from(countrySet).sort()
  }, [data])

  const instruments = useMemo(() => {
    const instrumentSet = new Set(data.map(item => item.contractual_instrument))
    return Array.from(instrumentSet).sort()
  }, [data])

  const getDefaultEmissionFactor = (country: string, instrument: string) => {
    if (instrument === 'REC' || instrument === 'PPA') return 0
    if (instrument === 'Green Tariff') {
      return country.toLowerCase().includes('korea') ? 93.06 : 154.156
    }
    // Grid Default
    return country.toLowerCase().includes('korea') ? 465.29 : 770.78
  }

  const statistics = useMemo(() => {
    let filtered = data
    if (filterYear !== 'all') filtered = filtered.filter(item => item.year.toString() === filterYear)
    if (filterEntity !== 'all') filtered = filtered.filter(item => item.entity === filterEntity)
    if (filterCountry !== 'all') filtered = filtered.filter(item => item.country === filterCountry)
    if (filterInstrument !== 'all') filtered = filtered.filter(item => item.contractual_instrument === filterInstrument)

    return {
      totalEmissions: filtered.reduce((sum, item) => sum + item.tCO2eq, 0),
      totalEnergyMJ: filtered.reduce((sum, item) => sum + item.total_mj, 0),
      totalPurchase: filtered.reduce((sum, item) => sum + item.total_amount, 0),
      totalRecords: filtered.length,
      renewablePercentage: filtered.length > 0 ? 
        (filtered.filter(item => item.contractual_instrument === 'REC' || item.contractual_instrument === 'PPA').length / filtered.length * 100) : 0
    }
  }, [data, filterYear, filterEntity, filterCountry, filterInstrument])

  const chartData = useMemo(() => {
    let filtered = data
    if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
    if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)

    if (viewMode === 'yearly') {
      const dataByYear: Record<string, Record<string, number>> = {}
      filtered.forEach(item => {
        const year = item.year.toString()
        if (!dataByYear[year]) dataByYear[year] = {}
        if (!dataByYear[year][item.entity]) dataByYear[year][item.entity] = 0
        dataByYear[year][item.entity] += item.tCO2eq
      })
      
      return years.map(year => {
        const yearData: any = { year }
        const entitiesInYear = filtered.filter(d => d.year.toString() === year)
        const uniqueEntities = Array.from(new Set(entitiesInYear.map(d => d.entity)))
        uniqueEntities.forEach(entity => {
          yearData[entity] = dataByYear[year]?.[entity] || 0
        })
        return yearData
      })
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
      
      const yearFiltered = selectedMonthlyYear ? filtered.filter(d => d.year.toString() === selectedMonthlyYear) : filtered
      
      return months.map((month, idx) => {
        const monthData: any = { month }
        const uniqueEntities = Array.from(new Set(yearFiltered.map(d => d.entity)))
        uniqueEntities.forEach(entity => {
          const entityRecords = yearFiltered.filter(d => d.entity === entity)
          const monthKey = monthKeys[idx] as keyof GHGScopeTwoMarketData
          const monthlyTotal = entityRecords.reduce((sum, record) => {
            const val = record[monthKey]
            if (typeof val === 'number') {
              return sum + computeMonthlyTCO2eq(record, val)
            }
            return sum
          }, 0)
          monthData[entity] = monthlyTotal
        })
        return monthData
      })
    }
  }, [data, years, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  const chartTotalEmissions = useMemo(() => {
    let filtered = data
    if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
    if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)
    if (viewMode === 'monthly' && selectedMonthlyYear) {
      filtered = filtered.filter(item => item.year.toString() === selectedMonthlyYear)
    }
    return filtered.reduce((sum, item) => sum + item.tCO2eq, 0)
  }, [data, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  const chartEntityBreakdown = useMemo(() => {
    let filtered = data
    if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
    if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)
    if (viewMode === 'monthly' && selectedMonthlyYear) {
      filtered = filtered.filter(item => item.year.toString() === selectedMonthlyYear)
    }
    
    const breakdown: Record<string, number> = {}
    filtered.forEach(item => {
      if (!breakdown[item.entity]) breakdown[item.entity] = 0
      breakdown[item.entity] += item.tCO2eq
    })
    
    return Object.entries(breakdown)
      .map(([entity, value]) => ({ entity, value }))
      .sort((a, b) => b.value - a.value)
  }, [data, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  // Yearly totals aggregation to validate against Excel
  const yearlyTotals = useMemo(() => {
    const totals = new Map<string, number>()
    data.forEach(item => {
      const y = item.year.toString()
      totals.set(y, (totals.get(y) || 0) + item.tCO2eq)
    })
    // Return sorted by year
    return Array.from(totals.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [data])

  const filteredTableData = useMemo(() => {
    let filtered = data
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    if (filterYear !== 'all') filtered = filtered.filter(item => item.year.toString() === filterYear)
    if (filterEntity !== 'all') filtered = filtered.filter(item => item.entity === filterEntity)
    if (filterCountry !== 'all') filtered = filtered.filter(item => item.country === filterCountry)
    if (filterInstrument !== 'all') filtered = filtered.filter(item => item.contractual_instrument === filterInstrument)
    return filtered
  }, [data, searchTerm, filterYear, filterEntity, filterCountry, filterInstrument])

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTableData, currentPage])

  const calculateFromForm = (f: Partial<GHGScopeTwoMarketData>) => {
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
    const total = months.reduce((s, m) => s + (Number((f as any)[m]) || 0), 0)

    const mj = total * 3600

    const country = (f.country || '').toLowerCase()
    let CH4_EF_PER_MJ = 0.00000265
    let N2O_EF_PER_MJ = 0.00000143
    let T_AND_D_LOSS_FACTOR = 1.0

    if (country.includes('indonesia') || country.includes('indon')) {
      CH4_EF_PER_MJ = 0.0000106
      N2O_EF_PER_MJ = 0.00000359
      T_AND_D_LOSS_FACTOR = 1.12186042
    }

    const contractualInstrument = (f.contractual_instrument || '').toUpperCase()
    const isRenewable = contractualInstrument === 'REC' || contractualInstrument === 'PPA'

    // CO2 uses supplier emission_factor (kgCO2/MWh), not grid factor per MJ
    const emissionFactor = Number(f.emission_factor) || 0
    const kgCO2 = isRenewable ? 0 : total * emissionFactor
    const kgCH4 = mj * CH4_EF_PER_MJ
    const kgN2O = mj * N2O_EF_PER_MJ
    const tCO2eq = ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS_FACTOR

    return { total_amount: total, total_mj: mj, kgCO2, kgCH4, kgN2O, tCO2eq }
  }

  const computeMonthlyTCO2eq = (record: GHGScopeTwoMarketData, monthValueMWh: number): number => {
    if (!monthValueMWh) return 0
    const country = (record.country || '').toLowerCase()
    let CH4_EF_PER_MJ = 0.00000265
    let N2O_EF_PER_MJ = 0.00000143
    let T_AND_D_LOSS_FACTOR = 1.0
    if (country.includes('indonesia') || country.includes('indon')) {
      CH4_EF_PER_MJ = 0.0000106
      N2O_EF_PER_MJ = 0.00000359
      T_AND_D_LOSS_FACTOR = 1.12186042
    }
    const mj = monthValueMWh * 3600
    const contractualInstrument = (record.contractual_instrument || '').toUpperCase()
    const isRenewable = contractualInstrument === 'REC' || contractualInstrument === 'PPA'
    // CO2 uses supplier emission_factor (kgCO2/MWh)
    const emissionFactor = Number(record.emission_factor) || 0
    const kgCO2 = isRenewable ? 0 : monthValueMWh * emissionFactor
    const kgCH4 = mj * CH4_EF_PER_MJ
    const kgN2O = mj * N2O_EF_PER_MJ
    return ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS_FACTOR
  }

  const handleAdd = async () => {
    try {
      // Validate required fields
      if (!formData.entity || !formData.facility || !formData.country) {
        toast({ title: 'Validation Error', description: 'Please fill in entity, facility, and country' })
        return
      }

      // Calculate emissions
      const calc = calculateFromForm(formData)
      const updaterName = await getUpdaterName()

      // Prepare payload for database using new column names
      const payload = {
        entity: formData.entity,
        facility: formData.facility,
        country: formData.country,
        classification: formData.classification || 'Electricity',
        contractual_instrument: formData.contractual_instrument || 'Grid Default',
        emission_factor: Number(formData.emission_factor) || 0,
        emission_factor_unit: formData.emission_factor_unit || 'kgCO2/MWh',
        certificate_id: formData.certificate_id || null,
        january: Number(formData.january) || 0,
        february: Number(formData.february) || 0,
        maret: Number(formData.march) || 0,
        april: Number(formData.april) || 0,
        may: Number(formData.may) || 0,
        june: Number(formData.june) || 0,
        july: Number(formData.july) || 0,
        augustus: Number(formData.august) || 0,
        september: Number(formData.september) || 0,
        october: Number(formData.october) || 0,
        november: Number(formData.november) || 0,
        december: Number(formData.december) || 0,
        unit: formData.unit || 'MWh',
        currency: formData.currency_unit || formData.currency || null,
        supplier: formData.supplier_name || (formData as any).supplier || null,
        year: formData.year || new Date().getFullYear().toString(),
        total_amount: calc.total_amount,
        total_mj: calc.total_mj,
        kgco2: calc.kgCO2,
        kgch4: calc.kgCH4,
        kgn2o: calc.kgN2O,
        tco2eq: calc.tCO2eq,
        updated_by: updaterName,
        updated_date: new Date().toISOString(),
      }

      const { error } = await supabase.from('ghg_scopetwo_market').insert(payload)

      if (error) {
        toast({ title: 'Insert Error', description: error.message, variant: 'destructive' })
        return
      }

      toast({ title: 'Success', description: 'Record added successfully' })
      setIsAddOpen(false)
      setFormData({} as GHGScopeTwoMarketData)
      await loadData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add record', variant: 'destructive' })
    }
  }

  const handleOpenEdit = (row: GHGScopeTwoMarketData) => {
    setEditingRecord(row)
    setFormData({ ...row })
    setIsEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingRecord) return

    try {
      // Validate required fields
      if (!formData.entity || !formData.facility || !formData.country) {
        toast({ title: 'Validation Error', description: 'Please fill in entity, facility, and country' })
        return
      }

      // Calculate emissions
      const calc = calculateFromForm(formData)
      const updaterName = await getUpdaterName()

      // Prepare payload for database update using new column names
      const payload = {
        entity: formData.entity,
        facility: formData.facility,
        country: formData.country,
        classification: formData.classification || 'Electricity',
        contractual_instrument: formData.contractual_instrument || 'Grid Default',
        emission_factor: Number(formData.emission_factor) || 0,
        emission_factor_unit: formData.emission_factor_unit || 'kgCO2/MWh',
        certificate_id: formData.certificate_id || null,
        january: Number(formData.january) || 0,
        february: Number(formData.february) || 0,
        maret: Number(formData.march) || 0,
        april: Number(formData.april) || 0,
        may: Number(formData.may) || 0,
        june: Number(formData.june) || 0,
        july: Number(formData.july) || 0,
        augustus: Number(formData.august) || 0,
        september: Number(formData.september) || 0,
        october: Number(formData.october) || 0,
        november: Number(formData.november) || 0,
        december: Number(formData.december) || 0,
        unit: formData.unit || 'MWh',
        currency: formData.currency_unit || formData.currency || null,
        supplier: formData.supplier_name || (formData as any).supplier || null,
        year: formData.year || new Date().getFullYear().toString(),
        total_amount: calc.total_amount,
        total_mj: calc.total_mj,
        kgco2: calc.kgCO2,
        kgch4: calc.kgCH4,
        kgn2o: calc.kgN2O,
        tco2eq: calc.tCO2eq,
        updated_by: updaterName,
        updated_date: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('ghg_scopetwo_market')
        .update(payload)
        .eq('id', editingRecord.id)

      if (error) {
        toast({ title: 'Update Error', description: error.message, variant: 'destructive' })
        return
      }

      toast({ title: 'Success', description: 'Record updated successfully' })
      setIsEditOpen(false)
      setEditingRecord(null)
      setFormData({} as GHGScopeTwoMarketData)
      await loadData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update record', variant: 'destructive' })
    }
  }

  const handleOpenView = (row: GHGScopeTwoMarketData) => {
    setViewingRecord(row)
    setIsViewOpen(true)
  }

  return (
    <>
      <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>Scope Two GHG Emissions - Market Based</h1>
          <p className='text-sm md:text-base text-muted-foreground'>Track and analyze electricity & steam purchase emissions using supplier-specific factors</p>
        </div>

        <Card className='bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Leaf className='h-5 w-5 text-emerald-600' />
              Scope 2 Market-Based Calculation Method
            </CardTitle>
            <CardDescription>How emissions are calculated using supplier/contract-specific emission factors</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold text-sm text-emerald-900 dark:text-emerald-300'>Input Data:</h4>
                <ul className='text-xs space-y-1.5 text-muted-foreground'>
                  <li className='flex items-start gap-2'>
                    <span className='text-emerald-600 mt-0.5'>•</span>
                    <span>Monthly electricity/steam purchase (MWh)</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-emerald-600 mt-0.5'>•</span>
                    <span><strong>Contractual Instrument</strong> (REC, PPA, Green Tariff, etc.)</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-emerald-600 mt-0.5'>•</span>
                    <span><strong>Supplier-Specific Emission Factor</strong> (kgCO2/MWh)</span>
                  </li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold text-sm text-green-900 dark:text-green-300'>Excel Market Sheet Logic:</h4>
                <ul className='text-xs space-y-1.5 text-muted-foreground'>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 mt-0.5'>→</span>
                    <span><strong>kgCO2</strong> = Total MWh × Supplier Emission Factor (kgCO2/MWh)</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 mt-0.5'>→</span>
                    <span><strong>CH4 & N2O</strong> = Total MJ × country CH4/N2O factors (tetap untuk REC/PPA)</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 mt-0.5'>→</span>
                    <span><strong>Renewable (REC/PPA)</strong>: Emission Factor = 0 → CO2 = 0; CH4/N2O kecil</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 mt-0.5'>→</span>
                    <span><strong>T&D Loss</strong>: Diterapkan (Indonesia 1.12186×) ke total tCO2eq</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className='p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border'>
              <p className='text-xs text-muted-foreground'>
                <strong className='text-emerald-700 dark:text-emerald-400'>Market-Based:</strong> Mengikuti file Excel (sheet "3-3. (Raw data) Scope 2_Market") perhitungan kgCO2 menggunakan <strong>supplier-specific emission factor</strong> (kgCO2/MWh), bukan grid factor. CH4/N2O tetap per MJ, dengan T&D loss untuk Indonesia (1.12186×). GWP AR5: CH4=25, N2O=298.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-4'>
            <div className='flex flex-col gap-4'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  GHG Emissions Trend by Year
                </CardTitle>
                <CardDescription>Market-based emissions from electricity & steam purchases</CardDescription>
              </div>
              {yearlyTotals.length > 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  {yearlyTotals.map(([y, v]) => (
                    <div key={y} className='p-3 rounded-lg border bg-muted/30'>
                      <p className='text-xs font-medium text-muted-foreground'>Total {y}</p>
                      <p className='text-xl font-bold'>{formatNumber(v / 1000, 3)}</p>
                      <p className='text-xs text-muted-foreground'>ktCO2eq</p>
                    </div>
                  ))}
                </div>
              )}

              {yearlyTotals.length > 0 && (
                <div className='mt-2 p-3 rounded-lg border bg-muted/20'>
                  <p className='text-xs font-semibold text-muted-foreground mb-2'>Excel Comparison (ktCO2eq, 3 decimals)</p>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                    {['2022','2023','2024'].map(y => {
                      const found = yearlyTotals.find(([yy]) => yy.toString() === y)
                      const computedKt = found ? (found[1] / 1000) : 0
                      const expected = y === '2022' ? 11.681 : y === '2023' ? 12.204 : 12.831
                      const computedRounded = Number(computedKt.toFixed(3))
                      const match = Math.abs(computedRounded - expected) < 0.0005
                      const delta = Number((computedKt - expected).toFixed(3))
                      return (
                        <div key={y} className='p-2 rounded-md border bg-background'>
                          <div className='flex items-center justify-between mb-1'>
                            <p className='text-xs font-medium text-muted-foreground'>Year {y}</p>
                            {match ? (
                              <span className='inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold'>
                                <CheckCircle2 className='h-3.5 w-3.5' /> Match
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1 text-amber-600 text-xs font-semibold'>
                                <AlertCircle className='h-3.5 w-3.5' /> Mismatch
                              </span>
                            )}
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='text-[11px] text-muted-foreground'>Expected</div>
                            <div className='text-[13px] font-semibold'>{formatNumber(expected, 3)}</div>
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='text-[11px] text-muted-foreground'>Computed</div>
                            <div className='text-[13px] font-semibold'>{formatNumber(computedKt, 3)}</div>
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='text-[11px] text-muted-foreground'>Delta</div>
                            <div className={`text-[13px] font-semibold ${delta === 0 ? 'text-muted-foreground' : (delta > 0 ? 'text-emerald-700' : 'text-rose-700')}`}>{delta.toFixed(3)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className='flex flex-col gap-4 pt-2 border-t'>
                <div className='flex items-center justify-between flex-wrap gap-3'>
                  <div className='flex items-center gap-2'>
                    <Filter className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium text-muted-foreground'>View Mode:</span>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant={viewMode === 'yearly' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setViewMode('yearly')}
                    >
                      Yearly
                    </Button>
                    <Button
                      variant={viewMode === 'monthly' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setViewMode('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
                
                <div className='space-y-1'>
                  <label className='text-xs font-medium text-muted-foreground'>Filter by:</label>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 items-end'>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Entity</Label>
                      <Select value={chartFilterEntity} onValueChange={setChartFilterEntity}>
                        <SelectTrigger className='h-9 w-full'><SelectValue placeholder='All Entities' /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All Entities</SelectItem>
                          {entities.map(entity => <SelectItem key={entity} value={entity}>{entity}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-xs text-muted-foreground'>Country</Label>
                      <Select value={chartFilterCountry} onValueChange={setChartFilterCountry}>
                        <SelectTrigger className='h-9 w-full'><SelectValue placeholder='All Countries' /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All Countries</SelectItem>
                          {countries.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {viewMode === 'monthly' && (
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>Year (for Monthly)</Label>
                        <Select value={selectedMonthlyYear} onValueChange={setSelectedMonthlyYear}>
                          <SelectTrigger className='h-9 w-full'><SelectValue placeholder='Select Year' /></SelectTrigger>
                          <SelectContent>
                            {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='mb-4 flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0'>
                  <TrendingUp className='h-4 w-4 text-white' />
                </div>
                <div>
                  <p className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                    {chartFilterEntity === 'all' && chartFilterCountry === 'all' 
                      ? 'Total Emissions (All Data)'
                      : chartFilterEntity !== 'all' && chartFilterCountry !== 'all'
                      ? `Filtered: ${chartFilterEntity} - ${chartFilterCountry}`
                      : chartFilterEntity !== 'all' 
                      ? `Filtered: ${chartFilterEntity}`
                      : `Filtered: ${chartFilterCountry}`}
                    {viewMode === 'monthly' && selectedMonthlyYear && ` (${selectedMonthlyYear})`}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-2xl font-bold text-emerald-900 dark:text-emerald-100'>{formatNumber(chartTotalEmissions)}</p>
                <p className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>tCO2eq</p>
              </div>
            </div>

            <ChartContainer config={{}} className='h-[400px] w-full'>
              <BarChart data={chartData} barCategoryGap='15%'>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey={viewMode === 'yearly' ? 'year' : 'month'} />
                <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {(() => {
                  let filtered = data
                  if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
                  if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)
                  const uniqueEntities = Array.from(new Set(filtered.map(d => d.entity)))
                  return uniqueEntities.map((entity, idx) => {
                    const colorIndex = entities.indexOf(entity)
                    const color = getEntityColor(entity, colorIndex >= 0 ? colorIndex : idx)
                    return (
                      <Bar
                        key={entity}
                        dataKey={entity}
                        stackId='a'
                        fill={color}
                        name={entity}
                        radius={[4, 4, 0, 0]}
                        minPointSize={3}
                      />
                    )
                  })
                })()}
              </BarChart>
            </ChartContainer>

            {chartEntityBreakdown.length > 0 && (
              <div className='mt-4 p-4 rounded-lg border bg-muted/30'>
                <h4 className='text-sm font-semibold mb-3 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                  Emissions Breakdown by Entity
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                  {chartEntityBreakdown.map((item, idx) => {
                    const percentage = chartTotalEmissions > 0 ? (item.value / chartTotalEmissions * 100) : 0
                    const colorIndex = entities.indexOf(item.entity)
                    const color = getEntityColor(item.entity, colorIndex >= 0 ? colorIndex : idx)
                    return (
                      <div key={item.entity} className='p-3 rounded-lg bg-card border hover:shadow-md transition-shadow'>
                        <div className='flex items-start gap-2 mb-2'>
                          <div 
                            className='w-4 h-4 rounded-sm flex-shrink-0 mt-1' 
                            style={{ backgroundColor: color }}
                          />
                          <p className='text-xs font-medium text-muted-foreground line-clamp-2 flex-1'>{item.entity}</p>
                        </div>
                        <p className='text-lg font-bold text-foreground'>{formatNumber(item.value)}</p>
                        <div className='flex items-center justify-between mt-1'>
                          <p className='text-xs text-muted-foreground'>tCO2eq</p>
                          <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <div>
                  <CardTitle>Emissions Data Records</CardTitle>
                  <CardDescription>View all scope two market-based records</CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='icon'><Download className='h-4 w-4' /></Button>
                  <Button variant='default' onClick={() => setIsAddOpen(true)}><Plus className='h-4 w-4 mr-2' /> Add Record</Button>
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                <div className='p-3 rounded-lg border bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20'>
                  <p className='text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1'>Total Emissions</p>
                  <p className='text-xl font-bold text-emerald-800 dark:text-emerald-300'>{formatNumber(statistics.totalEmissions)}</p>
                  <p className='text-xs text-emerald-600'>tCO2eq</p>
                </div>
                <div className='p-3 rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20'>
                  <p className='text-xs font-medium text-amber-700 dark:text-amber-400 mb-1'>Total Energy</p>
                  <p className='text-xl font-bold text-amber-800 dark:text-amber-300'>{formatNumber(statistics.totalEnergyMJ)}</p>
                  <p className='text-xs text-amber-600'>MJ</p>
                </div>
                <div className='p-3 rounded-lg border bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20'>
                  <p className='text-xs font-medium text-purple-700 dark:text-purple-400 mb-1'>Total Purchase</p>
                  <p className='text-xl font-bold text-purple-800 dark:text-purple-300'>{formatNumber(statistics.totalPurchase)}</p>
                  <p className='text-xs text-purple-600'>MWh</p>
                </div>
                <div className='p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20'>
                  <p className='text-xs font-medium text-blue-700 dark:text-blue-400 mb-1'>Total Records</p>
                  <p className='text-xl font-bold text-blue-800 dark:text-blue-300'>{statistics.totalRecords}</p>
                  <p className='text-xs text-blue-600'>entries</p>
                </div>
                <div className='p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20'>
                  <p className='text-xs font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1'>
                    <Leaf className='h-3 w-3' /> Renewable %
                  </p>
                  <p className='text-xl font-bold text-green-800 dark:text-green-300'>{statistics.renewablePercentage.toFixed(1)}%</p>
                  <p className='text-xs text-green-600'>REC/PPA</p>
                </div>
              </div>

              <div className='flex flex-col gap-2 pt-2 border-t'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>Filters:</span>
                </div>
                <div className='flex flex-col sm:flex-row gap-2'>
                  <div className='relative flex-1 sm:w-56'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input placeholder='Search records...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-8' />
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <Select value={filterYear} onValueChange={setFilterYear}>
                      <SelectTrigger className='w-[120px]'><SelectValue placeholder='Year' /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Years</SelectItem>
                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterEntity} onValueChange={setFilterEntity}>
                      <SelectTrigger className='w-[180px]'><SelectValue placeholder='Entity' /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Entities</SelectItem>
                        {entities.map(entity => <SelectItem key={entity} value={entity}>{entity}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterCountry} onValueChange={setFilterCountry}>
                      <SelectTrigger className='w-[140px]'><SelectValue placeholder='Country' /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Countries</SelectItem>
                        {countries.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterInstrument} onValueChange={setFilterInstrument}>
                      <SelectTrigger className='w-[160px]'><SelectValue placeholder='Instrument' /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Instruments</SelectItem>
                        {instruments.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='min-w-[50px]'>No</TableHead>
                    <TableHead className='min-w-[150px]'>Entity</TableHead>
                    <TableHead className='min-w-[150px]'>Facility</TableHead>
                    <TableHead className='min-w-[80px]'>Country</TableHead>
                    <TableHead className='min-w-[100px]'>Type</TableHead>
                    <TableHead className='min-w-[140px]'>Instrument</TableHead>
                    <TableHead className='min-w-[100px]'>EF (kgCO2/MWh)</TableHead>
                    <TableHead className='min-w-[70px]'>Year</TableHead>
                    <TableHead className='min-w-[120px]'>Purchase (MWh)</TableHead>
                    <TableHead className='min-w-[120px]'>Emissions (tCO2eq)</TableHead>
                    <TableHead className='min-w-[120px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                      <TableCell>{row.entity}</TableCell>
                      <TableCell>{row.facility}</TableCell>
                      <TableCell>{row.country}</TableCell>
                      <TableCell>
                        <Badge variant='outline' style={{ borderColor: CLASSIFICATION_COLORS[row.classification] }}>
                          {row.classification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' style={{ 
                          borderColor: INSTRUMENT_COLORS[row.contractual_instrument],
                          backgroundColor: row.contractual_instrument === 'REC' || row.contractual_instrument === 'PPA' ? '#10b98120' : 'transparent'
                        }}>
                          {row.contractual_instrument === 'REC' || row.contractual_instrument === 'PPA' ? <Leaf className='h-3 w-3 mr-1' /> : null}
                          {row.contractual_instrument}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-mono text-sm'>{formatNumber(row.emission_factor)}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{formatNumber(row.total_amount)}</TableCell>
                      <TableCell className='font-bold'>{formatNumber(row.tCO2eq)}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button variant='ghost' size='sm' onClick={() => handleOpenView(row)} title='View'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' onClick={() => handleOpenEdit(row)} title='Edit'>
                            <Pencil className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTableData.length > 0 && (
              <div className='flex items-center justify-between px-2 py-4'>
                <div className='text-sm text-muted-foreground'>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTableData.length)} of {filteredTableData.length} entries
                </div>
                <div className='flex items-center gap-2'>
                  <Button variant='outline' size='sm' onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size='sm' className='w-10' onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  ))}
                  <Button variant='outline' size='sm' onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[900px] overflow-hidden flex flex-col p-0'>
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0'>
                  <Eye className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <span className='line-clamp-1'>Emission Record Details (Market-Based)</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                {viewingRecord && `Record ID: ${viewingRecord.id} | Year: ${viewingRecord.year} | Instrument: ${viewingRecord.contractual_instrument}`}
              </SheetDescription>
            </SheetHeader>
          </div>

          {viewingRecord && (
            <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
                  <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0'></div>
                    Basic Information
                  </h4>
                  <div className='space-y-2 sm:space-y-3'>
                    <div className='flex justify-between items-start gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Entity</span>
                      <span className='text-sm font-medium text-right max-w-[150px] sm:max-w-[200px] line-clamp-2'>{viewingRecord.entity}</span>
                    </div>
                    <div className='flex justify-between items-start gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Facility</span>
                      <span className='text-sm font-medium text-right max-w-[150px] sm:max-w-[200px] line-clamp-2'>{viewingRecord.facility}</span>
                    </div>
                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Country</span>
                      <span className='text-sm font-medium'>{viewingRecord.country}</span>
                    </div>
                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Year</span>
                      <span className='text-sm font-medium'>{viewingRecord.year}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
                  <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-500 flex-shrink-0'></div>
                    Energy Purchase Info
                  </h4>
                  <div className='space-y-2 sm:space-y-3'>
                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Classification</span>
                      <Badge variant='outline' style={{ borderColor: CLASSIFICATION_COLORS[viewingRecord.classification] }}>
                        {viewingRecord.classification}
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Instrument</span>
                      <Badge variant='outline' style={{ 
                        borderColor: INSTRUMENT_COLORS[viewingRecord.contractual_instrument],
                        backgroundColor: viewingRecord.contractual_instrument === 'REC' || viewingRecord.contractual_instrument === 'PPA' ? '#10b98120' : 'transparent'
                      }}>
                        {viewingRecord.contractual_instrument === 'REC' || viewingRecord.contractual_instrument === 'PPA' ? <Leaf className='h-3 w-3 mr-1' /> : null}
                        {viewingRecord.contractual_instrument}
                      </Badge>
                    </div>
                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Emission Factor</span>
                      <span className='text-sm font-mono font-medium'>{formatNumber(viewingRecord.emission_factor)} {viewingRecord.emission_factor_unit}</span>
                    </div>
                    <div className='flex justify-between items-start gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Supplier</span>
                      <span className='text-sm font-medium text-right max-w-[150px] line-clamp-2'>{viewingRecord.supplier || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 flex-shrink-0'></div>
                  Monthly Purchase Data ({viewingRecord.unit})
                </h4>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3'>
                  {[
                    { key: 'january', label: 'Jan' },
                    { key: 'february', label: 'Feb' },
                    { key: 'march', label: 'Mar' },
                    { key: 'april', label: 'Apr' },
                    { key: 'may', label: 'May' },
                    { key: 'june', label: 'Jun' },
                    { key: 'july', label: 'Jul' },
                    { key: 'august', label: 'Aug' },
                    { key: 'september', label: 'Sep' },
                    { key: 'october', label: 'Oct' },
                    { key: 'november', label: 'Nov' },
                    { key: 'december', label: 'Dec' },
                  ].map(month => (
                    <div key={month.key} className='p-2 bg-background rounded border text-center'>
                      <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>{month.label}</p>
                      <p className='text-xs sm:text-sm font-mono font-medium'>{formatNumber((viewingRecord as any)[month.key])}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800'>
                <h4 className='font-semibold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2'>
                  <Calculator className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  Calculated Emissions (Market-Based)
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3'>
                  <div className='p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>Total Purchase</p>
                    <p className='text-sm sm:text-base font-bold font-mono'>{formatNumber(viewingRecord.total_amount)}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MWh</p>
                  </div>
                  <div className='p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>Total Energy</p>
                    <p className='text-sm sm:text-base font-bold font-mono'>{formatNumber(viewingRecord.total_mj)}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MJ</p>
                  </div>
                  <div className='p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg border-2 border-emerald-400 dark:border-emerald-600 text-center'>
                    <p className='text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 mb-1'>GHG Emissions</p>
                    <p className='text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono'>{formatNumber(viewingRecord.tCO2eq)}</p>
                    <p className='text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400'>tCO2eq</p>
                  </div>
                </div>

                <div className='pt-3 border-t border-emerald-200 dark:border-emerald-800'>
                  <p className='text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2'>Individual Gas Emissions (Kg)</p>
                  <div className='grid grid-cols-3 gap-2'>
                    <div className='flex items-center gap-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border'>
                      <div className='w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center'>
                        <span className='text-[10px] font-bold text-red-600 dark:text-red-400'>CO₂</span>
                      </div>
                      <span className='text-xs font-mono font-medium'>{formatNumber(viewingRecord.kgCO2)}</span>
                    </div>
                    <div className='flex items-center gap-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border'>
                      <div className='w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center'>
                        <span className='text-[10px] font-bold text-orange-600 dark:text-orange-400'>CH₄</span>
                      </div>
                      <span className='text-xs font-mono font-medium'>{formatNumber(viewingRecord.kgCH4)}</span>
                    </div>
                    <div className='flex items-center gap-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border'>
                      <div className='w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center'>
                        <span className='text-[10px] font-bold text-yellow-700 dark:text-yellow-400'>N₂O</span>
                      </div>
                      <span className='text-xs font-mono font-medium'>{formatNumber(viewingRecord.kgN2O)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className='border-t bg-muted/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <Button onClick={() => setIsViewOpen(false)} className='w-full sm:w-auto h-10 sm:h-11'>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[900px] overflow-hidden flex flex-col p-0'>
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0'>
                  <Calculator className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <span className='line-clamp-1'>Add New Emission Record (Market-Based)</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                Enter monthly purchase data and market-based specific information
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
            {/* Basic Information */}
            <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
              <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0'></div>
                Basic Information
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Entity *</label>
                  <Select value={formData.entity || ''} onValueChange={(v) => setFormData({...formData, entity: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select entity' />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((b, i) => (
                        <SelectItem key={i} value={b.entity}>{b.entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Facility *</label>
                  <Input 
                    placeholder='Enter facility' 
                    value={formData.facility || ''} 
                    onChange={(e) => setFormData({...formData, facility: e.target.value})} 
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Country *</label>
                  <Select value={formData.country || ''} onValueChange={(v) => setFormData({...formData, country: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select country' />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c, i) => (
                        <SelectItem key={i} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Year *</label>
                  <Select value={String(formData.year || '')} onValueChange={(v) => setFormData({...formData, year: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select year' />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y, i) => (
                        <SelectItem key={i} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Classification</label>
                  <Select value={formData.classification || 'Electricity'} onValueChange={(v) => setFormData({...formData, classification: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Electricity'>Electricity</SelectItem>
                      <SelectItem value='Steam'>Steam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Supplier Name</label>
                  <Input 
                    placeholder='Enter supplier' 
                    value={formData.supplier_name || ''} 
                    onChange={(e) => setFormData({...formData, supplier_name: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Market-Based Configuration */}
            <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800'>
              <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                <Leaf className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                Market-Based Configuration
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Contractual Instrument *</label>
                  <Select 
                    value={formData.contractual_instrument || 'Grid Default'} 
                    onValueChange={(v) => {
                      const ef = getDefaultEmissionFactor(formData.country || '', v)
                      setFormData({...formData, contractual_instrument: v, emission_factor: ef})
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='REC'>REC (Renewable Energy Certificate)</SelectItem>
                      <SelectItem value='PPA'>PPA (Power Purchase Agreement)</SelectItem>
                      <SelectItem value='Green Tariff'>Green Tariff</SelectItem>
                      <SelectItem value='Supplier Disclosure'>Supplier Disclosure</SelectItem>
                      <SelectItem value='Grid Default'>Grid Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs sm:text-sm font-medium'>Emission Factor *</label>
                  <div className='flex gap-2'>
                    <Input 
                      type='number' 
                      step='0.000001'
                      placeholder='0.000000' 
                      value={formData.emission_factor || ''} 
                      onChange={(e) => setFormData({...formData, emission_factor: Number(e.target.value)})} 
                      className='flex-1'
                    />
                    <Badge variant='outline' className='whitespace-nowrap px-2'>
                      kgCO2/MWh
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {formData.contractual_instrument === 'REC' || formData.contractual_instrument === 'PPA' 
                      ? '✓ Renewable energy: 0 emissions' 
                      : `Default: ${getDefaultEmissionFactor(formData.country || '', formData.contractual_instrument || 'Grid Default').toFixed(2)}`}
                  </p>
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <label className='text-xs sm:text-sm font-medium'>Certificate ID (Optional)</label>
                  <Input 
                    placeholder='REC/PPA Certificate ID' 
                    value={formData.certificate_id || ''} 
                    onChange={(e) => setFormData({...formData, certificate_id: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Monthly Purchase Data */}
            <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
              <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-orange-500 flex-shrink-0'></div>
                Monthly Purchase Data (MWh)
              </h4>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
                {['january','february','march','april','may','june','july','august','september','october','november','december'].map(month => (
                  <div key={month} className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium capitalize'>{month}</label>
                    <Input 
                      type='number' 
                      step='0.000001'
                      placeholder='0.00' 
                      value={(formData as any)[month] || ''} 
                      onChange={(e) => setFormData({...formData, [month]: Number(e.target.value)})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Preview */}
            <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                <Calculator className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                Emission Preview (Market-Based)
              </h4>
              {(() => {
                const calc = calculateFromForm(formData)
                return (
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                    <div className='space-y-1'>
                      <div className='text-xs text-muted-foreground'>Total Purchase</div>
                      <div className='text-lg font-bold'>{formatNumber(calc.total_amount)} MWh</div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs text-muted-foreground'>Total Energy</div>
                      <div className='text-lg font-bold'>{formatNumber(calc.total_mj)} MJ</div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs text-muted-foreground'>CO2 Emissions</div>
                      <div className='text-lg font-bold'>{formatNumber(calc.kgCO2)} kg</div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs text-muted-foreground'>Total (tCO2eq)</div>
                      <div className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
                        {formatNumber(calc.tCO2eq)}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          <SheetFooter className='sticky bottom-0 z-10 bg-background border-t px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-row gap-2'>
            <Button variant='outline' onClick={() => setIsAddOpen(false)} className='flex-1'>
              Cancel
            </Button>
            <Button onClick={handleAdd} className='flex-1 bg-emerald-600 hover:bg-emerald-700'>
              Add Record
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[900px] overflow-hidden flex flex-col p-0'>
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0'>
                  <Pencil className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <span className='line-clamp-1'>Edit Emission Record (Market-Based)</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                {editingRecord && `Editing Record ID: ${editingRecord.id} | Year: ${editingRecord.year}`}
              </SheetDescription>
            </SheetHeader>
          </div>

          {editingRecord && (
            <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
              {/* Basic Information */}
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0'></div>
                  Basic Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Entity *</label>
                    <Select value={formData.entity || ''} onValueChange={(v) => setFormData({...formData, entity: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select entity' />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses.map((b, i) => (
                          <SelectItem key={i} value={b.entity}>{b.entity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Facility *</label>
                    <Input 
                      placeholder='Enter facility' 
                      value={formData.facility || ''} 
                      onChange={(e) => setFormData({...formData, facility: e.target.value})} 
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Country *</label>
                    <Select value={formData.country || ''} onValueChange={(v) => setFormData({...formData, country: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select country' />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c, i) => (
                          <SelectItem key={i} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Year *</label>
                    <Select value={String(formData.year || '')} onValueChange={(v) => setFormData({...formData, year: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select year' />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y, i) => (
                          <SelectItem key={i} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Classification</label>
                    <Select value={formData.classification || 'Electricity'} onValueChange={(v) => setFormData({...formData, classification: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Electricity'>Electricity</SelectItem>
                        <SelectItem value='Steam'>Steam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Supplier Name</label>
                    <Input 
                      placeholder='Enter supplier' 
                      value={formData.supplier_name || ''} 
                      onChange={(e) => setFormData({...formData, supplier_name: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Market-Based Configuration */}
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Leaf className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                  Market-Based Configuration
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Contractual Instrument *</label>
                    <Select 
                      value={formData.contractual_instrument || 'Grid Default'} 
                      onValueChange={(v) => {
                        const ef = getDefaultEmissionFactor(formData.country || '', v)
                        setFormData({...formData, contractual_instrument: v, emission_factor: ef})
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='REC'>REC (Renewable Energy Certificate)</SelectItem>
                        <SelectItem value='PPA'>PPA (Power Purchase Agreement)</SelectItem>
                        <SelectItem value='Green Tariff'>Green Tariff</SelectItem>
                        <SelectItem value='Supplier Disclosure'>Supplier Disclosure</SelectItem>
                        <SelectItem value='Grid Default'>Grid Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs sm:text-sm font-medium'>Emission Factor *</label>
                    <div className='flex gap-2'>
                      <Input 
                        type='number' 
                        step='0.000001'
                        placeholder='0.000000' 
                        value={formData.emission_factor || ''} 
                        onChange={(e) => setFormData({...formData, emission_factor: Number(e.target.value)})} 
                        className='flex-1'
                      />
                      <Badge variant='outline' className='whitespace-nowrap px-2'>
                        kgCO2/MWh
                      </Badge>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {formData.contractual_instrument === 'REC' || formData.contractual_instrument === 'PPA' 
                        ? '✓ Renewable energy: 0 emissions' 
                        : `Default: ${getDefaultEmissionFactor(formData.country || '', formData.contractual_instrument || 'Grid Default').toFixed(2)}`}
                    </p>
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <label className='text-xs sm:text-sm font-medium'>Certificate ID (Optional)</label>
                    <Input 
                      placeholder='REC/PPA Certificate ID' 
                      value={formData.certificate_id || ''} 
                      onChange={(e) => setFormData({...formData, certificate_id: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Monthly Purchase Data */}
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-orange-500 flex-shrink-0'></div>
                  Monthly Purchase Data (MWh)
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
                  {['january','february','march','april','may','june','july','august','september','october','november','december'].map(month => (
                    <div key={month} className='space-y-2'>
                      <label className='text-xs sm:text-sm font-medium capitalize'>{month}</label>
                      <Input 
                        type='number' 
                        step='0.000001'
                        placeholder='0.00' 
                        value={(formData as any)[month] || ''} 
                        onChange={(e) => setFormData({...formData, [month]: Number(e.target.value)})} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Preview */}
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
                  <Calculator className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  Emission Preview (Market-Based)
                </h4>
                {(() => {
                  const calc = calculateFromForm(formData)
                  return (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                      <div className='space-y-1'>
                        <div className='text-xs text-muted-foreground'>Total Purchase</div>
                        <div className='text-lg font-bold'>{formatNumber(calc.total_amount)} MWh</div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-xs text-muted-foreground'>Total Energy</div>
                        <div className='text-lg font-bold'>{formatNumber(calc.total_mj)} MJ</div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-xs text-muted-foreground'>CO2 Emissions</div>
                        <div className='text-lg font-bold'>{formatNumber(calc.kgCO2)} kg</div>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-xs text-muted-foreground'>Total (tCO2eq)</div>
                        <div className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
                          {formatNumber(calc.tCO2eq)}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          <SheetFooter className='sticky bottom-0 z-10 bg-background border-t px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-row gap-2'>
            <Button variant='outline' onClick={() => setIsEditOpen(false)} className='flex-1'>
              Cancel
            </Button>
            <Button onClick={handleEditSave} className='flex-1 bg-emerald-600 hover:bg-emerald-700'>
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
