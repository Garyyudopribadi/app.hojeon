// This file was auto-generated from Excel data
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Plus, Search, Download, Filter, TrendingUp, ChevronLeft, ChevronRight, Calculator, X, Eye, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatNumber } from '@/lib/emissionCalculations'

interface GHGScopeTwoLocationData {
  id: string
  no: number
  entity: string
  facility: string
  country: string
  classification: string
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
  currency: string
  supplier: string
  year: number
  total_amount: number
  total_mj: number
  kgCO2: number
  kgCH4: number
  kgN2O: number
  tCO2eq: number
  updated_by?: string | null
  updated_date?: string | null
}
// Format ISO datetime into a nicer localized string with date and time
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

const ENTITY_COLORS: Record<string, string> = {
  'HOJEON LIMITED': '#3b82f6',           // Blue
  // Ensure these entities have distinct, high-contrast colors
  'PT. KAHOINDAH CITRAGARMENT': '#ef4444', // Red (changed from green)
  'PT.KAHOINDAH CITRAGARMENT': '#ef4444',  // Accept no-space variant
  'PT.HOGA REKSA GARMENT': '#06b6d4',     // Cyan (explicit for HOGA)
  'PT. HOGA REKSA GARMENT': '#06b6d4',    // Accept spaced variant
  // New explicit color assignments requested
  'PT.YONGJIN JAVASUKA GARMENT': '#22c55e', // Green
  'PT. YONGJIN JAVASUKA GARMENT': '#22c55e', // Green (variant)
  'PT.HJL INDO NETWORKS': '#f97316', // Orange
  'PT. HJL INDO NETWORKS': '#f97316', // Orange (variant)
  'PT. HCI INDONESIA': '#f59e0b',        // Amber
  '㈜다산': '#8b5cf6',                     // Purple
  '㈜엠파파': '#ec4899',                    // Pink
  'default': '#6b7280'                   // Gray
}

// Generate distinct colors for entities not in predefined list
const EXTENDED_COLORS = [
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Violet
  '#eab308', // Yellow
  '#22c55e', // Green
  '#f43f5e', // Rose
  '#0ea5e9', // Sky
]

const getEntityColor = (entity: string, index?: number): string => {
  if (ENTITY_COLORS[entity]) return ENTITY_COLORS[entity]
  if (index !== undefined) return EXTENDED_COLORS[index % EXTENDED_COLORS.length]
  return ENTITY_COLORS['default']
}

