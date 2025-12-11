// This file was auto-generated from Excel data
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Plus, Search, Download, Filter, TrendingUp, ChevronLeft, ChevronRight, Calculator, X, Eye, Pencil, Trash2 } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { formatNumber, formatDateTime, formatCurrency } from '@/lib/emissionCalculations'

interface GHGScopeTwoMarketData {
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
  updated_by: string
  updated_date: string | null
  created_at: Date
  updated_at: Date
}

interface GHGScopeTwoRenewableEnergy {
  id: string
  created_at: string
  entity: string
  facility: string
  country?: string // Optional for form use
  year: number
  classification: string
  // Months and energy values may be string while editing (e.g., '152,6216'), so accept number|string
  total_energy_used: number | string
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
  unit: string
  total_purchase: number | string
  currency: string
  supplier_name: string
  distinction: string
  energy_source: string
  contract_duration: string
  date_collection: string
  certificate_availability: boolean
  contract_information: string
  updated_by: string
  updated_date: string | null
  updated_at: string
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  'Electricity': '#3b82f6',
  'Steam': '#ef4444'
}

// Parse numbers entered in local formats (e.g. "152,6216" or "1.234,56")
function parseLocaleNumber(v: any): number {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return v
  let s = String(v).trim()
  if (s === '') return 0
  // remove spaces
  s = s.replace(/\s+/g, '')
  const hasDot = s.indexOf('.') !== -1
  const hasComma = s.indexOf(',') !== -1
  if (hasComma && hasDot) {
    // both present -> assume dot is thousand separator and comma is decimal
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    // comma as decimal separator
    s = s.replace(',', '.')
  } else if (hasDot) {
    // only dot present: ambiguous. Heuristics:
    // - if more than one dot, treat dots as thousand separators and remove them
    // - if single dot and exactly 3 digits after dot, treat dot as thousand separator (e.g. 6.000 -> 6000)
    // - otherwise, treat dot as decimal separator
    const dotCount = (s.match(/\./g) || []).length
    if (dotCount > 1) {
      s = s.replace(/\./g, '')
    } else {
      const parts = s.split('.')
      if (parts.length === 2 && parts[1].length === 3) {
        // likely thousand separator
        s = parts.join('')
      } else {
        // treat as decimal
        // leave the dot as decimal separator
      }
    }
  }
  // strip any characters except digits, dot, minus
  s = s.replace(/[^0-9.-]/g, '')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

// Format number for display in locale: use comma as decimal separator and dots as thousand separators
function formatLocaleDisplay(num: any, decimals = 4): string {
  if (num == null || num === '') return ''
  const n = typeof num === 'number' ? num : Number(num)
  if (isNaN(n)) return ''
  // Format with thousand separators using dots and decimal separator as comma
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
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

// Render a small flag icon (Indonesia, South Korea) based on country text
function CountryFlag({ country, size = 16, showLabel = false }: { country?: string | null, size?: number, showLabel?: boolean }) {
  const c = (country || '').toLowerCase()
  const title = country || ''
  const style = { width: size, height: size }

  if (c.includes('indonesia') || c.includes('indon')) {
    // Indonesia flag: red over white
    return (
      <span title={title} className='inline-flex items-center'>
        <span className='rounded-sm overflow-hidden' style={style}>
          <svg viewBox='0 0 4 3' xmlns='http://www.w3.org/2000/svg' style={{ width: size, height: size }}>
            <rect width='4' height='1.5' y='0' fill='#e31b23' />
            <rect width='4' height='1.5' y='1.5' fill='#ffffff' />
          </svg>
        </span>
        {showLabel && <span className='ml-2 text-sm'>{country}</span>}
      </span>
    )
  }

  if (c.includes('korea')) {
    // South Korea flag (Taegukgi) - Taegeuk symbol
    return (
      <span title={title} className='inline-flex items-center'>
        <span className='rounded-sm overflow-hidden' style={style}>
          <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' style={{ width: size, height: size }}>
            <rect width='24' height='24' fill='#fff' />
            <circle cx='12' cy='12' r='6' fill='#003478' />
            <path d='M12 6a6 6 0 0 1 0 12 3 3 0 0 0 0-6 3 3 0 0 1 0-6z' fill='#c60c30' />
            <circle cx='12' cy='9' r='1.5' fill='#003478' />
            <circle cx='12' cy='15' r='1.5' fill='#c60c30' />
          </svg>
        </span>
        {showLabel && <span className='ml-2 text-sm'>{country}</span>}
      </span>
    )
  }

  // fallback: show globe emoji
  return (
    <span title={title} className='inline-flex items-center'>
      <span style={style} className='flex items-center justify-center text-base'>{'🌐'}</span>
      {showLabel && <span className='ml-2 text-sm'>{country}</span>}
    </span>
  )
}

export default function ScopeTwoBasedMarketContent() {
const emptyForm: Partial<GHGScopeTwoMarketData> = {
    entity: '', facility: '', country: '', classification: 'Electricity',
    january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
    july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
    unit: 'MWh', currency: '', supplier: '', year: new Date().getFullYear(),
    total_amount: 0, total_mj: 0, kgCO2: 0, kgCH4: 0, kgN2O: 0, tCO2eq: 0,
    updated_by: '',
    updated_date: null
  }

  const emptyRenewableForm: Partial<GHGScopeTwoRenewableEnergy> = {
    entity: '', facility: '', country: '', year: new Date().getFullYear(), classification: 'Electricity',
    total_energy_used: 0,
    january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
    july: 0, august: 0, september: 0, october: 0, november: 0, december: 0,
    unit: 'MWh', total_purchase: 0, currency: 'IDR', supplier_name: '',
    distinction: 'REC', energy_source: '', contract_duration: '',
    date_collection: new Date().getFullYear().toString(), certificate_availability: false, contract_information: '',
    updated_by: '',
    updated_date: null
  }

  const [formData, setFormData] = useState<Partial<GHGScopeTwoMarketData>>(emptyForm)
  const [renewableFormData, setRenewableFormData] = useState<Partial<GHGScopeTwoRenewableEnergy>>(emptyRenewableForm)
  const [businesses, setBusinesses] = useState<{entity: string, facility: string, country: string}[]>([])
  const [suppliersList, setSuppliersList] = useState<string[]>([])
  const { toast } = useToast()
  const [data, setData] = useState<GHGScopeTwoMarketData[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedMonthlyYear, setSelectedMonthlyYear] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GHGScopeTwoMarketData | null>(null)
  const [viewingRecord, setViewingRecord] = useState<GHGScopeTwoMarketData | null>(null)
  const [isRenewableViewOpen, setIsRenewableViewOpen] = useState(false)
  const [viewingRenewableRecord, setViewingRenewableRecord] = useState<GHGScopeTwoRenewableEnergy | null>(null)
  const [activeTab, setActiveTab] = useState<string>('market-based')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [renewableEnergyData, setRenewableEnergyData] = useState<GHGScopeTwoRenewableEnergy[]>([])
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [chartFilterEntity, setChartFilterEntity] = useState<string>('all')
  const [chartFilterCountry, setChartFilterCountry] = useState<string>('all')
  const [viewMode, setViewMode] = useState<string>('yearly')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isRenewableAddOpen, setIsRenewableAddOpen] = useState(false)
  const [isRenewableEditOpen, setIsRenewableEditOpen] = useState(false)
  const [editingRenewableRecord, setEditingRenewableRecord] = useState<GHGScopeTwoRenewableEnergy | null>(null)

  const loadData = async () => {
    const { data: rows, error } = await supabase
      .from('ghg_scopetwo_location')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      toast({ title: 'Load error', description: error.message })
      return
    }

    let mapped: GHGScopeTwoMarketData[] = (rows || []).map((r: any, idx: number) => ({
      id: String(r.id ?? idx),
      no: idx + 1,
      entity: r.entity || '',
      facility: r.facility || '',
      country: r.country || '',
      classification: r.classification || 'Electricity',
      january: parseLocaleNumber(r.january) || 0,
      february: parseLocaleNumber(r.february) || 0,
      march: parseLocaleNumber(r.march) || 0,
      april: parseLocaleNumber(r.april) || 0,
      may: parseLocaleNumber(r.may) || 0,
      june: parseLocaleNumber(r.june) || 0,
      july: parseLocaleNumber(r.july) || 0,
      august: parseLocaleNumber(r.august) || 0,
      september: parseLocaleNumber(r.september) || 0,
      october: parseLocaleNumber(r.october) || 0,
      november: parseLocaleNumber(r.november) || 0,
      december: parseLocaleNumber(r.december) || 0,
      unit: r.unit || 'MWh',
      currency: r.currency_unit || r.currency || '',
      supplier: r.supplier_name || r.supplier || '',
      year: Number(r.date_collection) || Number(r.year) || new Date().getFullYear(),
      total_amount: parseLocaleNumber(r.total_purchase_amount) || parseLocaleNumber(r.total_amount) || 0,
      total_mj: parseLocaleNumber(r.total_purchase_mj) || parseLocaleNumber(r.total_mj) || 0,
      kgCO2: Number(r.co2 ?? r.kg_co2 ?? r.kgco2 ?? r.kgCO2) || 0,
      kgCH4: Number(r.ch4 ?? r.kg_ch4 ?? r.kgch4 ?? r.kgCH4) || 0,
      kgN2O: Number(r.n2o ?? r.kg_n2o ?? r.kgn2o ?? r.kgN2O) || 0,
      tCO2eq: Number(r.tco2eq ?? r.tCO2eq) || 0
      ,
      updated_by: r.updated_by ?? r.updatedBy ?? null,
      updated_date: r.updated_date ?? r.updatedDate ?? null,
      created_at: r.created_at || new Date(),
      updated_at: r.updated_at || new Date()
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

  const loadRenewableEnergyData = async () => {
    const { data: rows, error } = await supabase
      .from('ghg_scopetwo_renewableenergy')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      toast({ title: 'Load error', description: error.message })
      return
    }

    let mapped: GHGScopeTwoRenewableEnergy[] = (rows || []).map((r: any, idx: number) => ({
      id: String(r.id ?? idx),
      created_at: r.created_at || new Date().toISOString(),
      entity: r.entity || '',
      facility: r.facility || '',
      country: r.country || '',
      year: Number(r.year) || new Date().getFullYear(),
      classification: r.classification || '',
      // Support both possible DB column names: `total_energy_used` and `total_energy_usage`
      total_energy_used: Number(r.total_energy_used ?? r.total_energy_usage) || 0,
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
      // Support both possible DB column names for purchase amount
      total_purchase: parseLocaleNumber(r.total_purchase ?? r.total_purchase_amount) || 0,
      currency: r.currency || 'IDR',
      supplier_name: r.supplier_name || '',
      distinction: r.distinction || 'REC',
      energy_source: r.energy_source || '',
      contract_duration: r.contract_duration || '',
      // Normalize `date_collection` which is stored as a year string in the DB
      date_collection: (() => {
        const dc = r.date_collection ?? r.year_start ?? r.year_of_start
        if (dc == null) return new Date().getFullYear().toString()
        if (typeof dc === 'string') return dc
        if (typeof dc === 'number') return dc.toString()
        return new Date().getFullYear().toString()
      })(),
      certificate_availability: Boolean(r.certificate_availability ?? r.certificate_availability),
      contract_information: r.contract_information || '',
      updated_by: r.updated_by ?? r.updatedBy ?? null,
      updated_date: r.updated_date ?? r.updatedDate ?? null,
      updated_at: r.updated_at || new Date().toISOString()
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

    setRenewableEnergyData(mapped)
  }

  const loadLookups = async () => {
    try {
      const { data: bizRows } = await supabase
        .from('general_information_business')
        .select('entity,facility,country')

      if (bizRows) {
        const mapped = (bizRows as any[]).map(r => ({ entity: r.entity || '', facility: r.facility || '', country: r.country || '' }))
        console.log('Businesses loaded:', mapped)
        setBusinesses(mapped)
      } else {
        console.log('No business data returned from query')
      }

      const { data: supRows } = await supabase
        .from('ghg_scopetwo_location')
        .select('supplier_name')

      if (supRows) {
        const names = Array.from(new Set((supRows as any[]).map(r => r.supplier_name).filter(Boolean)))
        console.log('Suppliers loaded:', names)
        setSuppliersList(names)
      } else {
        console.log('No supplier data returned from query')
      }
    } catch (e) {
      console.error('Error in loadLookups:', e)
      // ignore lookup errors
    }
  }

  useEffect(() => { 
    console.log('Component mounting, loading data...')
    loadData(); loadRenewableEnergyData(); loadLookups() 
  }, [])

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

  // When Renewable Add sheet opens, reset form data
  useEffect(() => {
    if (isRenewableAddOpen) {
      setRenewableFormData(emptyRenewableForm)
    }
  }, [isRenewableAddOpen])

  // Calculate total_energy_usage from monthly values for renewable energy form
  // Calculate total energy usage from monthly values
  const calculatedTotalEnergyUsage = useMemo(() => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const
    const sum = months.reduce((sum, month) => sum + (parseLocaleNumber(renewableFormData[month as keyof typeof renewableFormData]) || 0), 0)
    // Convert to MWh equivalent for storage
    return renewableFormData.unit === 'Unit' ? sum / 1000 : sum
  }, [renewableFormData.january, renewableFormData.february, renewableFormData.march, renewableFormData.april, renewableFormData.may, renewableFormData.june, renewableFormData.july, renewableFormData.august, renewableFormData.september, renewableFormData.october, renewableFormData.november, renewableFormData.december, renewableFormData.unit])

  // Display total in the entered unit
  const displayTotalEnergyUsage = useMemo(() => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] as const
    return months.reduce((sum, month) => sum + (parseLocaleNumber(renewableFormData[month as keyof typeof renewableFormData]) || 0), 0)
  }, [renewableFormData.january, renewableFormData.february, renewableFormData.march, renewableFormData.april, renewableFormData.may, renewableFormData.june, renewableFormData.july, renewableFormData.august, renewableFormData.september, renewableFormData.october, renewableFormData.november, renewableFormData.december])

  // Auto-set currency based on country
  useEffect(() => {
    if (renewableFormData.country) {
      const country = renewableFormData.country.toLowerCase()
      let currency = 'IDR' // default
      if (country.includes('indonesia') || country.includes('indon')) {
        currency = 'IDR'
      } else if (country.includes('korea')) {
        currency = 'KRW'
      }
      setRenewableFormData(prev => ({ ...prev, currency }))
    }
  }, [renewableFormData.country])

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
    const yearSet = new Set<string>([
      ...data.map(item => item.year.toString()),
      ...renewableEnergyData.map(item => item.date_collection)
    ])
    // Always include current year for new records
    const currentYear = new Date().getFullYear()
    yearSet.add(currentYear.toString())
    const sortedYears = Array.from(yearSet).sort()
    // Set default monthly year to latest year if not set
    if (sortedYears.length > 0 && !selectedMonthlyYear) {
      setSelectedMonthlyYear(sortedYears[sortedYears.length - 1])
    }
    return sortedYears
  }, [data, renewableEnergyData])

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

  const calculateFromForm = (f: Partial<GHGScopeTwoMarketData>) => {
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

  // Adjust market-based data in-memory by subtracting matching renewable monthly values
  // Matching is done by facility + year (renewable.date_collection). This does NOT modify DB rows.
  const adjustedMarketData = useMemo(() => {
    if (!data || data.length === 0) return data

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

    return data.map(item => {
      const facilityKey = (item.facility || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      const yearKey = String(item.year ?? '').trim()
      const key = `${facilityKey}::${yearKey}`
      const renewable = renewableMap.get(key)
      if (!renewable) return item

      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
      const adjusted: GHGScopeTwoMarketData = { ...item }

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
  }, [data, renewableEnergyData])

  const statistics = useMemo(() => {
    let filtered = adjustedMarketData
    if (filterYear !== 'all') filtered = filtered.filter(item => item.year.toString() === filterYear)
    if (filterEntity !== 'all') filtered = filtered.filter(item => item.entity === filterEntity)
    if (filterCountry !== 'all') filtered = filtered.filter(item => item.country === filterCountry)

    return {
      totalEmissions: filtered.reduce((sum: number, item: GHGScopeTwoMarketData) => sum + item.tCO2eq, 0),
      totalEnergyMJ: filtered.reduce((sum: number, item: GHGScopeTwoMarketData) => sum + item.total_mj, 0),
      totalPurchase: filtered.reduce((sum: number, item: GHGScopeTwoMarketData) => sum + parseLocaleNumber(item.total_amount), 0),
      totalRecords: filtered.length
    }
  }, [adjustedMarketData, filterYear, filterEntity, filterCountry])

  const renewableStatistics = useMemo(() => {
    let filtered = renewableEnergyData
    if (filterYear !== 'all') filtered = filtered.filter(item => item.date_collection === filterYear)
    if (filterEntity !== 'all') filtered = filtered.filter(item => item.entity === filterEntity)
    if (filterCountry !== 'all') filtered = filtered.filter(item => item.country === filterCountry)

    return {
      totalEmissions: 0, // Not available in new schema
      totalEnergyMJ: filtered.reduce((sum: number, item: GHGScopeTwoRenewableEnergy) => sum + parseLocaleNumber(item.total_energy_used), 0),
      totalPurchase: filtered.reduce((sum: number, item: GHGScopeTwoRenewableEnergy) => sum + parseLocaleNumber(item.total_purchase), 0),
      totalRecords: filtered.length
    }
  }, [renewableEnergyData, filterYear, filterEntity, filterCountry])
  
  const chartData = useMemo(() => {
    let filtered = adjustedMarketData
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
          const monthKey = monthKeys[idx] as keyof GHGScopeTwoMarketData
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
  }, [adjustedMarketData, years, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  // Calculate total tCO2eq for filtered chart data
  const chartTotalEmissions = useMemo(() => {
    let filtered = adjustedMarketData
    if (chartFilterEntity !== 'all') filtered = filtered.filter(item => item.entity === chartFilterEntity)
    if (chartFilterCountry !== 'all') filtered = filtered.filter(item => item.country === chartFilterCountry)
    if (viewMode === 'monthly' && selectedMonthlyYear) {
      filtered = filtered.filter(item => item.year.toString() === selectedMonthlyYear)
    }
    return filtered.reduce((sum: number, item: GHGScopeTwoMarketData) => sum + item.tCO2eq, 0)
  }, [adjustedMarketData, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  // Calculate breakdown by entity for filtered chart data
  const chartEntityBreakdown = useMemo(() => {
    let filtered = adjustedMarketData
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
  }, [adjustedMarketData, chartFilterEntity, chartFilterCountry, viewMode, selectedMonthlyYear])

  const filteredTableData = useMemo(() => {
    let filtered = adjustedMarketData
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
  }, [adjustedMarketData, searchTerm, filterYear, filterEntity, filterCountry])

  const filteredRenewableTableData = useMemo(() => {
    let filtered = renewableEnergyData
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    if (filterYear !== 'all') filtered = filtered.filter(item => item.date_collection === filterYear)
    if (filterEntity !== 'all') filtered = filtered.filter(item => item.entity === filterEntity)
    if (filterCountry !== 'all') filtered = filtered.filter(item => item.country === filterCountry)
    return filtered
  }, [renewableEnergyData, searchTerm, filterYear, filterEntity, filterCountry])

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTableData, currentPage])

  const renewableTotalPages = Math.ceil(filteredRenewableTableData.length / itemsPerPage)
  const renewablePaginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredRenewableTableData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredRenewableTableData, currentPage])

  const calculateFromRenewableForm = (f: Partial<GHGScopeTwoRenewableEnergy>) => {
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
    const total = months.reduce((s, m) => s + (Number((f as any)[m]) || 0), 0)

    // Step 1: Convert MWh to MJ (1 MWh = 3,600 MJ)
    const mj = total * 3600

    // Step 2: For renewable energy, emissions are zero
    const kgCO2 = 0
    const kgCH4 = 0
    const kgN2O = 0
    const tCO2eq = 0

    return { total_purchase: total, total_mj: mj, kgCO2, kgCH4, kgN2O, tCO2eq }
  }

  const handleAdd = async () => {
    console.log('handleAdd called with formData:', formData)
    const calc = calculateFromForm(formData)
    // resolve updater name from profiles.nickname (fallbacks handled inside)
    const updaterName = await getUpdaterName()

    const payload: any = {
      entity: formData.entity || '',
      facility: formData.facility || '',
      country: formData.country || '',
      classification: formData.classification || 'Electricity',
      january: parseLocaleNumber(formData.january) || 0,
      february: parseLocaleNumber(formData.february) || 0,
      march: parseLocaleNumber(formData.march) || 0,
      april: parseLocaleNumber(formData.april) || 0,
      may: parseLocaleNumber(formData.may) || 0,
      june: parseLocaleNumber(formData.june) || 0,
      july: parseLocaleNumber(formData.july) || 0,
      august: parseLocaleNumber(formData.august) || 0,
      september: parseLocaleNumber(formData.september) || 0,
      october: parseLocaleNumber(formData.october) || 0,
      november: parseLocaleNumber(formData.november) || 0,
      december: parseLocaleNumber(formData.december) || 0,
      unit: formData.unit || 'MWh',
      currency_unit: formData.currency || '',
      supplier_name: formData.supplier || '',
      date_collection: String(formData.year || new Date().getFullYear()),
      total_purchase_amount: calc.total_amount,
      total_purchase_mj: calc.total_mj,
      kgCO2: calc.kgCO2,
      kgCH4: calc.kgCH4,
      kgN2O: calc.kgN2O,
      tCO2eq: calc.tCO2eq,
      updated_by: updaterName,
      updated_date: new Date().toISOString()
    }

    console.log('Inserting payload:', payload)

    const { data: inserted, error } = await supabase
      .from('ghg_scopetwo_location')
      .insert(payload)
      .select()
      .single()

    console.log('Insert result - data:', inserted, 'error:', error)

    if (error) {
      toast({ title: 'Insert error', description: error.message || 'Unknown error' })
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
      january: parseLocaleNumber(formData.january) || editingRecord.january,
      february: parseLocaleNumber(formData.february) || editingRecord.february,
      march: parseLocaleNumber(formData.march) || editingRecord.march,
      april: parseLocaleNumber(formData.april) || editingRecord.april,
      may: parseLocaleNumber(formData.may) || editingRecord.may,
      june: parseLocaleNumber(formData.june) || editingRecord.june,
      july: parseLocaleNumber(formData.july) || editingRecord.july,
      august: parseLocaleNumber(formData.august) || editingRecord.august,
      september: parseLocaleNumber(formData.september) || editingRecord.september,
      october: parseLocaleNumber(formData.october) || editingRecord.october,
      november: parseLocaleNumber(formData.november) || editingRecord.november,
      december: parseLocaleNumber(formData.december) || editingRecord.december,
      unit: formData.unit || editingRecord.unit,
      currency_unit: formData.currency || editingRecord.currency,
      supplier_name: formData.supplier || editingRecord.supplier,
      date_collection: String(formData.year || editingRecord.year),
      total_purchase_amount: calc.total_amount,
      total_purchase_mj: calc.total_mj,
      kgCO2: calc.kgCO2,
      kgCH4: calc.kgCH4,
      kgN2O: calc.kgN2O,
      tCO2eq: calc.tCO2eq,
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

  const handleRenewableAdd = async () => {
    console.log('handleRenewableAdd called', renewableFormData)
    // Calculate total energy usage from monthly values
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
    const sum = months.reduce((sum, month) => sum + (parseLocaleNumber(renewableFormData[month as keyof typeof renewableFormData]) || 0), 0)
    const totalEnergyUsage = renewableFormData.unit === 'Unit' ? sum * 1000 : sum
    
    const calc = calculateFromRenewableForm(renewableFormData)
    // resolve updater name from profiles.nickname (fallbacks handled inside)
    const updaterName = await getUpdaterName()

    const payload: any = {
      created_at: new Date().toISOString(),
      entity: renewableFormData.entity || '',
      facility: renewableFormData.facility || '',
      country: renewableFormData.country || '',
      classification: renewableFormData.classification || '',
      total_energy_used: totalEnergyUsage,
      january: parseLocaleNumber(renewableFormData.january) || 0,
      february: parseLocaleNumber(renewableFormData.february) || 0,
      march: parseLocaleNumber(renewableFormData.march) || 0,
      april: parseLocaleNumber(renewableFormData.april) || 0,
      may: parseLocaleNumber(renewableFormData.may) || 0,
      june: parseLocaleNumber(renewableFormData.june) || 0,
      july: parseLocaleNumber(renewableFormData.july) || 0,
      august: parseLocaleNumber(renewableFormData.august) || 0,
      september: parseLocaleNumber(renewableFormData.september) || 0,
      october: parseLocaleNumber(renewableFormData.october) || 0,
      november: parseLocaleNumber(renewableFormData.november) || 0,
      december: parseLocaleNumber(renewableFormData.december) || 0,
      unit: renewableFormData.unit || 'MWh',
      total_purchase: parseLocaleNumber(renewableFormData.total_purchase) || 0,
      currency: renewableFormData.currency || 'IDR',
      supplier_name: renewableFormData.supplier_name || '',
      distinction: renewableFormData.distinction || 'REC',
      energy_source: renewableFormData.energy_source || '',
      contract_duration: renewableFormData.contract_duration || '',
      // Send date_collection as a year string
      date_collection: renewableFormData.date_collection || new Date().getFullYear().toString(),
      year: Number(renewableFormData.date_collection || renewableFormData.year || new Date().getFullYear()),
      certificate_availability: Boolean(renewableFormData.certificate_availability),
      contract_information: renewableFormData.contract_information || '',
      updated_by: updaterName
    }

    console.log('Attempting Supabase insert with payload:', payload)
    const { data: inserted, error } = await supabase
      .from('ghg_scopetwo_renewableenergy')
      .insert(payload)
      .select()
      .single()

    console.log('Supabase insert response:', { data: inserted, error })

    if (error) {
      console.error('Insert error:', error)

      try {
        const restUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ghg_scopetwo_renewableenergy?select=*`
        console.log('REST fallback:', { restUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL, anonKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY })
        console.log('REST fallback posting payload:', payload)

        const res = await fetch(restUrl, {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        let bodyText = ''
        try {
          const json = await res.json()
          bodyText = JSON.stringify(json)
        } catch (e) {
          bodyText = await res.text()
        }

        console.error('Raw REST fallback status:', res.status, 'body:', bodyText)

        // Provide a slightly more informative toast while directing dev to console.
        toast({ title: 'Insert error', description: `${error?.message || 'Insert failed'} (see console for REST response)` })
      } catch (restErr) {
        console.error('REST fallback failed:', restErr)
        toast({ title: 'Insert error', description: error?.message || 'Insert failed' })
      }

      return
    }

    console.log('Successfully inserted record:', inserted)

    await loadRenewableEnergyData()
    setIsRenewableAddOpen(false)
    setRenewableFormData(emptyRenewableForm)
    toast({ title: 'Record added', description: 'Record saved to database' })
  }

  const handleRenewableEditSave = async () => {
    console.log('handleRenewableEditSave called', { editingRenewableRecord, renewableFormData })
    if (!editingRenewableRecord) {
      console.log('No editingRenewableRecord')
      return
    }
    
    // Calculate total energy usage from monthly values
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
    const sum = months.reduce((sum, month) => sum + (parseLocaleNumber(renewableFormData[month as keyof typeof renewableFormData]) || 0), 0)
    const totalEnergyUsage = renewableFormData.unit === 'Unit' ? sum * 1000 : sum
    
    const calc = calculateFromRenewableForm(renewableFormData)
    // resolve updater name from profiles.nickname (fallbacks handled inside)
    const updaterNameEdit = await getUpdaterName()

    const payload: any = {
      facility: renewableFormData.facility,
      classification: renewableFormData.classification,
      total_energy_used: totalEnergyUsage,
      january: parseLocaleNumber(renewableFormData.january),
      february: parseLocaleNumber(renewableFormData.february),
      march: parseLocaleNumber(renewableFormData.march),
      april: parseLocaleNumber(renewableFormData.april),
      may: parseLocaleNumber(renewableFormData.may),
      june: parseLocaleNumber(renewableFormData.june),
      july: parseLocaleNumber(renewableFormData.july),
      august: parseLocaleNumber(renewableFormData.august),
      september: parseLocaleNumber(renewableFormData.september),
      october: parseLocaleNumber(renewableFormData.october),
      november: parseLocaleNumber(renewableFormData.november),
      december: parseLocaleNumber(renewableFormData.december),
      unit: renewableFormData.unit,
      total_purchase: parseLocaleNumber(renewableFormData.total_purchase),
      currency: renewableFormData.currency,
      supplier_name: renewableFormData.supplier_name,
      distinction: renewableFormData.distinction,
      energy_source: renewableFormData.energy_source,
      contract_duration: renewableFormData.contract_duration,
      date_collection: renewableFormData.date_collection,
      certificate_availability: Boolean(renewableFormData.certificate_availability),
      contract_information: renewableFormData.contract_information,
      updated_by: updaterNameEdit
    }

    console.log('Update payload:', payload)
    console.log('Updating id:', Number(editingRenewableRecord.id))

    const { data, error } = await supabase
      .from('ghg_scopetwo_renewableenergy')
      .update(payload)
      .eq('id', Number(editingRenewableRecord.id))
      .select()

    console.log('Supabase update result:', { data, error })

    if (error && error.message && error.message.trim()) {
      console.log('Update error:', error)
      toast({ title: 'Update error', description: error.message || 'Update failed' })
      return
    }

    if (!data || data.length === 0) {
      console.log('Update failed: no data returned')
      toast({ title: 'Update error', description: 'Update failed: no data returned' })
      return
    }

    console.log('Update successful, reloading data')
    await loadRenewableEnergyData()
    setIsRenewableEditOpen(false)
    setEditingRenewableRecord(null)
    setRenewableFormData(emptyRenewableForm)
    toast({ title: 'Record updated', description: 'Record saved to database' })
  }

  const handleRenewableDelete = async (record: GHGScopeTwoRenewableEnergy) => {
    if (!confirm(`Delete record for ${record.entity} - ${record.facility}?`)) return

    const { error } = await supabase
      .from('ghg_scopetwo_renewableenergy')
      .delete()
      .eq('id', record.id)

    if (error) {
      toast({ title: 'Delete error', description: error.message })
      return
    }

    await loadRenewableEnergyData()
    toast({ title: 'Record deleted', description: 'Record removed from database' })
  }

  const handleRenewableView = (record: GHGScopeTwoRenewableEnergy) => {
    setViewingRenewableRecord(record)
    setIsRenewableViewOpen(true)
  }

  const handleRenewableEdit = (record: GHGScopeTwoRenewableEnergy) => {
    setEditingRenewableRecord(record)
    // Look up entity and country from business data based on facility
    const businessData = businesses.find(b => b.facility === record.facility)
    setRenewableFormData({
      entity: businessData?.entity || record.entity,
      facility: record.facility,
      country: businessData?.country || record.country,
      classification: record.classification,
      total_energy_used: record.total_energy_used,
      january: record.january,
      february: record.february,
      march: record.march,
      april: record.april,
      may: record.may,
      june: record.june,
      july: record.july,
      august: record.august,
      september: record.september,
      october: record.october,
      november: record.november,
      december: record.december,
      unit: record.unit,
      total_purchase: record.total_purchase,
      currency: record.currency,
      supplier_name: record.supplier_name,
      distinction: record.distinction,
      energy_source: record.energy_source,
      contract_duration: record.contract_duration,
      year: record.year,
      date_collection: record.date_collection,
      certificate_availability: record.certificate_availability,
      contract_information: record.contract_information,
      updated_by: record.updated_by,
      updated_date: record.updated_date
    })
    setIsRenewableEditOpen(true)
  }

  const handleEdit = (row: GHGScopeTwoMarketData) => {
    setEditingRecord(row)
    setFormData(row)
    setIsEditOpen(true)
  }

  const handleView = (row: GHGScopeTwoMarketData) => {
    setViewingRecord(row)
    setIsViewOpen(true)
  }

  return (
    <>
      <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>Scope Two GHG Emissions - Market-Based</h1>
          <p className='text-sm md:text-base text-muted-foreground'>Track and analyze electricity & steam purchase emissions (market-based)</p>
        </div>

      <Card className='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Calculator className='h-5 w-5' />
            Scope 2 Market-Based Calculation Method
          </CardTitle>
          <CardDescription>How emissions are calculated from supplier/contractual instruments and purchases</CardDescription>
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
              <strong className='text-blue-700 dark:text-blue-400'>Note:</strong> Market-based uses supplier/contractual emission factors where available; falls back to grid averages when supplier factors are missing.
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
                <label className='text-sm font-medium text-muted-foreground'>Filter by:</label>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 items-end'>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-muted-foreground'>Entity</Label>
                    <Select value={chartFilterEntity} onValueChange={setChartFilterEntity}>
                      <SelectTrigger className='h-9 w-full'><SelectValue placeholder='All Entities' /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Entities</SelectItem>
                        {entities.map(entity => <SelectItem key={entity} value={entity}>{entity}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-sm font-medium text-muted-foreground'>Country</Label>
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
                      <Label className='text-sm font-medium text-muted-foreground'>Year (for Monthly)</Label>
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
                <CardDescription>View all scope two emissions records</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' size='icon'><Download className='h-4 w-4' /></Button>
                <Button variant='default' onClick={() => activeTab === 'market-based' ? setIsAddOpen(true) : setIsRenewableAddOpen(true)}><Plus className='h-4 w-4 mr-2' /> Add Record</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics Cards - Always visible */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
            <div className='p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20'>
              <p className='text-xs font-medium text-green-700 dark:text-green-400 mb-1'>Total Emissions</p>
              <p className='text-xl font-bold text-green-800 dark:text-green-300'>
                {formatNumber(statistics.totalEmissions)}
              </p>
              <p className='text-xs text-green-600'>tCO2eq</p>
            </div>
            <div className='p-3 rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20'>
              <p className='text-xs font-medium text-amber-700 dark:text-amber-400 mb-1'>Total Energy</p>
              <p className='text-xl font-bold text-amber-800 dark:text-amber-300'>
                {formatNumber(statistics.totalEnergyMJ)}
              </p>
              <p className='text-xs text-amber-600'>MJ</p>
            </div>
            <div className='p-3 rounded-lg border bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20'>
              <p className='text-xs font-medium text-purple-700 dark:text-purple-400 mb-1'>Total Purchase</p>
              <p className='text-xl font-bold text-purple-800 dark:text-purple-300'>
                {formatNumber(statistics.totalPurchase)}
              </p>
              <p className='text-xs text-purple-600'>MWh</p>
            </div>
            <div className='p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20'>
              <p className='text-xs font-medium text-blue-700 dark:text-blue-400 mb-1'>
                Total Renewable Energy Used
              </p>
              <p className='text-xl font-bold text-blue-800 dark:text-blue-300'>
                {(() => {
                  const value = renewableStatistics.totalEnergyMJ
                  return value % 1 === 0 ? formatNumber(value, 0) : formatNumber(value)
                })()}
              </p>
              <p className='text-xs text-blue-600'>
                MWh & Unit
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='market-based'>Market-Based</TabsTrigger>
              <TabsTrigger value='renewable-energy'>Renewable Energy</TabsTrigger>
            </TabsList>
            <TabsContent value='renewable-energy' className='w-full mt-6'>
              <div className='flex flex-col gap-4'>
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
          <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[50px]'>No</TableHead>
                  <TableHead className='min-w-[150px]'>Facility</TableHead>
                  <TableHead className='min-w-[70px]'>Year</TableHead>
                  <TableHead className='min-w-[120px]'>Classification</TableHead>
                  <TableHead className='min-w-[120px]'>Total Energy Used</TableHead>
                  <TableHead className='min-w-[140px]'>Supplier Name</TableHead>
                  <TableHead className='min-w-[120px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renewablePaginatedData.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                    <TableCell>{row.facility}</TableCell>
                    <TableCell>{row.date_collection}</TableCell>
                    <TableCell>{row.classification}</TableCell>
                    <TableCell>{(() => {
                      const value = parseLocaleNumber(row.total_energy_used)
                      return value % 1 === 0 ? formatNumber(value, 0) : formatNumber(value)
                    })()}</TableCell>
                    <TableCell>{row.supplier_name}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm' onClick={() => handleRenewableView(row)} title='View'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' onClick={() => handleRenewableEdit(row)} title='Edit'>
                          <Pencil className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredRenewableTableData.length > 0 && (
            <div className='flex items-center justify-between px-2 py-4'>
              <div className='text-sm text-muted-foreground'>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRenewableTableData.length)} of {filteredRenewableTableData.length} entries
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                {Array.from({ length: Math.min(renewableTotalPages, 5) }, (_, i) => i + 1).map(page => (
                  <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size='sm' className='w-10' onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant='outline' size='sm' onClick={() => setCurrentPage(prev => Math.min(renewableTotalPages, prev + 1))} disabled={currentPage === renewableTotalPages}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value='market-based' className='w-full'>
          <div className='flex flex-col gap-4'>
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
                    <TableCell>
                      <CountryFlag country={row.country} />
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' style={{ borderColor: CLASSIFICATION_COLORS[row.classification] }}>
                        {row.classification}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{formatNumber(parseLocaleNumber(row.total_amount))}</TableCell>
                    <TableCell className='font-bold'>{formatNumber(row.tCO2eq)}</TableCell>
                    <TableCell>{row.updated_by || 'N/A'}</TableCell>
                    <TableCell>{formatDateTime(row.updated_date)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm' onClick={() => handleView(row)} title='View'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' onClick={() => handleEdit(row)} title='Edit'>
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
        </TabsContent>

        </Tabs>
      </CardContent>
      </Card>
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[1200px] overflow-hidden flex flex-col p-0'>
          {/* Fixed Header */}
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Plus className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                </div>
                <span className='line-clamp-1'>Add Scope 2 - Market Record</span>
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Entity *</Label>
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Facility *</Label>
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Country *</Label>
                  <Input value={formData.country || ''} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Year *</Label>
                  <Select value={String(formData.year || new Date().getFullYear())} onValueChange={(v) => setFormData({...formData, year: Number(v)})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Select year' /></SelectTrigger>
                    <SelectContent>
                      {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Classification *</Label>
                  <Select value={formData.classification as string} onValueChange={(v) => setFormData({...formData, classification: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Electricity'>Electricity</SelectItem>
                      <SelectItem value='Steam'>Steam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Unit</Label>
                  <Input value={formData.unit || 'MWh'} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Currency (Auto)</Label>
                  <Select value={formData.currency || (formData.country?.toLowerCase().includes('korea') ? 'KRW' : 'IDR')} onValueChange={(v) => setFormData({...formData, currency: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Auto-selected' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='KRW'>KRW</SelectItem>
                      <SelectItem value='IDR'>IDR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Supplier</Label>
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
                    <Label className='text-xs font-medium text-center block text-muted-foreground'>{month.label}</Label>
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
                      <p className='text-[10px] sm:text-xs text-green-600 dark:text-green-400'>Market-based (Supplier / Contractual)</p>
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
              <Button onClick={handleAdd} disabled={!formData.entity || !formData.facility || !formData.year} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Entity *</Label>
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Facility *</Label>
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Country *</Label>
                  <Input value={formData.country || ''} readOnly className='h-10 bg-muted/10 flex-1' />
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
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Classification *</Label>
                  <Select value={formData.classification as string} onValueChange={(v) => setFormData({...formData, classification: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Electricity'>Electricity</SelectItem>
                      <SelectItem value='Steam'>Steam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Unit</Label>
                  <Input value={formData.unit || 'MWh'} readOnly className='h-10 bg-muted/10 flex-1' />
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Currency (Auto)</Label>
                  <Select value={formData.currency || (formData.country?.toLowerCase().includes('korea') ? 'KRW' : 'IDR')} onValueChange={(v) => setFormData({...formData, currency: v})}>
                    <SelectTrigger className='h-10 flex-1'><SelectValue placeholder='Auto-selected' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='KRW'>KRW</SelectItem>
                      <SelectItem value='IDR'>IDR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-3'>
                  <Label className='text-sm font-medium w-28 flex-shrink-0'>Supplier</Label>
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
                    <Label className='text-xs font-medium text-center block text-muted-foreground'>{month.label}</Label>
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
                        <span className='sr-only'>Country</span>
                        <div>
                          <CountryFlag country={viewingRecord.country} size={20} showLabel={false} />
                        </div>
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
                      <p className='text-xs sm:text-sm font-mono font-medium'>{formatNumber(parseLocaleNumber((viewingRecord as any)[month.key]))}</p>
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
                    <p className='text-sm sm:text-base font-bold font-mono'>{formatNumber(parseLocaleNumber(viewingRecord.total_amount))}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MWh</p>
                  </div>
                  <div className='p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>Total Energy</p>
                    <p className='text-sm sm:text-base font-bold font-mono'>{formatNumber(parseLocaleNumber(viewingRecord.total_mj))}</p>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>MJ</p>
                  </div>
                  <div className='p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center'>
                    <p className='text-[10px] sm:text-xs text-green-700 dark:text-green-300 mb-1'>GHG Emissions</p>
                    <p className='text-sm sm:text-base font-bold text-green-700 dark:text-green-400 font-mono'>{formatNumber(parseLocaleNumber(viewingRecord.tCO2eq))}</p>
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

      {/* Renewable Energy Add Sheet */}
      <Sheet open={isRenewableAddOpen} onOpenChange={setIsRenewableAddOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[1000px] overflow-hidden flex flex-col p-0'>
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Plus className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                </div>
                <span className='line-clamp-1'>Add Renewable Energy Record</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                Enter renewable energy purchase data. Emissions are calculated as zero.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 shadow-sm'>
                  <svg className='w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-base sm:text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100'>Facility Information</h3>
                  <p className='text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5'>Select the facility site for this renewable energy record</p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-blue-800 dark:text-blue-200'>Entity *</Label>
                  <Select value={renewableFormData.entity} onValueChange={(value) => {
                    const selectedBiz = businesses.find(b => b.entity === value)
                    setRenewableFormData(prev => ({ 
                      ...prev, 
                      entity: value,
                      facility: selectedBiz?.facility || '',
                      country: selectedBiz?.country || ''
                    }))
                  }}>
                    <SelectTrigger className='h-11 w-full border-blue-200 dark:border-blue-800'><SelectValue placeholder='Select entity' /></SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(businesses.map(b => b.entity))).map(entity => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2 min-w-0'>
                  <Label className='text-sm font-semibold text-blue-800 dark:text-blue-200'>Facility *</Label>
                  <Select value={renewableFormData.facility} onValueChange={(value) => {
                    const selectedBiz = businesses.find(b => b.facility === value && b.entity === renewableFormData.entity)
                    setRenewableFormData(prev => ({ 
                      ...prev, 
                      facility: value,
                      country: selectedBiz?.country || prev.country
                    }))
                  }}>
                    <SelectTrigger className='h-11 w-full border-blue-200 dark:border-blue-800'><SelectValue placeholder='Select facility' /></SelectTrigger>
                    <SelectContent>
                      {businesses.filter(b => b.entity === renewableFormData.entity).map(b => (
                        <SelectItem key={b.facility} value={b.facility}>{b.facility}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2 min-w-0'>
                  <Label className='text-sm font-semibold text-blue-800 dark:text-blue-200'>Country *</Label>
                  <div className='relative'>
                    {/* Use a non-editable inline box to align with Select triggers */}
                    <div className='h-11 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 flex items-center px-3 rounded w-full'>
                      <div className='flex items-center justify-center mr-3 flex-shrink-0'>
                        <CountryFlag country={renewableFormData.country} size={18} />
                      </div>
                      <div className='truncate text-sm text-blue-900 dark:text-blue-100 min-w-0'>
                        {renewableFormData.country || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4 sm:space-y-5 md:space-y-6 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0 shadow-sm'>
                  <svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-base sm:text-lg md:text-xl font-bold text-green-900 dark:text-green-100'>Renewable Energy Details</h3>
                  <p className='text-xs sm:text-sm text-green-700 dark:text-green-300 mt-0.5'>Configure the renewable energy classification and usage data</p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-green-800 dark:text-green-200'>Classification *</Label>
                  <Input 
                    value={renewableFormData.classification} 
                    onChange={(e) => setRenewableFormData(prev => ({ ...prev, classification: e.target.value }))} 
                    placeholder='e.g., Solar, Wind, Hydro' 
                    className='h-11 border-green-200 dark:border-green-800'
                  />
                </div>

                <div className='space-y-2 hidden'>
                  <Label className='text-sm font-semibold text-green-800 dark:text-green-200'>Total Used Amount *</Label>
                  <Input 
                    type='text' 
                    value={formatNumber(displayTotalEnergyUsage, displayTotalEnergyUsage % 1 === 0 ? 0 : 4)} 
                    readOnly 
                    className='h-11 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 font-mono font-semibold' 
                    placeholder='Total from 12 months' 
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-green-800 dark:text-green-200'>Unit</Label>
                  <Select value={renewableFormData.unit} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger className='h-11 w-full border-green-200 dark:border-green-800'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='MWh'>MWh</SelectItem>
                      <SelectItem value='Unit'>Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-xs sm:text-sm font-medium'>12 Month Energy Usage (January - December)</Label>
                <div className='bg-muted/20 rounded-lg p-3 sm:p-4 border'>
                  <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'>
                    {['january','february','march','april','may','june','july','august','september','october','november','december'].map((month, idx) => (
                      <div key={month} className='space-y-2'>
                        <Label className='text-xs font-medium text-center block capitalize text-muted-foreground'>{month.slice(0,3)}</Label>
                        <Input
                          type='text'
                          value={
                            typeof renewableFormData[month as keyof typeof renewableFormData] === 'string'
                              ? (renewableFormData[month as keyof typeof renewableFormData] as string)
                              : (renewableFormData[month as keyof typeof renewableFormData] || renewableFormData[month as keyof typeof renewableFormData] === 0
                                  ? (() => {
                                      const num = Number(renewableFormData[month as keyof typeof renewableFormData])
                                      return formatNumber(num, num % 1 === 0 ? 0 : 2)
                                    })()
                                  : '')
                          }
                          onChange={(e) => {
                            // keep raw user input while typing (allow comma decimal)
                            setRenewableFormData(prev => ({ ...prev, [month]: e.target.value }))
                          }}
                          onBlur={(e) => {
                            // parse and convert to number on blur for saving
                            const parsed = parseLocaleNumber(e.target.value)
                            setRenewableFormData(prev => ({ ...prev, [month]: parsed }))
                          }}
                          placeholder='0'
                          className='h-9 sm:h-10 text-center font-mono'
                        />
                      </div>
                    ))}
                  </div>
                  <div className='mt-3 pt-3 border-t border-border/50'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium text-muted-foreground'>Total:</span>
                      <span className='font-bold font-mono text-primary'>{formatLocaleDisplay(displayTotalEnergyUsage, displayTotalEnergyUsage % 1 === 0 ? 0 : 4)} {renewableFormData.unit || 'MWh'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4 sm:space-y-5 md:space-y-6 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 shadow-sm'>
                  <svg className='w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-base sm:text-lg md:text-xl font-bold text-purple-900 dark:text-purple-100'>Contract & Purchase Details</h3>
                  <p className='text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-0.5'>Specify purchase amounts, supplier information, and contract details</p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Total Purchase Amount</Label>
                  <Input
                    type='text'
                    value={typeof renewableFormData.total_purchase === 'string'
                      ? renewableFormData.total_purchase
                      : (renewableFormData.total_purchase
                        ? (renewableFormData.currency
                          ? formatCurrency(parseLocaleNumber(renewableFormData.total_purchase as any), renewableFormData.currency as string)
                          : formatNumber(parseLocaleNumber(renewableFormData.total_purchase as any)))
                        : '')}
                    onChange={(e) => setRenewableFormData(prev => ({ ...prev, total_purchase: e.target.value }))}
                    onBlur={(e) => {
                      const parsed = parseLocaleNumber(e.target.value)
                      setRenewableFormData(prev => ({ ...prev, total_purchase: parsed }))
                    }}
                    placeholder='Enter total purchase amount'
                    className='h-11 border-purple-200 dark:border-purple-800'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Currency</Label>
                  <Select value={renewableFormData.currency} disabled>
                    <SelectTrigger className='h-11 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='IDR'>IDR</SelectItem>
                      <SelectItem value='KRW'>KRW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Supplier Name</Label>
                  <Input 
                    value={renewableFormData.supplier_name} 
                    onChange={(e) => setRenewableFormData(prev => ({ ...prev, supplier_name: e.target.value }))} 
                    placeholder='Enter supplier name' 
                    className='h-11 border-purple-200 dark:border-purple-800'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Distinction</Label>
                  <Input 
                    value={renewableFormData.distinction} 
                    onChange={(e) => setRenewableFormData(prev => ({ ...prev, distinction: e.target.value }))} 
                    placeholder='REC' 
                    className='h-11 border-purple-200 dark:border-purple-800'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Energy Source</Label>
                  <Select value={renewableFormData.energy_source} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, energy_source: value }))}>
                    <SelectTrigger className='h-11 border-purple-200 dark:border-purple-800'><SelectValue placeholder='Select energy source' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Hydropower'>Hydropower</SelectItem>
                      <SelectItem value='Solar Thermal'>Solar Thermal</SelectItem>
                      <SelectItem value='Solar PV'>Solar PV</SelectItem>
                      <SelectItem value='Wind'>Wind</SelectItem>
                      <SelectItem value='Biomass'>Biomass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Contract Duration</Label>
                  <Input 
                    value={renewableFormData.contract_duration} 
                    onChange={(e) => setRenewableFormData(prev => ({ ...prev, contract_duration: e.target.value }))} 
                    placeholder='e.g., 5 years' 
                    className='h-11 border-purple-200 dark:border-purple-800'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Date Collection</Label>
                  <Select value={renewableFormData.date_collection} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, date_collection: value }))}>
                    <SelectTrigger className='h-11 border-purple-200 dark:border-purple-800'><SelectValue placeholder='Select year' /></SelectTrigger>
                    <SelectContent>
                      {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Certificate Available</Label>
                  <Switch checked={renewableFormData.certificate_availability} onCheckedChange={(checked) => setRenewableFormData(prev => ({ ...prev, certificate_availability: checked }))} />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-purple-800 dark:text-purple-200'>Contract Information</Label>
                  <Select value={renewableFormData.contract_information} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, contract_information: value }))}>
                    <SelectTrigger className='h-11 border-purple-200 dark:border-purple-800'><SelectValue placeholder='Select contract info' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='TIGRs'>TIGRs</SelectItem>
                      <SelectItem value='SLO'>SLO</SelectItem>
                      <SelectItem value='PPA'>PPA</SelectItem>
                      <SelectItem value='REC Purchase'>REC Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className='sticky bottom-0 z-10 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-t border-slate-200 dark:border-slate-700 px-4 sm:px-5 md:px-6 py-4 sm:py-5'>
            <div className='flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                <span>All fields marked with * are required</span>
              </div>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Button 
                  variant='outline' 
                  onClick={() => { setIsRenewableAddOpen(false); setRenewableFormData(emptyRenewableForm) }} 
                  className='w-full sm:w-auto h-11 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                >
                  <X className='w-4 h-4 mr-2' />
                  Cancel
                </Button>
                <Button 
                  onClick={handleRenewableAdd} 
                  disabled={!renewableFormData.entity || !renewableFormData.facility || !renewableFormData.classification} 
                  className='w-full sm:w-auto h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                  title={!renewableFormData.entity ? 'Please select an entity' : !renewableFormData.facility ? 'Please select a facility' : !renewableFormData.classification ? 'Please enter a classification' : ''}
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Save Record
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Renewable Energy Edit Sheet */}
      <Sheet open={isRenewableEditOpen} onOpenChange={setIsRenewableEditOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[1000px] overflow-hidden flex flex-col p-0'>
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Pencil className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                </div>
                <span className='line-clamp-1'>Edit Renewable Energy Record</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                Modify renewable energy purchase data. Emissions are calculated as zero.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <h3 className='text-sm sm:text-base md:text-lg font-semibold'>Basic Information</h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Entity *</Label>
                  <div className='relative'>
                    <div className='h-11 border border-input bg-muted/50 flex items-center px-3 rounded w-full'>
                      <div className='truncate text-sm min-w-0'>
                        {renewableFormData.entity || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Facility *</Label>
                  <Select value={renewableFormData.facility} onValueChange={(value) => {
                    const selectedBiz = businesses.find(b => b.facility === value)
                    setRenewableFormData(prev => ({ 
                      ...prev, 
                      facility: value,
                      entity: selectedBiz?.entity || prev.entity,
                      country: selectedBiz?.country || prev.country
                    }))
                  }}>
                    <SelectTrigger><SelectValue placeholder='Select facility' /></SelectTrigger>
                    <SelectContent>
                      {businesses.map(b => <SelectItem key={`${b.facility}-${b.entity}`} value={b.facility}>{b.facility}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Country</Label>
                  <div className='relative'>
                    <div className='h-11 border border-input bg-muted/50 flex items-center px-3 rounded w-full'>
                      <div className='flex items-center justify-center mr-3 flex-shrink-0'>
                        <CountryFlag country={renewableFormData.country} size={18} />
                      </div>
                      <div className='truncate text-sm min-w-0'>
                        {renewableFormData.country || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Classification *</Label>
                  <Input value={renewableFormData.classification} onChange={(e) => setRenewableFormData(prev => ({ ...prev, classification: e.target.value }))} placeholder='e.g., Solar, Wind, Hydro' />
                </div>

                  <div className='space-y-1.5 hidden'>
                  <Label className='text-xs sm:text-sm font-medium'>Total Energy Usage *</Label>
                  <Input type='text' value={formatNumber(displayTotalEnergyUsage)} readOnly className='bg-muted/10' placeholder='Total from 12 months' />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Unit</Label>
                  <Select value={renewableFormData.unit} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='MWh'>MWh</SelectItem>
                      <SelectItem value='Unit'>Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Supplier Name</Label>
                  <Input value={renewableFormData.supplier_name} onChange={(e) => setRenewableFormData(prev => ({ ...prev, supplier_name: e.target.value }))} placeholder='Enter supplier name' />
                </div>
              </div>
            </div>

            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                </div>
                <h3 className='text-sm sm:text-base md:text-lg font-semibold'>Monthly Energy Data (MWh)</h3>
              </div>

              <div className='space-y-2'>
                <Label className='text-xs sm:text-sm font-medium'>12 Month Energy Usage (January - December)</Label>
                <div className='bg-muted/20 rounded-lg p-3 sm:p-4 border'>
                  <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'>
                    {['january','february','march','april','may','june','july','august','september','october','november','december'].map((month, idx) => (
                      <div key={month} className='space-y-2'>
                        <Label className='text-xs font-medium text-center block capitalize text-muted-foreground'>{month.slice(0,3)}</Label>
                        <Input
                          type='text'
                          value={
                            typeof renewableFormData[month as keyof typeof renewableFormData] === 'string'
                              ? (renewableFormData[month as keyof typeof renewableFormData] as string)
                              : (renewableFormData[month as keyof typeof renewableFormData] || renewableFormData[month as keyof typeof renewableFormData] === 0
                                  ? (() => {
                                      const num = Number(renewableFormData[month as keyof typeof renewableFormData])
                                      return formatNumber(num, num % 1 === 0 ? 0 : 2)
                                    })()
                                  : '')
                          }
                          onChange={(e) => {
                            // keep raw user input while typing (allow comma decimal)
                            setRenewableFormData(prev => ({ ...prev, [month]: e.target.value }))
                          }}
                          onBlur={(e) => {
                            // parse and convert to number on blur for saving
                            const parsed = parseLocaleNumber(e.target.value)
                            setRenewableFormData(prev => ({ ...prev, [month]: parsed }))
                          }}
                          placeholder='0'
                          className='h-9 sm:h-10 text-center font-mono'
                        />
                      </div>
                    ))}
                  </div>
                  <div className='mt-3 pt-3 border-t border-border/50'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium text-muted-foreground'>Total:</span>
                      <span className='font-bold font-mono text-primary'>{formatLocaleDisplay(displayTotalEnergyUsage, displayTotalEnergyUsage % 1 === 0 ? 0 : 4)} {renewableFormData.unit || 'MWh'}</span>
                    </div>
                  </div>
                </div>
              </div>

            <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <h3 className='text-sm sm:text-base md:text-lg font-semibold'>Section Detail Information of Renewable Energy</h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Total Purchase Amount (number)</Label>
                  <Input
                    type='text'
                    value={typeof renewableFormData.total_purchase === 'string'
                      ? renewableFormData.total_purchase
                      : (renewableFormData.total_purchase
                        ? (renewableFormData.currency
                          ? formatCurrency(parseLocaleNumber(renewableFormData.total_purchase as any), renewableFormData.currency as string)
                          : formatNumber(parseLocaleNumber(renewableFormData.total_purchase as any)))
                        : '')}
                    onChange={(e) => {
                      // keep raw input while editing (allow comma decimals)
                      setRenewableFormData(prev => ({ ...prev, total_purchase: e.target.value }))
                    }}
                    onBlur={() => {
                      // parse the locale-formatted string to a number when leaving the field
                      setRenewableFormData(prev => ({ ...prev, total_purchase: parseLocaleNumber(prev.total_purchase) }))
                    }}
                    placeholder='0'
                    className='h-9 sm:h-10 text-center font-mono'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Currency</Label>
                  <Select value={renewableFormData.currency} disabled>
                    <SelectTrigger className='bg-muted/10'><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='IDR'>IDR</SelectItem>
                      <SelectItem value='KRW'>KRW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Supplier Name</Label>
                  <Input value={renewableFormData.supplier_name} onChange={(e) => setRenewableFormData(prev => ({ ...prev, supplier_name: e.target.value }))} placeholder='Enter supplier name' />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Distinction</Label>
                  <Input value={renewableFormData.distinction} onChange={(e) => setRenewableFormData(prev => ({ ...prev, distinction: e.target.value }))} placeholder='REC' />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Energy Source</Label>
                  <Select value={renewableFormData.energy_source} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, energy_source: value }))}>
                    <SelectTrigger><SelectValue placeholder='Select energy source' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Hydropower'>Hydropower</SelectItem>
                      <SelectItem value='Solar Thermal'>Solar Thermal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Contract Duration</Label>
                  <Input value={renewableFormData.contract_duration} onChange={(e) => setRenewableFormData(prev => ({ ...prev, contract_duration: e.target.value }))} placeholder='Enter contract duration' />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Date Collection</Label>
                  <Select value={renewableFormData.date_collection} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, date_collection: value }))}>
                    <SelectTrigger><SelectValue placeholder='Select year' /></SelectTrigger>
                    <SelectContent>
                      {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Certificate Availability</Label>
                  <Select value={renewableFormData.certificate_availability ? 'true' : 'false'} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, certificate_availability: value === 'true' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='true'>Yes</SelectItem>
                      <SelectItem value='false'>No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs sm:text-sm font-medium'>Contract Information</Label>
                  <Select value={renewableFormData.contract_information} onValueChange={(value) => setRenewableFormData(prev => ({ ...prev, contract_information: value }))}>
                    <SelectTrigger><SelectValue placeholder='Select contract info' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='TIGRs'>TIGRs</SelectItem>
                      <SelectItem value='SLO'>SLO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className='border-t bg-muted/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <div className='flex flex-col sm:flex-row gap-2 sm:justify-end'>
              <Button variant='outline' onClick={() => { setIsRenewableEditOpen(false); setEditingRenewableRecord(null); setRenewableFormData(emptyRenewableForm) }} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
                Cancel
              </Button>
              <Button onClick={handleRenewableEditSave} disabled={!renewableFormData.entity || !renewableFormData.facility || !renewableFormData.classification} className='w-full sm:w-auto h-10 sm:h-11 text-sm'>
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Renewable Energy View Sheet */}
      <Sheet open={isRenewableViewOpen} onOpenChange={setIsRenewableViewOpen}>
        <SheetContent className='w-full sm:w-[95vw] max-w-full sm:max-w-[1000px] overflow-hidden flex flex-col p-0'>
          <div className='sticky top-0 z-10 bg-background border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <SheetHeader>
              <SheetTitle className='flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold'>
                <div className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Eye className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                </div>
                <span className='line-clamp-1'>View Renewable Energy Record</span>
              </SheetTitle>
              <SheetDescription className='text-xs sm:text-sm text-muted-foreground mt-1'>
                View renewable energy purchase details.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6'>
            {viewingRenewableRecord && (
              <>
                <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                      <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                      </svg>
                    </div>
                    <h3 className='text-sm sm:text-base md:text-lg font-semibold'>Basic Information</h3>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Entity</Label>
                      <p className='text-sm sm:text-base font-medium'>{
                        viewingRenewableRecord?.entity || 
                        businesses.find(b => b.facility === viewingRenewableRecord?.facility)?.entity || 
                        ''
                      }</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Facility</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.facility || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Country</Label>
                      <div>
                        <CountryFlag country={
                          viewingRenewableRecord?.country || 
                          businesses.find(b => b.facility === viewingRenewableRecord?.facility)?.country
                        } size={20} showLabel={false} />
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Classification</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.classification || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Unit</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.unit || ''}</p>
                    </div>
                  </div>
                </div>

                <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0'>
                      <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                      </svg>
                    </div>
                    <h3 className='text-sm sm:text-base md:text-lg font-semibold'>Monthly Energy Data</h3>
                  </div>

                  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3'>
                    {['january','february','march','april','may','june','july','august','september','october','november','december'].map((month, idx) => (
                      <div key={month} className='space-y-1'>
                        <Label className='text-xs font-medium text-muted-foreground capitalize'>{month.slice(0,3)}</Label>
                        <p className='text-sm font-mono font-medium'>{
                          (() => {
                            const parsed = parseLocaleNumber(viewingRenewableRecord?.[month as keyof typeof viewingRenewableRecord])
                            return formatLocaleDisplay(parsed, parsed % 1 === 0 ? 0 : 4)
                          })()
                        }</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='space-y-3 sm:space-y-4 md:space-y-5 p-3 sm:p-4 md:p-6 bg-card rounded-xl border shadow-sm'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <div className='w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0'>
                      <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                    </div>
                    <h3 className='text-sm sm:text-base md:text-lg font-semibold'>Detail Information</h3>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Total Purchase Amount</Label>
                      <p className='text-sm sm:text-base font-medium'>{formatCurrency(parseLocaleNumber(viewingRenewableRecord?.total_purchase), viewingRenewableRecord?.currency)}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Currency</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.currency || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Supplier Name</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.supplier_name || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Distinction</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.distinction || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Energy Source</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.energy_source || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Contract Duration</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.contract_duration || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Date Collection</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.date_collection || ''}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Certificate Availability</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.certificate_availability ? 'Yes' : 'No'}</p>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs sm:text-sm font-medium text-muted-foreground'>Contract Information</Label>
                      <p className='text-sm sm:text-base font-medium'>{viewingRenewableRecord?.contract_information || ''}</p>
                    </div>
                  </div>
                </div>

                <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800'>
                  <h4 className='font-semibold text-xs sm:text-sm text-green-800 dark:text-green-200 flex items-center gap-2'>
                    <Calculator className='h-4 w-4 text-green-600 dark:text-green-400' />
                    Calculated Results
                  </h4>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                    <div className='p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 rounded border'>
                      <p className='text-xs font-medium text-green-700 dark:text-green-400 mb-1'>Total Energy Usage</p>
                      <p className='text-sm sm:text-base md:text-lg font-bold font-mono'>{formatLocaleDisplay(viewingRenewableRecord?.total_energy_used || 0, 2)}</p>
                      <p className='text-xs text-green-600'>{viewingRenewableRecord?.unit || ''}</p>
                    </div>

                    <div className='p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 rounded border'>
                      <p className='text-xs font-medium text-green-700 dark:text-green-400 mb-1'>Total Purchase</p>
                      <p className='text-sm sm:text-base md:text-lg font-bold font-mono'>{formatLocaleDisplay(viewingRenewableRecord?.total_purchase || 0, 2)}</p>
                      <p className='text-xs text-green-600'>{viewingRenewableRecord?.currency || 'USD'}</p>
                    </div>
                </div>

                <div className='flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>Last updated by</p>
                    <p className='text-sm font-medium'>{viewingRenewableRecord?.updated_by || 'System'}</p>
                  </div>
                  <div className='space-y-1 text-right'>
                    <p className='text-xs font-medium text-muted-foreground'>Last updated</p>
                    <p className='text-sm font-medium'>{formatDateTime(viewingRenewableRecord?.updated_date)}</p>
                  </div>
                </div>
                </div>
              </>
            )}
          </div>

          <div className='border-t bg-muted/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4'>
            <div className='flex flex-col sm:flex-row gap-2 sm:justify-end'>
              <Button onClick={() => setIsRenewableViewOpen(false)} className='w-full sm:w-auto h-10 sm:h-11'>
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </>
  )
}