export default function ScopeTwoLocationContent() {
  const { toast } = useToast()
  const [data, setData] = useState<GHGScopeTwoLocationData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [chartFilterEntity, setChartFilterEntity] = useState<string>('all')
  const [chartFilterCountry, setChartFilterCountry] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly')
  const [selectedMonthlyYear, setSelectedMonthlyYear] = useState<string>('')

  // Sheet states for add / edit / view
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GHGScopeTwoLocationData | null>(null)
  const [viewingRecord, setViewingRecord] = useState<GHGScopeTwoLocationData | null>(null)

  const emptyForm: Partial<GHGScopeTwoLocationData> = {
    entity: '', facility: '', country: '', classification: 'Electricity',
    january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
    july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
    unit: 'MWh', currency: '', supplier: '', year: new Date().getFullYear(),
    total_amount: 0, total_mj: 0, kgCO2: 0, kgCH4: 0, kgN2O: 0, tCO2eq: 0,
    updated_by: '',
    updated_date: null
  }

  const [formData, setFormData] = useState<Partial<GHGScopeTwoLocationData>>(emptyForm)
  const [businesses, setBusinesses] = useState<{entity: string, facility: string, country: string}[]>([])
  const [suppliersList, setSuppliersList] = useState<string[]>([])

  const loadData = async () => {
    const { data: rows, error } = await supabase
      .from('ghg_scopetwo_location')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      toast({ title: 'Load error', description: error.message })
      return
    }

    let mapped: GHGScopeTwoLocationData[] = (rows || []).map((r: any, idx: number) => ({
      id: String(r.id ?? idx),
      no: idx + 1,
      entity: r.entity || '',
      facility: r.facility || '',
      country: r.country || '',
      classification: r.classification || 'Electricity',
      january: Number(r.january) || 0,
      february: Number(r.february) || 0,
      march: Number(r.march) || 0,
      april: Number(r.april) || 0,
      may: Number(r.may) || 0,
      june: Number(r.june) || 0,
      july: Number(r.july) || 0,
      august: Number(r.august) || 0,
      september: Number(r.september) || 0,
      october: Number(r.october) || 0,
      november: Number(r.november) || 0,
      december: Number(r.december) || 0,
      unit: r.unit || 'MWh',
      currency: r.currency_unit || r.currency || '',
      supplier: r.supplier_name || r.supplier || '',
      year: Number(r.date_collection) || Number(r.year) || new Date().getFullYear(),
      total_amount: Number(r.total_purchase_amount) || Number(r.total_amount) || 0,
      total_mj: Number(r.total_purchase_mj) || Number(r.total_mj) || 0,
      kgCO2: Number(r.kgco2 ?? r.kgCO2) || 0,
      kgCH4: Number(r.kgch4 ?? r.kgCH4) || 0,
      kgN2O: Number(r.kgn2o ?? r.kgN2O) || 0,
      tCO2eq: Number(r.tco2eq ?? r.tCO2eq) || 0
      ,
      updated_by: r.updated_by ?? r.updatedBy ?? null,
      updated_date: r.updated_date ?? r.updatedDate ?? null
    }))

    // If some rows have updated_by that looks like an email, resolve to profiles.nickname
    try {
      const emails = Array.from(new Set(mapped.map(m => (m.updated_by || '')).filter(s => s.includes('@'))))
      if (emails.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email,nickname')
          .in('email', emails)

        const nickByEmail: Record<string, string> = {}
        ;(profiles || []).forEach((p: any) => { if (p?.email && p?.nickname) nickByEmail[p.email] = p.nickname })

        // For any emails not found above (possibly due to case mismatch), try individual ilike lookup
        const missing = emails.filter(e => !nickByEmail[e])
        for (const me of missing) {
          try {
            const { data: p } = await supabase
              .from('profiles')
              .select('email,nickname')
              .ilike('email', me)
              .maybeSingle()
            if (p && p.email && p.nickname) nickByEmail[p.email] = p.nickname
          } catch (e) {
            // ignore individual lookup errors
          }
        }

        mapped = mapped.map(m => {
          const ub = m.updated_by || ''
          if (ub.includes('@')) {
            // prefer resolved nickname; if not resolved, show metadata or System
            const resolved = nickByEmail[ub] || nickByEmail[ub.toLowerCase()] || ''
            if (resolved) return { ...m, updated_by: resolved }
            // do not leave raw email if no nickname — set to 'System' to avoid exposing emails
            return { ...m, updated_by: 'System' }
          }
          return m
        })
      }
    } catch (e) {
      // ignore profile resolution errors
    }

    setData(mapped)
  }

  const loadLookups = async () => {
    try {
      const { data: bizRows } = await supabase
        .from('general_information_business')
        .select('entity,facility,country')

      if (bizRows) {
        const mapped = (bizRows as any[]).map(r => ({ entity: r.entity || '', facility: r.facility || '', country: r.country || '' }))
        setBusinesses(mapped)
      }

      const { data: supRows } = await supabase
        .from('ghg_scopetwo_location')
        .select('supplier_name')

      if (supRows) {
        const names = Array.from(new Set((supRows as any[]).map(r => r.supplier_name).filter(Boolean)))
        setSuppliersList(names)
      }
    } catch (e) {
      // ignore lookup errors
    }
  }

  useEffect(() => { loadData(); loadLookups() }, [])

  // When Add sheet opens, pre-fill Updated By with the logged-in user's nickname (fallback to email)
  useEffect(() => {
    if (!isAddOpen) return
    ;(async () => {
      try {
        const name = await getUpdaterName()
        setFormData(prev => ({ ...(prev || {}), updated_by: name, updated_date: new Date().toISOString() }))
      } catch (e) {
        // ignore
      }
    })()
  }, [isAddOpen])

  // Helper to resolve the updater name from profiles.nickname (lookup by user id)
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
    // Do NOT auto-add the current year. Only include years present in data.
    // This ensures years like 2025 won't appear if there's no data for them.
    const sortedYears = Array.from(yearSet).sort()
    // Set default monthly year to latest year if not set
    if (sortedYears.length > 0 && !selectedMonthlyYear) {
      setSelectedMonthlyYear(sortedYears[sortedYears.length - 1])
    }
    return sortedYears
  }, [data])

  const entities = useMemo(() => {
    const entitySet = new Set(data.map(item => item.entity))
    return Array.from(entitySet).sort()
  }, [data])

  const countries = useMemo(() => {
    const countrySet = new Set(data.map(item => item.country))
    return Array.from(countrySet).sort()
  }, [data])

  // Helper function for country emission factor (must be defined before useMemo)
  // Based on IPCC 2006 Guidelines and country-specific grid emission factors
  const countryEmissionFactor = (country: string) => {
    if (!country) return 0
    const c = country.toLowerCase()
    if (c.includes('korea')) return 465.29  // Korea Power Exchange (2022-2024 average)
    if (c.includes('indonesia') || c.includes('indon')) return 770.78  // PLN (Indonesia)
    return 500  // Default fallback
  }

  const statistics = useMemo(() => {
    let filtered = data
    if (filterYear !== 'all') filtered = filtered.filter(item => item.year.toString() === filterYear)
    if (filterEntity !== 'all') filtered = filtered.filter(item => item.entity === filterEntity)
    if (filterCountry !== 'all') filtered = filtered.filter(item => item.country === filterCountry)

    return {
      totalEmissions: filtered.reduce((sum, item) => sum + item.tCO2eq, 0),
      totalEnergyMJ: filtered.reduce((sum, item) => sum + item.total_mj, 0),
      totalPurchase: filtered.reduce((sum, item) => sum + item.total_amount, 0),
      totalRecords: filtered.length
    }
  }, [data, filterYear, filterEntity, filterCountry])

  const chartData = useMemo(() => {
    let filtered = data
    if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
    if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)

    if (viewMode === 'yearly') {
      // Group by year and entity
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
      // Monthly view - show all 12 months for each entity for selected year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
      
      // Filter by selected year for monthly view
      const yearFiltered = selectedMonthlyYear ? filtered.filter(d => d.year.toString() === selectedMonthlyYear) : filtered
      
      return months.map((month, idx) => {
        const monthData: any = { month }
        const uniqueEntities = Array.from(new Set(yearFiltered.map(d => d.entity)))
        uniqueEntities.forEach(entity => {
          const entityRecords = yearFiltered.filter(d => d.entity === entity)
          const monthKey = monthKeys[idx] as keyof GHGScopeTwoLocationData
          const monthlyTotal = entityRecords.reduce((sum, record) => {
            const val = record[monthKey]
            if (typeof val === 'number') {
              // Convert MWh to tCO2eq for this month
              return sum + (val * countryEmissionFactor(record.country) / 1000)
            }
            return sum
          }, 0)
          monthData[entity] = monthlyTotal
        })
        return monthData
      })
    }
  }, [data, years, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  // Calculate total tCO2eq for filtered chart data
  const chartTotalEmissions = useMemo(() => {
    let filtered = data
    if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
    if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)
    if (viewMode === 'monthly' && selectedMonthlyYear) {
      filtered = filtered.filter(item => item.year.toString() === selectedMonthlyYear)
    }
    return filtered.reduce((sum, item) => sum + item.tCO2eq, 0)
  }, [data, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  // Calculate breakdown by entity for filtered chart data
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
    
    // Sort by value descending
    return Object.entries(breakdown)
      .map(([entity, value]) => ({ entity, value }))
      .sort((a, b) => b.value - a.value)
  }, [data, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

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
    return filtered
  }, [data, searchTerm, filterYear, filterEntity, filterCountry])

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTableData, currentPage])

  const calculateFromForm = (f: Partial<GHGScopeTwoLocationData>) => {
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
    const total = months.reduce((s, m) => s + (Number((f as any)[m]) || 0), 0)
    
    // Step 1: Convert MWh to MJ (1 MWh = 3,600 MJ)
    const mj = total * 3600
    
    // Step 2: Calculate kgCO2 based on country grid emission factor
    const kgCO2 = total * (countryEmissionFactor(f.country || ''))
    
    // Step 3: Calculate CH4 and N2O from total energy (MJ)
    // Based on IPCC 2006 grid electricity emission factors
    const country = (f.country || '').toLowerCase()
    let CH4_EF_PER_MJ = 0.00000265  // Korea default: kgCH4/MJ
    let N2O_EF_PER_MJ = 0.00000143  // Korea default: kgN2O/MJ
    
    if (country.includes('indonesia') || country.includes('indon')) {
      CH4_EF_PER_MJ = 0.0000106   // Indonesia: kgCH4/MJ
      N2O_EF_PER_MJ = 0.00000359  // Indonesia: kgN2O/MJ
    }
    
    const kgCH4 = mj * CH4_EF_PER_MJ
    const kgN2O = mj * N2O_EF_PER_MJ
    
    // Step 4: Calculate total CO2 equivalent using GWP (AR6)
    // GWP: CO2=1, CH4=27, N2O=273
    const tCO2eq = (kgCO2 * 1 + kgCH4 * 27 + kgN2O * 273) / 1000
    
    return { total_amount: total, total_mj: mj, kgCO2, kgCH4, kgN2O, tCO2eq }
  }

  const handleAdd = async () => {
    const calc = calculateFromForm(formData)
    // resolve updater name from profiles.nickname (fallbacks handled inside)
    const updaterName = await getUpdaterName()

    const payload: any = {
      entity: formData.entity || '',
      facility: formData.facility || '',
      country: formData.country || '',
      classification: formData.classification || 'Electricity',
      january: Number(formData.january) || 0,
      february: Number(formData.february) || 0,
      march: Number(formData.march) || 0,
      april: Number(formData.april) || 0,
      may: Number(formData.may) || 0,
      june: Number(formData.june) || 0,
      july: Number(formData.july) || 0,
      august: Number(formData.august) || 0,
      september: Number(formData.september) || 0,
      october: Number(formData.october) || 0,
      november: Number(formData.november) || 0,
      december: Number(formData.december) || 0,
      unit: formData.unit || 'MWh',
      currency_unit: formData.currency || '',
      supplier_name: formData.supplier || '',
      date_collection: String(formData.year || new Date().getFullYear()),
      total_purchase_amount: calc.total_amount,
      total_purchase_mj: calc.total_mj,
      kgco2: calc.kgCO2,
      kgch4: calc.kgCH4,
      kgn2o: calc.kgN2O,
      tco2eq: calc.tCO2eq,
      updated_by: updaterName,
      updated_date: new Date().toISOString()
    }

    const { data: inserted, error } = await supabase
      .from('ghg_scopetwo_location')
      .insert(payload)
      .select()
      .single()

    if (error) {
      toast({ title: 'Insert error', description: error.message })
      return
    }

    await loadData()
    setIsAddOpen(false)
    setFormData(emptyForm)
    toast({ title: 'Record added', description: 'Record saved to database' })
  }

  const handleEditSave = async () => {
    if (!editingRecord) return
    const calc = calculateFromForm(formData)
    // resolve updater name from profiles.nickname (fallbacks handled inside)
    const updaterNameEdit = await getUpdaterName()

    const payload: any = {
      entity: formData.entity || editingRecord.entity,
      facility: formData.facility || editingRecord.facility,
      country: formData.country || editingRecord.country,
      classification: formData.classification || editingRecord.classification,
      january: Number(formData.january) || editingRecord.january,
      february: Number(formData.february) || editingRecord.february,
      march: Number(formData.march) || editingRecord.march,
      april: Number(formData.april) || editingRecord.april,
      may: Number(formData.may) || editingRecord.may,
      june: Number(formData.june) || editingRecord.june,
      july: Number(formData.july) || editingRecord.july,
      august: Number(formData.august) || editingRecord.august,
      september: Number(formData.september) || editingRecord.september,
      october: Number(formData.october) || editingRecord.october,
      november: Number(formData.november) || editingRecord.november,
      december: Number(formData.december) || editingRecord.december,
      unit: formData.unit || editingRecord.unit,
      currency_unit: formData.currency || editingRecord.currency,
      supplier_name: formData.supplier || editingRecord.supplier,
      date_collection: String(formData.year || editingRecord.year),
      total_purchase_amount: calc.total_amount,
      total_purchase_mj: calc.total_mj,
      kgco2: calc.kgCO2,
      kgch4: calc.kgCH4,
      kgn2o: calc.kgN2O,
      tco2eq: calc.tCO2eq,
      updated_by: updaterNameEdit,
      updated_date: new Date().toISOString()
    }

    const { data: updated, error } = await supabase
      .from('ghg_scopetwo_location')
      .update(payload)
      .eq('id', Number(editingRecord.id))
      .select()
      .single()

    if (error) {
      toast({ title: 'Update error', description: error.message })
      return
    }

    await loadData()
    setIsEditOpen(false)
    setEditingRecord(null)
    setFormData(emptyForm)
    toast({ title: 'Record updated', description: 'Record saved to database' })
  }

  const handleOpenEdit = (row: GHGScopeTwoLocationData) => {
    setEditingRecord(row)
    setFormData(row)
    setIsEditOpen(true)
  }

  const handleOpenView = (row: GHGScopeTwoLocationData) => {
    setViewingRecord(row)
    setIsViewOpen(true)
  }

  return (
    <>
      <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>Scope Two GHG Emissions - Location Based</h1>
        <p className='text-sm md:text-base text-muted-foreground'>Track and analyze electricity & steam purchase emissions</p>
      </div>

      <Card className='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Calculator className='h-5 w-5' />
            Scope 2 Location-Based Calculation Method
          </CardTitle>
          <CardDescription>How emissions are calculated from electricity & steam purchases</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h4 className='font-semibold text-sm text-blue-900 dark:text-blue-300'>Input Data:</h4>
              <ul className='text-xs space-y-1.5 text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-600 mt-0.5'>•</span>
                  <span>Monthly electricity/steam purchase (MWh)</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-600 mt-0.5'>•</span>
                  <span><strong>Total Purchase</strong> = Sum of all 12 months</span>
                </li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h4 className='font-semibold text-sm text-cyan-900 dark:text-cyan-300'>Auto Calculation:</h4>
              <ul className='text-xs space-y-1.5 text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-cyan-600 mt-0.5'>→</span>
                  <span><strong>Total Energy (MJ)</strong> = Purchase × 3,600</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-cyan-600 mt-0.5'>→</span>
                  <span><strong>tCO2eq</strong> - Total CO2 equivalent emissions</span>
                </li>
              </ul>
            </div>
          </div>
          <div className='p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border'>
            <p className='text-xs text-muted-foreground'>
              <strong className='text-blue-700 dark:text-blue-400'>Note:</strong> Location-based uses grid average emission factors (Korea ~465 kgCO2/MWh, Indonesia ~770 kgCO2/MWh).
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
              <CardDescription>Location-based emissions from electricity & steam purchases</CardDescription>
            </div>
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
          {/* Display total emissions based on active filters */}
          <div className='mb-4 flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0'>
                <TrendingUp className='h-4 w-4 text-white' />
              </div>
              <div>
                <p className='text-xs font-medium text-blue-700 dark:text-blue-300'>
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
              <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>{formatNumber(chartTotalEmissions)}</p>
              <p className='text-xs font-medium text-blue-600 dark:text-blue-400'>tCO2eq</p>
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

          {/* Entity Breakdown */}
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
                        <p className='text-xs font-semibold text-blue-600 dark:text-blue-400'>{percentage.toFixed(1)}%</p>
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
                <CardDescription>View all scope two location-based records</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' size='icon'><Download className='h-4 w-4' /></Button>
                <Button variant='default' onClick={() => setIsAddOpen(true)}><Plus className='h-4 w-4 mr-2' /> Add Record</Button>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              <div className='p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20'>
                <p className='text-xs font-medium text-green-700 dark:text-green-400 mb-1'>Total Emissions</p>
                <p className='text-xl font-bold text-green-800 dark:text-green-300'>{formatNumber(statistics.totalEmissions)}</p>
                <p className='text-xs text-green-600'>tCO2eq</p>
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
                  <TableHead className='min-w-[70px]'>Year</TableHead>
                  <TableHead className='min-w-[120px]'>Purchase (MWh)</TableHead>
                  <TableHead className='min-w-[120px]'>Emissions (tCO2eq)</TableHead>
                  <TableHead className='min-w-[140px]'>Updated By</TableHead>
                  <TableHead className='min-w-[160px]'>Updated At</TableHead>
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
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{formatNumber(row.total_amount)}</TableCell>
                    <TableCell className='font-bold'>{formatNumber(row.tCO2eq)}</TableCell>
                    <TableCell>{row.updated_by || 'N/A'}</TableCell>
                    <TableCell>{formatDateTime(row.updated_date)}</TableCell>
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
      {/* Add / Edit / View Sheets */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[1200px] overflow-hidden flex flex-col p-0'>
          {/* Fixed Header */}
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Plus className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                </div>
                <span className='line-clamp-1'>Add Scope 2 - Location Record</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                Enter monthly electricity/steam purchase data. Emissions will be calculated automatically.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
            {/* Section 1: Basic Information */}
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>Basic Information</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Entity *</Label>
                  <Select value={formData.entity || ''} onValueChange={(v) => {
                    const value = v === '__none' ? '' : v
                    const biz = businesses.find(b => b.entity === value)
                    setFormData({...formData, entity: value, facility: biz?.facility || formData.facility || '', country: biz?.country || formData.country || ''})
                  }}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select entity' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none'>-- Select --</SelectItem>
                      {Array.from(new Set(businesses.map(b => b.entity))).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      {entities.filter(e => !businesses.find(b => b.entity === e)).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Facility *</Label>
                  <Select value={formData.facility || ''} onValueChange={(v) => setFormData({...formData, facility: v === '__none' ? '' : v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select facility' /></SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(businesses.filter(b => b.entity === formData.entity).map(b => b.facility))).length === 0 && (
                        <SelectItem value='__none'>-- Select facility --</SelectItem>
                      )}
                      {Array.from(new Set(businesses.filter(b => b.entity === formData.entity).map(b => b.facility))).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      {(!businesses || businesses.length === 0) && entities.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Country *</Label>
                  <Input value={formData.country || ''} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Year</Label>
                  <Input value={new Date().getFullYear().toString()} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
              </div>
            </div>

            {/* Section 2: Energy Purchase Information */}
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>Energy Purchase Information</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Classification *</Label>
                  <Select value={formData.classification as string} onValueChange={(v) => setFormData({...formData, classification: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Electricity'>Electricity</SelectItem>
                      <SelectItem value='Steam'>Steam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Unit</Label>
                  <Input value={formData.unit || 'MWh'} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Currency (Auto)</Label>
                  <Select value={formData.currency || (formData.country?.toLowerCase().includes('korea') ? 'KRW' : 'IDR')} onValueChange={(v) => setFormData({...formData, currency: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Auto-selected' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='KRW'>KRW</SelectItem>
                      <SelectItem value='IDR'>IDR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Supplier</Label>
                  <Select value={formData.supplier || ''} onValueChange={(v) => setFormData({...formData, supplier: v === '__none' ? '' : v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select supplier' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none'>-- Select --</SelectItem>
                      {suppliersList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Monthly Purchase Data */}
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-base sm:text-lg font-semibold text-foreground'>Monthly Purchase Data</h3>
                  <p className='text-xs sm:text-sm text-muted-foreground'>Enter consumption for each month ({formData.unit || 'MWh'})</p>
                </div>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3'>
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
                  <div key={month.key} className='space-y-1 sm:space-y-1.5'>
                    <Label className='text-[10px] sm:text-xs font-medium text-center block text-muted-foreground'>{month.label}</Label>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      value={String((formData as any)[month.key] ?? '')}
                      onChange={(e) => setFormData({...formData, [month.key]: Number(e.target.value)})}
                      className='text-xs sm:text-sm h-8 sm:h-9 md:h-10 text-center font-mono'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Calculation Preview */}
            {formData.entity && formData.country && (
              <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm animate-in fade-in duration-500'>
                <div className='flex items-center justify-between flex-wrap gap-2'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0'>
                      <Calculator className='h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-xs sm:text-sm text-green-800 dark:text-green-200'>Calculated Emissions</h4>
                      <p className='text-[10px] sm:text-xs text-green-600 dark:text-green-400'>Location-based (Grid Average)</p>
                    </div>
                  </div>
                  <Badge variant='secondary' className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0'>
                    Live Preview
                  </Badge>
                </div>
                <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3'>
                  <div className='p-2 sm:p-2.5 md:p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1'>Total Purchase</p>
                    <p className='text-sm sm:text-base md:text-lg font-bold font-mono'>{calculateFromForm(formData).total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MWh</p>
                  </div>
                  <div className='p-2 sm:p-2.5 md:p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1'>Total Energy</p>
                    <p className='text-sm sm:text-base md:text-lg font-bold font-mono'>{calculateFromForm(formData).total_mj.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MJ</p>
                  </div>
                  <div className='p-2 sm:p-2.5 md:p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center'>
                    <p className='text-[10px] sm:text-xs text-green-700 dark:text-green-300 mb-0.5 sm:mb-1'>GHG Emissions</p>
                    <p className='text-sm sm:text-base md:text-lg font-bold text-green-700 dark:text-green-400 font-mono'>{calculateFromForm(formData).tCO2eq.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className='text-[10px] sm:text-xs text-green-600 dark:text-green-400'>tCO2eq</p>
                  </div>
                </div>
                <div className='pt-3 border-t border-green-200 dark:border-green-800'>
                  <p className='text-xs font-medium text-green-700 dark:text-green-300 mb-2'>Individual Gas Emissions (Kg)</p>
                  <div className='grid grid-cols-3 gap-2'>
                    <div className='flex items-center gap-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border'>
                      <div className='w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center'>
                        <span className='text-[10px] font-bold text-red-600 dark:text-red-400'>CO₂</span>
                      </div>
                      <span className='text-xs font-mono font-medium'>{formatNumber(calculateFromForm(formData).kgCO2)}</span>
                    </div>
                    <div className='flex items-center gap-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border'>
                      <div className='w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center'>
                        <span className='text-[10px] font-bold text-orange-600 dark:text-orange-400'>CH₄</span>
                      </div>
                      <span className='text-xs font-mono font-medium'>{formatNumber(calculateFromForm(formData).kgCH4)}</span>
                    </div>
                    <div className='flex items-center gap-2 p-2 bg-white/60 dark:bg-gray-900/60 rounded border'>
                      <div className='w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center'>
                        <span className='text-[10px] font-bold text-yellow-700 dark:text-yellow-400'>N₂O</span>
                      </div>
                      <span className='text-xs font-mono font-medium'>{formatNumber(calculateFromForm(formData).kgN2O)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className='flex items-center justify-between text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg mb-3'>
            <span>Created by: {formData.updated_by || 'System'}</span>
            <span>Created at: {formatDateTime(formData.updated_date)}</span>
          </div>

          {/* Fixed Footer */}
          <SheetFooter className='flex flex-col sm:flex-row gap-2 sm:gap-3 border-t bg-muted/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto'>
              <Button variant='outline' onClick={() => { setIsAddOpen(false); setFormData(emptyForm) }} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
                <X className='mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4' />
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!formData.entity || !formData.facility} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
                <Plus className='mr-2 h-4 w-4' />
                Add Record
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[1200px] overflow-hidden flex flex-col p-0'>
          {/* Fixed Header */}
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                  <Pencil className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <span className='line-clamp-1'>Edit Emission Record</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                {editingRecord && `Record ID: ${editingRecord.id} | Modify data below. Emissions will be recalculated automatically.`}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
            {/* Section 1: Basic Information */}
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>Basic Information</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Entity *</Label>
                  <Select value={formData.entity || ''} onValueChange={(v) => {
                    const value = v === '__none' ? '' : v
                    const biz = businesses.find(b => b.entity === value)
                    setFormData({...formData, entity: value, facility: biz?.facility || formData.facility || '', country: biz?.country || formData.country || ''})
                  }}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select entity' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none'>-- Select --</SelectItem>
                      {Array.from(new Set(businesses.map(b => b.entity))).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      {entities.filter(e => !businesses.find(b => b.entity === e)).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Facility *</Label>
                  <Select value={formData.facility || ''} onValueChange={(v) => setFormData({...formData, facility: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select facility' /></SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(businesses.filter(b => b.entity === formData.entity).map(b => b.facility))).length === 0 && (
                        <SelectItem value='__none'>-- Select facility --</SelectItem>
                      )}
                      {Array.from(new Set(businesses.filter(b => b.entity === formData.entity).map(b => b.facility))).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      {(!businesses || businesses.length === 0) && entities.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Country *</Label>
                  <Input value={formData.country || ''} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Year *</Label>
                  <Select value={(formData.year || new Date().getFullYear()).toString()} onValueChange={(v) => setFormData({...formData, year: Number(v)})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Energy Purchase Information */}
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>Energy Purchase Information</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Classification *</Label>
                  <Select value={formData.classification as string} onValueChange={(v) => setFormData({...formData, classification: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Electricity'>Electricity</SelectItem>
                      <SelectItem value='Steam'>Steam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Unit</Label>
                  <Input value={formData.unit || 'MWh'} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Currency (Auto)</Label>
                  <Select value={formData.currency || (formData.country?.toLowerCase().includes('korea') ? 'KRW' : 'IDR')} onValueChange={(v) => setFormData({...formData, currency: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Auto-selected' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='KRW'>KRW</SelectItem>
                      <SelectItem value='IDR'>IDR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-24 flex-shrink-0'>Supplier</Label>
                  <Select value={formData.supplier || ''} onValueChange={(v) => setFormData({...formData, supplier: v === '__none' ? '' : v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select supplier' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none'>-- Select --</SelectItem>
                      {suppliersList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Monthly Purchase Data */}
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-base sm:text-lg font-semibold text-foreground'>Monthly Purchase Data</h3>
                  <p className='text-xs sm:text-sm text-muted-foreground'>Modify consumption for each month ({formData.unit || 'MWh'})</p>
                </div>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3'>
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
                  <div key={month.key} className='space-y-1 sm:space-y-1.5'>
                    <Label className='text-[10px] sm:text-xs font-medium text-center block text-muted-foreground'>{month.label}</Label>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      value={String((formData as any)[month.key] ?? '')}
                      onChange={(e) => setFormData({...formData, [month.key]: Number(e.target.value)})}
                      className='text-xs sm:text-sm h-8 sm:h-9 md:h-10 text-center font-mono'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Calculation Preview */}
            {formData.entity && formData.country && (
              <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0'>
                    <Calculator className='h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400' />
                  </div>
                  <h4 className='font-semibold text-xs sm:text-sm text-green-800 dark:text-green-200'>Updated Emissions Preview</h4>
                </div>
                <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3'>
                  <div className='p-2 sm:p-2.5 md:p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1'>Total Purchase</p>
                    <p className='text-sm sm:text-base md:text-lg font-bold font-mono'>{calculateFromForm(formData).total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MWh</p>
                  </div>
                  <div className='p-2 sm:p-2.5 md:p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1'>Total Energy</p>
                    <p className='text-sm sm:text-base md:text-lg font-bold font-mono'>{calculateFromForm(formData).total_mj.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MJ</p>
                  </div>
                  <div className='p-2 sm:p-2.5 md:p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center'>
                    <p className='text-[10px] sm:text-xs text-green-700 dark:text-green-300 mb-0.5 sm:mb-1'>GHG Emissions</p>
                    <p className='text-sm sm:text-base md:text-lg font-bold text-green-700 dark:text-green-400 font-mono'>{calculateFromForm(formData).tCO2eq.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className='text-[10px] sm:text-xs text-green-600 dark:text-green-400'>tCO2eq</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {/* Meta Info */}
          <div className='flex items-center justify-between text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg mb-3'>
            <span>Updated by: {editingRecord?.updated_by || 'N/A'}</span>
            <span>Last updated: {formatDateTime(editingRecord?.updated_date || null)}</span>
          </div>

          <SheetFooter className='flex flex-col sm:flex-row gap-2 sm:gap-3 border-t bg-muted/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto'>
              <Button variant='outline' onClick={() => { setIsEditOpen(false); setEditingRecord(null); setFormData(emptyForm) }} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
                <X className='mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4' />
                Cancel
              </Button>
              <Button onClick={handleEditSave} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
                <Pencil className='mr-2 h-4 w-4' />
                Save Changes
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[900px] overflow-hidden flex flex-col p-0'>
          {/* Fixed Header */}
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0'>
                  <Eye className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <span className='line-clamp-1'>Emission Record Details</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                {viewingRecord && `Record ID: ${viewingRecord.id} | Year: ${viewingRecord.year}`}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          {viewingRecord && (
            <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
              {/* Basic Info Section */}
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
                      <span className='text-xs sm:text-sm text-muted-foreground'>Unit</span>
                      <span className='text-sm font-medium'>{viewingRecord.unit}</span>
                    </div>
                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Currency</span>
                      <span className='text-sm font-medium'>{viewingRecord.currency || '-'}</span>
                    </div>
                    <div className='flex justify-between items-start gap-2'>
                      <span className='text-xs sm:text-sm text-muted-foreground'>Supplier</span>
                      <span className='text-sm font-medium text-right max-w-[150px] line-clamp-2'>{viewingRecord.supplier || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Data Section */}
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

              {/* Calculated Results Section */}
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800'>
                <h4 className='font-semibold text-xs sm:text-sm text-green-800 dark:text-green-200 flex items-center gap-2'>
                  <Calculator className='h-4 w-4 text-green-600 dark:text-green-400' />
                  Calculated Emissions
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
                  <div className='p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center'>
                    <p className='text-[10px] sm:text-xs text-green-700 dark:text-green-300 mb-1'>GHG Emissions</p>
                    <p className='text-sm sm:text-base font-bold text-green-700 dark:text-green-400 font-mono'>{formatNumber(viewingRecord.tCO2eq)}</p>
                    <p className='text-[10px] sm:text-xs text-green-600 dark:text-green-400'>tCO2eq</p>
                  </div>
                </div>

                {/* Individual Gas Breakdown */}
                <div className='pt-3 border-t border-green-200 dark:border-green-800'>
                  <p className='text-xs font-medium text-green-700 dark:text-green-300 mb-2'>Individual Gas Emissions (Kg)</p>
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

          {/* Meta Info */}
          <div className='flex items-center justify-between text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg mb-3'>
            <span>Updated by: {viewingRecord?.updated_by || 'N/A'}</span>
            <span>Last updated: {formatDateTime(viewingRecord?.updated_date || null)}</span>
          </div>

          {/* Fixed Footer */}
          <SheetFooter className='border-t bg-muted/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <Button onClick={() => setIsViewOpen(false)} className='w-full sm:w-auto h-10 sm:h-11'>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
