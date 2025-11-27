'use client'

import { useState, useEffect, useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { EnvironmentSidebar } from "@/components/environment/environment-sidebar"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Plus, Search, Download, Filter, TrendingUp, ChevronLeft, ChevronRight, Calculator, X, Eye, Pencil, Fuel, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { calculateEmissions, parseMonthlyUsage, formatNumber } from "@/lib/emissionCalculations"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface GHGScopeOneData {
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

// 8 Fuel Types dengan warna yang berbeda dan menarik
const FUEL_COLORS: Record<string, string> = {
  'Automotive gasoline (petrol)': '#3b82f6',      // Blue - Bensin
  'Automotive gasoline/diesel oil': '#ef4444',    // Red - Bensin/Diesel
  'Gas / Diesel oil': '#f59e0b',                  // Orange - Solar/Diesel
  'Liquefied Petroleum Gas (LPG)': '#10b981',     // Green - LPG
  'Industrial Wastes': '#8b5cf6',                 // Purple - Limbah Industri
  'Biodiesel': '#14b8a6',                         // Teal - Biodiesel
  'Hydrofluorocarbons(HFCs)': '#ec4899',          // Pink - HFCs (AC Refrigerant)
  'ETC': '#6366f1',                               // Indigo - Lainnya (HCFC, CFC, dll)
}

// Generate distinct colors for fuel types if needed
const generateColor = (index: number): string => {
  const colors = [
    '#3b82f6', '#ef4444', '#f59e0b', '#10b981',
    '#8b5cf6', '#14b8a6', '#ec4899', '#6366f1'
  ]
  return colors[index % colors.length]
}

export default function ScopeOneContent() {
  const { toast } = useToast()
  const [data, setData] = useState<GHGScopeOneData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterEntity, setFilterEntity] = useState<string>("all")
  const [filterFacility, setFilterFacility] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Chart Filter State
  const [chartFilterEntity, setChartFilterEntity] = useState<string>("all")
  const [chartFilterFacility, setChartFilterFacility] = useState<string>("all")
  const [chartViewMode, setChartViewMode] = useState<"yearly" | "monthly">("yearly")
  const [chartSelectedYear, setChartSelectedYear] = useState<string>("")

  // Add New Record Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GHGScopeOneData | null>(null)

  // View Detail Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingRecord, setViewingRecord] = useState<GHGScopeOneData | null>(null)

  // Edit Modal State - Form Data
  const [editFormData, setEditFormData] = useState({
    id: '',
    entity: '',
    facility: '',
    own_facility: '',
    classification_fuel_rawmaterial: '',
    emissions_activites: '',
    detailed_desc: '',
    types_of_fuel: '',
    detailed_desc_fuel: '',
    date_collection: '',
    january: '0',
    february: '0',
    maret: '0',
    april: '0',
    may: '0',
    june: '0',
    july: '0',
    augustus: '0',
    september: '0',
    october: '0',
    november: '0',
    december: '0',
    unit: '㎥',
  })
  const [editSelectedEntity, setEditSelectedEntity] = useState('')
  const [editSelectedFacility, setEditSelectedFacility] = useState('')
  const [editOpenEntityCombobox, setEditOpenEntityCombobox] = useState(false)
  const [editOpenFacilityCombobox, setEditOpenFacilityCombobox] = useState(false)
  const [editCalculatedPreview, setEditCalculatedPreview] = useState({
    fuel_usage: 0,
    fuel_consumption: 0,
    energy_consumption: 0,
    ghg_emissions: 0,
    kgCO2: 0,
    kgCH4: 0,
    kgN2O: 0
  })
  const [isEditSaving, setIsEditSaving] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [businessData, setBusinessData] = useState<Array<{ entity: string; facility: string }>>([])
  const [selectedEntity, setSelectedEntity] = useState('')
  const [selectedFacility, setSelectedFacility] = useState('')
  const [selectedYear, setSelectedYear] = useState<Date>()
  const [openEntityCombobox, setOpenEntityCombobox] = useState(false)
  const [openFacilityCombobox, setOpenFacilityCombobox] = useState(false)
  const [formData, setFormData] = useState({
    entity: '',
    facility: '',
    own_facility: '',
    classification_fuel_rawmaterial: 'Fuel',
    emissions_activites: '',
    detailed_desc: '',
    types_of_fuel: '',
    detailed_desc_fuel: '',
    date_collection: new Date().getFullYear().toString(),
    january: '0',
    february: '0',
    maret: '0',
    april: '0',
    may: '0',
    june: '0',
    july: '0',
    augustus: '0',
    september: '0',
    october: '0',
    november: '0',
    december: '0',
    unit: '㎥',
  })

  // Calculated fields preview
  const [calculatedPreview, setCalculatedPreview] = useState({
    fuel_usage: 0,
    fuel_consumption: 0,
    energy_consumption: 0,
    ghg_emissions: 0,
    kgCO2: 0,
    kgCH4: 0,
    kgN2O: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ghg/scope-one')
      const result = await response.json()
      setData(result.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate preview when monthly data changes
  useEffect(() => {
    if (formData.types_of_fuel && formData.unit) {
      const monthlyUsage = {
        january: parseFloat(formData.january) || 0,
        february: parseFloat(formData.february) || 0,
        maret: parseFloat(formData.maret) || 0,
        april: parseFloat(formData.april) || 0,
        may: parseFloat(formData.may) || 0,
        june: parseFloat(formData.june) || 0,
        july: parseFloat(formData.july) || 0,
        augustus: parseFloat(formData.augustus) || 0,
        september: parseFloat(formData.september) || 0,
        october: parseFloat(formData.october) || 0,
        november: parseFloat(formData.november) || 0,
        december: parseFloat(formData.december) || 0
      }

      try {
        const result = calculateEmissions(monthlyUsage, formData.types_of_fuel, formData.unit)
        setCalculatedPreview({
          fuel_usage: result.fuelUsage,
          fuel_consumption: result.fuelConsumptionKg,
          energy_consumption: result.energyConsumptionMJ,
          ghg_emissions: result.ghgEmissionsTCO2eq,
          kgCO2: result.kgCO2,
          kgCH4: result.kgCH4,
          kgN2O: result.kgN2O
        })
      } catch (error) {
        console.error('Calculation error:', error)
      }
    }
  }, [formData.january, formData.february, formData.maret, formData.april, formData.may,
      formData.june, formData.july, formData.augustus, formData.september, formData.october,
      formData.november, formData.december, formData.types_of_fuel, formData.unit])

  const handleAddRecord = async () => {
    // Validation
    if (!formData.entity || !formData.facility || !formData.types_of_fuel) {
      toast({
        title: "Validation Error",
        description: "Please fill in Entity, Facility, and Fuel Type",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      // Prepare data with calculations
      const newRecord = {
        ...formData,
        id: `GHG-${Date.now()}`,
        fuel_usage: calculatedPreview.fuel_usage.toString().replace('.', ','),
        'fuel_consumption(Kg)': calculatedPreview.fuel_consumption.toString().replace('.', ','),
        'energy_consumption(MJ)': calculatedPreview.energy_consumption.toString().replace('.', ','),
        'ghg_emissions(tCO2eq)': calculatedPreview.ghg_emissions.toString().replace('.', ','),
        kgCO2: calculatedPreview.kgCO2.toString().replace('.', ','),
        kgCH4: calculatedPreview.kgCH4.toString().replace('.', ','),
        kgN2O: calculatedPreview.kgN2O.toString().replace('.', ','),
        updated_by: 'Current User',
        updated_date: new Date().toISOString().split('T')[0]
      }

      // Simulate API call (replace with actual Supabase integration later)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add to local state
      setData(prevData => [...prevData, newRecord as GHGScopeOneData])

      toast({
        title: "Success!",
        description: "New emission record has been added successfully",
      })

      // Reset form
      setIsAddModalOpen(false)
      resetForm()

    } catch (error) {
      console.error('Error saving record:', error)
      toast({
        title: "Error",
        description: "Failed to save record. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      entity: '',
      facility: '',
      own_facility: '',
      classification_fuel_rawmaterial: 'Fuel',
      emissions_activites: '',
      detailed_desc: '',
      types_of_fuel: '',
      detailed_desc_fuel: '',
      date_collection: new Date().getFullYear().toString(),
      january: '0',
      february: '0',
      maret: '0',
      april: '0',
      may: '0',
      june: '0',
      july: '0',
      augustus: '0',
      september: '0',
      october: '0',
      november: '0',
      december: '0',
      unit: '㎥',
    })
    setCalculatedPreview({
      fuel_usage: 0,
      fuel_consumption: 0,
      energy_consumption: 0,
      ghg_emissions: 0,
      kgCO2: 0,
      kgCH4: 0,
      kgN2O: 0
    })
  }

  const years = useMemo(() => {
    const yearSet = new Set(data.map(item => item.date_collection).filter(Boolean))
    return Array.from(yearSet).sort()
  }, [data])

  const facilities = useMemo(() => {
    const facilitySet = new Set(data.map(item => item.facility).filter(Boolean))
    return Array.from(facilitySet).sort()
  }, [data])

  // Get unique entities from data
  const entities = useMemo(() => {
    const entitySet = new Set(data.map(item => item.entity).filter(Boolean))
    return Array.from(entitySet).sort()
  }, [data])

  // Get facilities filtered by selected entity for chart
  const chartFacilitiesForEntity = useMemo(() => {
    if (chartFilterEntity === "all") {
      // When "all entities" is selected, show all facilities from business data
      const facilitySet = new Set(businessData.map(item => item.facility).filter(Boolean))
      return Array.from(facilitySet).sort()
    }
    // When specific entity is selected, show only facilities related to that entity from business data
    const facilitySet = new Set(
      businessData.filter(item => item.entity === chartFilterEntity)
        .map(item => item.facility)
        .filter(Boolean)
    )
    return Array.from(facilitySet).sort()
  }, [businessData, chartFilterEntity])

  // Get facilities filtered by selected entity for table filter
  const tableFacilitiesForEntity = useMemo(() => {
    if (filterEntity === "all") {
      // When "all entities" is selected, show all facilities from business data
      const facilitySet = new Set(businessData.map(item => item.facility).filter(Boolean))
      return Array.from(facilitySet).sort()
    }
    // When specific entity is selected, show only facilities related to that entity from business data
    const facilitySet = new Set(
      businessData.filter(item => item.entity === filterEntity)
        .map(item => item.facility)
        .filter(Boolean)
    )
    return Array.from(facilitySet).sort()
  }, [businessData, filterEntity])

  const fuelTypes = useMemo(() => {
    const fuelSet = new Set(data.map(item => item.types_of_fuel).filter(Boolean))
    return Array.from(fuelSet).sort()
  }, [data])

  // Get unique own facility options from existing data
  const ownFacilityOptions = useMemo(() => {
    const facilitySet = new Set(data.map(item => item.own_facility).filter(Boolean))
    return Array.from(facilitySet).sort()
  }, [data])

  // Get unique emission activities options from existing data
  const emissionActivitiesOptions = useMemo(() => {
    const activitiesSet = new Set(data.map(item => item.emissions_activites).filter(Boolean))
    return Array.from(activitiesSet).sort()
  }, [data])

  // Helper function to parse numbers with comma as decimal separator
  const parseNumberWithComma = (value: string): number => {
    if (!value) return 0
    // Replace comma with dot for decimal separator (European format)
    return parseFloat(value.replace(',', '.')) || 0
  }

// Fetch business data when component mounts (for filters)
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Fetch from CSV API that reads generalinformation.csv
        const response = await fetch('/api/ghg/general-information')
        const result = await response.json()
        if (result.success && result.data) {
          // Map the data to extract entity and facility
          const mappedData = result.data.map((item: any) => ({
            entity: item.entity,
            facility: item.facility
          }))
          setBusinessData(mappedData)

          // Debug logging
          console.log('Business data loaded:', {
            count: mappedData.length,
            entities: [...new Set(mappedData.map((item: {entity: string, facility: string}) => item.entity))],
            entityFacilityMap: mappedData.reduce((acc: Record<string, string[]>, item: {entity: string, facility: string}) => {
              if (!acc[item.entity]) acc[item.entity] = []
              acc[item.entity].push(item.facility)
              return acc
            }, {} as Record<string, string[]>)
          })

          // Show toast notification if no data is available
          if (!result.data || result.data.length === 0) {
            toast({
              title: "No Business Data Available",
              description: "The general_information_business table is empty. Please populate it with entity and facility data.",
              variant: "destructive",
              duration: 5000,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching business data:', error)
        toast({
          title: "Error Loading Business Data",
          description: "Failed to load entity and facility data. Please try again.",
          variant: "destructive"
        })
      }
    }

    // Fetch business data when component mounts if not already loaded
    if (businessData.length === 0) {
      fetchBusinessData()
    }
  }, [businessData.length, toast])

  // Fetch business data from general_information_business table (for add modal)
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Fetch from CSV API that reads generalinformation.csv
        const response = await fetch('/api/ghg/general-information')
        const result = await response.json()
        if (result.success && result.data) {
          // Map the data to extract entity and facility
          const mappedData = result.data.map((item: any) => ({
            entity: item.entity,
            facility: item.facility
          }))
          setBusinessData(mappedData)

          // Debug logging
          console.log('Business data loaded:', {
            count: mappedData.length,
            entities: [...new Set(mappedData.map((item: {entity: string, facility: string}) => item.entity))],
            entityFacilityMap: mappedData.reduce((acc: Record<string, string[]>, item: {entity: string, facility: string}) => {
              if (!acc[item.entity]) acc[item.entity] = []
              acc[item.entity].push(item.facility)
              return acc
            }, {} as Record<string, string[]>)
          })

          // Show toast notification if no data is available
          if (!result.data || result.data.length === 0) {
            toast({
              title: "No Business Data Available",
              description: "The general_information_business table is empty. Please populate it with entity and facility data.",
              variant: "destructive",
              duration: 5000,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching business data:', error)
        toast({
          title: "Error Loading Business Data",
          description: "Failed to load entity and facility data. Please try again.",
          variant: "destructive"
        })
      }
    }

    if (isAddModalOpen) {
      fetchBusinessData()
    }
  }, [isAddModalOpen, toast])

  // Reset facility selection when entity changes
  useEffect(() => {
    if (selectedEntity && selectedFacility) {
      // Check if the currently selected facility belongs to the selected entity
      const validFacilities = businessData
        .filter(item => item.entity === selectedEntity)
        .map(item => item.facility)

      if (!validFacilities.includes(selectedFacility)) {
        // Reset facility if it's not valid for the selected entity
        setSelectedFacility('')
        setFormData(prev => ({ ...prev, facility: '' }))
      }
    }
  }, [selectedEntity, businessData, selectedFacility])

  // Auto-set unit based on fuel type
  useEffect(() => {
    if (formData.types_of_fuel) {
      let defaultUnit = '㎥' // default

      // Set unit based on fuel type
      if (formData.types_of_fuel === 'Industrial Wastes' ||
          formData.types_of_fuel === 'Hydrofluorocarbons(HFCs)' ||
          formData.types_of_fuel === 'ETC') {
        defaultUnit = 'kg'
      } else if (formData.types_of_fuel === 'Liquefied Petroleum Gas (LPG)') {
        defaultUnit = 'kg'
      } else {
        defaultUnit = '㎥'
      }

      setFormData(prev => ({ ...prev, unit: defaultUnit }))
    }
  }, [formData.types_of_fuel])

  // Calculate statistics
  const statistics = useMemo(() => {
    let filteredData = data

    if (filterYear !== "all") {
      filteredData = filteredData.filter(item => item.date_collection === filterYear)
    }

    if (filterEntity !== "all") {
      filteredData = filteredData.filter(item => item.entity === filterEntity)
    }

    if (filterFacility !== "all") {
      filteredData = filteredData.filter(item => item.facility === filterFacility)
    }

    const totalEmissions = filteredData.reduce((sum, item) => {
      const value = parseNumberWithComma(item['ghg_emissions(tCO2eq)'])
      return sum + value
    }, 0)

    const totalEnergyConsumption = filteredData.reduce((sum, item) => {
      const value = parseNumberWithComma(item['energy_consumption(MJ)'])
      return sum + value
    }, 0)

    const totalFuelConsumption = filteredData.reduce((sum, item) => {
      const value = parseNumberWithComma(item['fuel_consumption(Kg)'])
      return sum + value
    }, 0)

    return {
      totalEmissions: totalEmissions.toFixed(2),
      totalEnergyConsumption: totalEnergyConsumption.toFixed(2),
      totalFuelConsumption: totalFuelConsumption.toFixed(2),
      totalRecords: filteredData.length
    }
  }, [data, filterYear, filterEntity, filterFacility])

  // Prepare chart data - emissions by fuel type and year with totals
  const chartData = useMemo(() => {
    // Apply chart filters
    let filteredData = data

    if (chartFilterEntity !== "all") {
      filteredData = filteredData.filter(item => item.entity === chartFilterEntity)
    }

    if (chartFilterFacility !== "all") {
      filteredData = filteredData.filter(item => item.facility === chartFilterFacility)
    }

    if (chartViewMode === "monthly") {
      // Filter by selected year for monthly view
      if (chartSelectedYear) {
        filteredData = filteredData.filter(item => item.date_collection === chartSelectedYear)
      }

      // Monthly view - show emissions per month for selected year
      const months = [
        { key: 'january', label: 'Jan' },
        { key: 'february', label: 'Feb' },
        { key: 'maret', label: 'Mar' },
        { key: 'april', label: 'Apr' },
        { key: 'may', label: 'May' },
        { key: 'june', label: 'Jun' },
        { key: 'july', label: 'Jul' },
        { key: 'augustus', label: 'Aug' },
        { key: 'september', label: 'Sep' },
        { key: 'october', label: 'Oct' },
        { key: 'november', label: 'Nov' },
        { key: 'december', label: 'Dec' }
      ]

      const dataByMonth: Record<string, Record<string, number>> = {}

      months.forEach(month => {
        dataByMonth[month.label] = {}
      })

      filteredData.forEach(item => {
        const fuelType = item.types_of_fuel
        if (!fuelType) return

        months.forEach(month => {
          const monthValue = parseNumberWithComma(item[month.key as keyof GHGScopeOneData] as string)
          // Convert monthly usage to approximate emissions (simplified calculation based on yearly ratio)
          const yearlyUsage = parseNumberWithComma(item.fuel_usage)
          const yearlyEmissions = parseNumberWithComma(item['ghg_emissions(tCO2eq)'])
          const monthlyEmissions = yearlyUsage > 0 ? (monthValue / yearlyUsage) * yearlyEmissions : 0

          if (!dataByMonth[month.label][fuelType]) {
            dataByMonth[month.label][fuelType] = 0
          }
          dataByMonth[month.label][fuelType] += monthlyEmissions
        })
      })

      return months.map(month => {
        const monthData: any = { year: month.label }
        let total = 0
        fuelTypes.forEach(fuelType => {
          const value = dataByMonth[month.label]?.[fuelType] || 0
          monthData[fuelType] = value
          total += value
        })
        monthData.total = total
        return monthData
      })
    } else {
      // Yearly view (default)
      const dataByYear: Record<string, Record<string, number>> = {}

      filteredData.forEach(item => {
        const year = item.date_collection
        const fuelType = item.types_of_fuel
        const emissions = parseNumberWithComma(item['ghg_emissions(tCO2eq)'])

        if (!year || !fuelType) return

        if (!dataByYear[year]) {
          dataByYear[year] = {}
        }

        if (!dataByYear[year][fuelType]) {
          dataByYear[year][fuelType] = 0
        }

        dataByYear[year][fuelType] += emissions
      })

      return years.map(year => {
        const yearData: any = { year }
        let total = 0
        fuelTypes.forEach(fuelType => {
          const value = dataByYear[year]?.[fuelType] || 0
          yearData[fuelType] = value
          total += value
        })
        yearData.total = total
        return yearData
      })
    }
  }, [data, years, fuelTypes, chartFilterEntity, chartFilterFacility, chartViewMode, chartSelectedYear])

  const chartConfig = useMemo(() => {
    const config: any = {}
    fuelTypes.forEach((fuelType, index) => {
      config[fuelType] = {
        label: fuelType,
        color: FUEL_COLORS[fuelType] || generateColor(index)
      }
    })
    return config
  }, [fuelTypes])

  // Filter data for table
  const filteredTableData = useMemo(() => {
    let filtered = data

    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (filterYear !== "all") {
      filtered = filtered.filter(item => item.date_collection === filterYear)
    }

    if (filterEntity !== "all") {
      filtered = filtered.filter(item => item.entity === filterEntity)
    }

    if (filterFacility !== "all") {
      filtered = filtered.filter(item => item.facility === filterFacility)
    }

    return filtered
  }, [data, searchTerm, filterYear, filterEntity, filterFacility])

  // Pagination
  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTableData, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterYear, filterEntity, filterFacility])

  // Reset table facility filter when table entity changes
  useEffect(() => {
    if (filterEntity !== "all") {
      if (filterFacility !== "all" && !tableFacilitiesForEntity.includes(filterFacility)) {
        setFilterFacility("all")
      }
    }
  }, [filterEntity, tableFacilitiesForEntity, filterFacility])

  // Reset chart facility filter when chart entity changes
  useEffect(() => {
    if (chartFilterEntity !== "all") {
      // Check if current facility is valid for new entity
      if (chartFilterFacility !== "all" && !chartFacilitiesForEntity.includes(chartFilterFacility)) {
        setChartFilterFacility("all")
      }
    }
  }, [chartFilterEntity, chartFacilitiesForEntity, chartFilterFacility])

  // Set default year when switching to monthly view
  useEffect(() => {
    if (chartViewMode === "monthly" && !chartSelectedYear && years.length > 0) {
      // Set to most recent year
      setChartSelectedYear(years[years.length - 1])
    }
  }, [chartViewMode, chartSelectedYear, years])

  // Calculate edit preview when monthly data changes
  useEffect(() => {
    if (editFormData.types_of_fuel && editFormData.unit) {
      const monthlyUsage = {
        january: parseFloat(editFormData.january) || 0,
        february: parseFloat(editFormData.february) || 0,
        maret: parseFloat(editFormData.maret) || 0,
        april: parseFloat(editFormData.april) || 0,
        may: parseFloat(editFormData.may) || 0,
        june: parseFloat(editFormData.june) || 0,
        july: parseFloat(editFormData.july) || 0,
        augustus: parseFloat(editFormData.augustus) || 0,
        september: parseFloat(editFormData.september) || 0,
        october: parseFloat(editFormData.october) || 0,
        november: parseFloat(editFormData.november) || 0,
        december: parseFloat(editFormData.december) || 0
      }

      try {
        const result = calculateEmissions(monthlyUsage, editFormData.types_of_fuel, editFormData.unit)
        setEditCalculatedPreview({
          fuel_usage: result.fuelUsage,
          fuel_consumption: result.fuelConsumptionKg,
          energy_consumption: result.energyConsumptionMJ,
          ghg_emissions: result.ghgEmissionsTCO2eq,
          kgCO2: result.kgCO2,
          kgCH4: result.kgCH4,
          kgN2O: result.kgN2O
        })
      } catch (error) {
        console.error('Edit calculation error:', error)
      }
    }
  }, [editFormData])

  // Populate edit form when editingRecord changes
  useEffect(() => {
    if (editingRecord) {
      setEditFormData({
        id: editingRecord.id,
        entity: editingRecord.entity,
        facility: editingRecord.facility,
        own_facility: editingRecord.own_facility,
        classification_fuel_rawmaterial: editingRecord.classification_fuel_rawmaterial,
        emissions_activites: editingRecord.emissions_activites,
        detailed_desc: editingRecord.detailed_desc,
        types_of_fuel: editingRecord.types_of_fuel,
        detailed_desc_fuel: editingRecord.detailed_desc_fuel,
        date_collection: editingRecord.date_collection,
        january: editingRecord.january?.replace(',', '.') || '0',
        february: editingRecord.february?.replace(',', '.') || '0',
        maret: editingRecord.maret?.replace(',', '.') || '0',
        april: editingRecord.april?.replace(',', '.') || '0',
        may: editingRecord.may?.replace(',', '.') || '0',
        june: editingRecord.june?.replace(',', '.') || '0',
        july: editingRecord.july?.replace(',', '.') || '0',
        augustus: editingRecord.augustus?.replace(',', '.') || '0',
        september: editingRecord.september?.replace(',', '.') || '0',
        october: editingRecord.october?.replace(',', '.') || '0',
        november: editingRecord.november?.replace(',', '.') || '0',
        december: editingRecord.december?.replace(',', '.') || '0',
        unit: editingRecord.unit || '㎥',
      })
      setEditSelectedEntity(editingRecord.entity)
      setEditSelectedFacility(editingRecord.facility)
    }
  }, [editingRecord])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scope One GHG Emissions</h1>
          <p className="text-muted-foreground">Manage and analyze greenhouse gas emissions data</p>
        </div>
      </div>

      {/* Emission Calculation Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            Emission Calculation Method
          </CardTitle>
          <CardDescription className="text-sm mt-2">
            Cara kerja perhitungan emisi GHG Scope One dari input penggunaan bahan bakar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300">Input Data (User Entry):</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Penggunaan bahan bakar per bulan (January - December)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong>fuel_usage</strong> = Total dari semua bulan</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-300">Auto Calculation Output:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">→</span>
                  <span><strong>fuel_consumption(Kg)</strong> - Berdasarkan densitas bahan bakar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">→</span>
                  <span><strong>energy_consumption(MJ)</strong> - Berdasarkan nilai kalor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">→</span>
                  <span><strong>ghg_emissions(tCO2eq)</strong> - Total emisi CO2 ekuivalen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">→</span>
                  <span><strong>kgCO2, kgCH4, kgN2O</strong> - Emisi gas individual</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground">
              <strong className="text-blue-700 dark:text-blue-400">Note:</strong> Setiap jenis bahan bakar memiliki faktor konversi yang berbeda berdasarkan standar IPCC Guidelines for National GHG Inventories.
            </p>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-semibold mb-3 text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Contoh Perhitungan (Automotive Gasoline)
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <p className="text-muted-foreground"><strong>Input:</strong> Fuel Usage = 21.90 ㎥/tahun</p>
                <p className="text-muted-foreground">Density = 0.741 kg/L</p>
                <p className="text-muted-foreground">Calorific Value = 44.3 MJ/kg</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-amber-700 dark:text-amber-400"><strong>Output:</strong></p>
                <p className="text-muted-foreground">• Fuel Consumption = 16,225 kg</p>
                <p className="text-muted-foreground">• Energy = 718,773 MJ</p>
                <p className="text-green-700 dark:text-green-400 font-semibold">• Emissions = 49.99 tCO2eq</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  GHG Emissions by Fuel Type and {chartViewMode === "yearly" ? "Year" : `Month (${chartSelectedYear})`}
                </CardTitle>
                <CardDescription>
                  {chartViewMode === "yearly"
                    ? "Comprehensive view of all 8 fuel types emissions breakdown"
                    : `Monthly emissions breakdown for year ${chartSelectedYear}`
                  }
                </CardDescription>
              </div>
            </div>

            {/* Chart Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filters:</span>
              </div>

              {/* Entity Filter */}
              <Select value={chartFilterEntity} onValueChange={setChartFilterEntity}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map(entity => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Facility Filter */}
              <Select value={chartFilterFacility} onValueChange={setChartFilterFacility}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  {chartFacilitiesForEntity.map(facility => (
                    <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-8 hidden sm:block" />

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">View:</span>
                <div className="flex rounded-lg border p-1 bg-muted/50">
                  <Button
                    variant={chartViewMode === "yearly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartViewMode("yearly")}
                    className="h-7 px-3"
                  >
                    Yearly
                  </Button>
                  <Button
                    variant={chartViewMode === "monthly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartViewMode("monthly")}
                    className="h-7 px-3"
                  >
                    Monthly
                  </Button>
                </div>
              </div>

              {/* Year Selector for Monthly View */}
              {chartViewMode === "monthly" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Year:</span>
                  <Select value={chartSelectedYear} onValueChange={setChartSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Clear Filters Button */}
              {(chartFilterEntity !== "all" || chartFilterFacility !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setChartFilterEntity("all")
                    setChartFilterFacility("all")
                  }}
                  className="h-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {(chartFilterEntity !== "all" || chartFilterFacility !== "all") && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Active:</span>
                {chartFilterEntity !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Entity: {chartFilterEntity}
                    <button
                      onClick={() => setChartFilterEntity("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {chartFilterFacility !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Facility: {chartFilterFacility}
                    <button
                      onClick={() => setChartFilterFacility("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis
                    dataKey="year"
                    className="text-sm font-semibold"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }}
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    label={{
                      value: 'Emissions (tCO2eq)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }
                    }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                    iconSize={12}
                  />
                  {fuelTypes.map((fuelType, index) => (
                    <Bar
                      key={fuelType}
                      dataKey={fuelType}
                      stackId="a"
                      fill={FUEL_COLORS[fuelType] || generateColor(index)}
                      name={fuelType}
                      radius={index === fuelTypes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ChartContainer>

              {/* Fuel Types Legend - All 8 Types */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">All Fuel Types</h4>
                  <Badge variant="secondary" className="font-semibold">{fuelTypes.length} Types</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {fuelTypes.map((fuelType, index) => {
                    const color = FUEL_COLORS[fuelType] || generateColor(index)
                    // Calculate total emissions for this fuel type across all years
                    const totalEmissions = chartData.reduce((sum, yearData) => sum + (yearData[fuelType] || 0), 0)
                    return (
                      <div key={fuelType} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all">
                        <div
                          className="w-5 h-5 rounded flex-shrink-0 border border-border"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" title={fuelType}>
                            {fuelType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {totalEmissions.toFixed(2)} tCO2eq
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Total Emissions Per Year/Month */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Total Emissions per {chartViewMode === "yearly" ? "Year" : "Month"}
                  </h4>

                </div>
                <div className={`grid gap-3 ${chartViewMode === "monthly" ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"}`}>
                  {chartData.map((periodData, index) => {
                    // Expected values from Excel (only for yearly view with no filters)
                    const expectedValues: Record<string, number> = {
                      '2022': 5807,
                      '2023': 5473,
                      '2024': 5416
                    }
                    const expected = chartViewMode === "yearly" && chartFilterEntity === "all" && chartFilterFacility === "all"
                      ? expectedValues[periodData.year]
                      : undefined
                    const difference = expected ? Math.abs(periodData.total - expected) : 0
                    const isAccurate = expected && difference < 1 // Less than 1 tCO2eq difference

                    // Monthly styling with alternating patterns
                    const isMonthly = chartViewMode === "monthly"
                    const isQuarterEnd = isMonthly && (index + 1) % 3 === 0
                    const quarterNumber = Math.floor(index / 3) + 1

                    return (
                      <div
                        key={periodData.year}
                        className={`
                          flex flex-col items-center p-3 rounded-lg transition-all duration-200
                          ${isAccurate
                            ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                            : isMonthly
                              ? `border ${isQuarterEnd
                                  ? 'border-foreground/20 bg-foreground/[0.03] dark:bg-foreground/[0.05]'
                                  : 'border-border bg-background'
                                } hover:border-foreground/30 hover:shadow-sm`
                              : 'bg-muted/50 hover:bg-muted border border-transparent'
                          }
                        `}
                      >
                        <span className={`text-xs font-medium mb-1 ${isMonthly ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                          {chartViewMode === "yearly" ? `Year ${periodData.year}` : periodData.year}
                        </span>
                        <span className={`font-bold text-foreground ${isMonthly ? 'text-base' : 'text-lg'}`}>
                          {periodData.total.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">tCO2eq</span>
                        {expected && (
                          <span className={`text-xs mt-1 ${isAccurate ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {isAccurate ? '✓ Verified' : `Δ ${difference.toFixed(2)}`}
                          </span>
                        )}
                        {isMonthly && isQuarterEnd && (
                          <span className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide">
                            Q{quarterNumber}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Quarterly Summary for Monthly View */}
                {chartViewMode === "monthly" && (
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quarterly Summary</h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Q1', months: ['Jan', 'Feb', 'Mar'], color: 'from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50' },
                        { label: 'Q2', months: ['Apr', 'May', 'Jun'], color: 'from-gray-50 to-zinc-50 dark:from-gray-900/50 dark:to-zinc-900/50' },
                        { label: 'Q3', months: ['Jul', 'Aug', 'Sep'], color: 'from-zinc-50 to-neutral-50 dark:from-zinc-900/50 dark:to-neutral-900/50' },
                        { label: 'Q4', months: ['Oct', 'Nov', 'Dec'], color: 'from-neutral-50 to-stone-50 dark:from-neutral-900/50 dark:to-stone-900/50' }
                      ].map((quarter, qIndex) => {
                        const quarterTotal = chartData
                          .filter(d => quarter.months.includes(d.year))
                          .reduce((sum, d) => sum + d.total, 0)

                        return (
                          <div
                            key={quarter.label}
                            className={`
                              relative overflow-hidden rounded-lg border border-foreground/10
                              bg-gradient-to-br ${quarter.color}
                              p-4 transition-all duration-200 hover:border-foreground/20 hover:shadow-md
                            `}
                          >
                            <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 bg-foreground/[0.02] rounded-full" />
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-foreground">{quarter.label}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  {quarter.months.join(' • ')}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-foreground">{quarterTotal.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">tCO2eq</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table Card with Statistics */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Emissions Data Records</CardTitle>
                <CardDescription>View and manage all scope one emissions records</CardDescription>
              </div>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Integrated Statistics */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/30">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Total Emissions</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">{statistics.totalEmissions}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">tCO2eq</p>
                </div>
                <div className="p-3 rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Energy Consumption</p>
                  <p className="text-xl font-bold text-amber-800 dark:text-amber-300">{parseFloat(statistics.totalEnergyConsumption).toLocaleString()}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">MJ</p>
                </div>
                <div className="p-3 rounded-lg border bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">Fuel Consumption</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-300">{parseFloat(statistics.totalFuelConsumption).toLocaleString()}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-500">Kg</p>
                </div>
                <div className="p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Total Records</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{statistics.totalRecords}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">entries</p>
                </div>
              </div>
            )}

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filters:</span>
              </div>
              <div className="relative flex-1 md:flex-none md:w-56">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map(entity => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFacility} onValueChange={setFilterFacility}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  {tableFacilitiesForEntity.map(facility => (
                    <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(filterYear !== "all" || filterEntity !== "all" || filterFacility !== "all" || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterYear("all")
                    setFilterEntity("all")
                    setFilterFacility("all")
                    setSearchTerm("")
                  }}
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Fuel Usage
                      <Fuel className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Emissions (tCO2eq)
                      <Calculator className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.facility}</TableCell>
                      <TableCell>
                        <Badge variant="outline" style={{ borderColor: FUEL_COLORS[item.types_of_fuel] }}>
                          {item.types_of_fuel}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.date_collection}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{item.own_facility}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono text-sm">
                            {parseNumberWithComma(item.fuel_usage).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {parseNumberWithComma(item['ghg_emissions(tCO2eq)']).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              setEditingRecord(item)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 transition-colors"
                            onClick={() => {
                              setViewingRecord(item)
                              setIsViewModalOpen(true)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filteredTableData.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTableData.length)} of {filteredTableData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-9 h-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1">...</span>
                    }
                    return null
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Record Sheet */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Record
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[95vw] max-w-[1400px] sm:max-w-[1400px] overflow-hidden flex flex-col p-0">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                Add New Emission Record
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Enter monthly fuel usage data. Emissions will be calculated automatically based on IPCC standards.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-5 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="entity" className="text-sm font-medium">Entity *</Label>
                    <Popover open={openEntityCombobox} onOpenChange={setOpenEntityCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openEntityCombobox}
                          className="w-full justify-between h-10"
                        >
                          <span className="truncate text-left">{selectedEntity || "Select entity..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-[320px] overflow-auto">
                        <Command>
                          <CommandInput placeholder="Search entity..." />
                          <CommandList>
                            <CommandEmpty>
                              {businessData.length === 0 ? "No business data available in database." : "No entity found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {Array.from(new Set(businessData.map(item => item.entity))).map((entity) => (
                                <CommandItem
                                  key={entity}
                                  value={entity}
                                  onSelect={(currentValue) => {
                                    setSelectedEntity(currentValue === selectedEntity ? "" : currentValue)
                                    setFormData({ ...formData, entity: currentValue })
                                    setOpenEntityCombobox(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedEntity === entity ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="truncate">{entity}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {businessData.length === 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400">No business data available.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facility" className="text-sm font-medium">Facility *</Label>
                    <Popover open={openFacilityCombobox} onOpenChange={setOpenFacilityCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openFacilityCombobox}
                          className="w-full justify-between h-10"
                          disabled={!selectedEntity}
                        >
                          <span className="truncate text-left">{selectedFacility || (selectedEntity ? "Select facility..." : "Select entity first")}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-[320px] overflow-auto">
                        <Command>
                          <CommandInput placeholder="Search facility..." />
                          <CommandList>
                            <CommandEmpty>
                              {businessData.length === 0
                                ? "No business data available in database."
                                : selectedEntity
                                  ? "No facility found for selected entity."
                                  : "Please select an entity first."
                              }
                            </CommandEmpty>
                            <CommandGroup>
                              {businessData
                                .filter(item => !selectedEntity || item.entity === selectedEntity)
                                .map((item, index) => (
                                  <CommandItem
                                    key={`${item.entity}-${item.facility}-${index}`}
                                    value={item.facility}
                                    onSelect={(currentValue) => {
                                      setSelectedFacility(currentValue === selectedFacility ? "" : currentValue)
                                      setFormData({ ...formData, facility: currentValue })
                                      setOpenFacilityCombobox(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedFacility === item.facility ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="truncate">{item.facility}</span>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {!selectedEntity && businessData.length > 0 && (
                      <p className="text-xs text-muted-foreground">Select entity first.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="own_facility" className="text-sm font-medium">Lease Status</Label>
                    <Select value={formData.own_facility} onValueChange={(value) => setFormData({ ...formData, own_facility: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select lease status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownFacilityOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">Year *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !selectedYear && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span>{selectedYear ? selectedYear.getFullYear() : "Pick a year"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedYear}
                          onSelect={(date) => {
                            setSelectedYear(date)
                            if (date) {
                              setFormData({ ...formData, date_collection: date.getFullYear().toString() })
                            }
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Fuel Information */}
              <div className="space-y-5 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Fuel Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="types_of_fuel" className="text-sm font-medium">
                      Type of Fuel <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.types_of_fuel} onValueChange={(value) => setFormData({ ...formData, types_of_fuel: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[320px] overflow-auto">
                        {Object.keys(FUEL_COLORS).map(fuelType => (
                          <SelectItem key={fuelType} value={fuelType}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: FUEL_COLORS[fuelType] }} />
                              <span className="truncate">{fuelType}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="own_facility_fuel" className="text-sm font-medium">Own Facility</Label>
                    <Select value={formData.own_facility} onValueChange={(value) => setFormData({ ...formData, own_facility: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select Specific Criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownFacilityOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classification_fuel_rawmaterial" className="text-sm font-medium">Classification Fuel</Label>
                    <Select value={formData.classification_fuel_rawmaterial} onValueChange={(value) => setFormData({ ...formData, classification_fuel_rawmaterial: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select fuel classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Raw Material">Raw Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emissions_activites" className="text-sm font-medium">Emission Activities</Label>
                    <Select value={formData.emissions_activites} onValueChange={(value) => setFormData({ ...formData, emissions_activites: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select emission activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {emissionActivitiesOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detailed_description" className="text-sm font-medium">Detailed Description</Label>
                    <Input
                      id="detailed_description"
                      placeholder="Enter detailed description of fuel usage"
                      value={formData.detailed_desc || ''}
                      onChange={(e) => setFormData({ ...formData, detailed_desc: e.target.value })}
                      className="w-full h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-medium">Unit (Auto)</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="㎥">㎥ (Cubic Meter)</SelectItem>
                        <SelectItem value="L">L (Liter)</SelectItem>
                        <SelectItem value="kg">kg (Kilogram)</SelectItem>
                        <SelectItem value="ton">ton (Ton)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Auto-selected based on fuel</p>
                  </div>
                </div>
              </div>

              {/* Monthly Usage Data */}
              <div className="space-y-5 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Monthly Fuel Usage</h3>
                    <p className="text-sm text-muted-foreground">Enter consumption data for each month ({formData.unit})</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { key: 'january', label: 'Jan', quarter: 'Q1' },
                    { key: 'february', label: 'Feb', quarter: 'Q1' },
                    { key: 'maret', label: 'Mar', quarter: 'Q1' },
                    { key: 'april', label: 'Apr', quarter: 'Q2' },
                    { key: 'may', label: 'May', quarter: 'Q2' },
                    { key: 'june', label: 'Jun', quarter: 'Q2' },
                    { key: 'july', label: 'Jul', quarter: 'Q3' },
                    { key: 'augustus', label: 'Aug', quarter: 'Q3' },
                    { key: 'september', label: 'Sep', quarter: 'Q3' },
                    { key: 'october', label: 'Oct', quarter: 'Q4' },
                    { key: 'november', label: 'Nov', quarter: 'Q4' },
                    { key: 'december', label: 'Dec', quarter: 'Q4' },
                  ].map(month => (
                    <div key={month.key} className="space-y-1.5">
                      <Label htmlFor={month.key} className="text-xs font-medium text-center block text-muted-foreground">
                        {month.label}
                      </Label>
                      <Input
                        id={month.key}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData[month.key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [month.key]: e.target.value })}
                        className="text-sm h-10 text-center font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center pt-2">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      Q1 (Jan-Mar)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      Q2 (Apr-Jun)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      Q3 (Jul-Sep)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      Q4 (Oct-Dec)
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Preview */}
              {formData.types_of_fuel && (
                <div className="space-y-5 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                        <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">Calculated Emissions</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Real-time emissions (IPCC)</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 flex-shrink-0">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fuel Usage</p>
                      <p className="text-lg font-bold">{calculatedPreview.fuel_usage.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formData.unit}</p>
                    </div>
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fuel Consumption</p>
                      <p className="text-lg font-bold">{calculatedPreview.fuel_consumption.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className="text-xs text-muted-foreground">Kg</p>
                    </div>
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Energy</p>
                      <p className="text-lg font-bold">{calculatedPreview.energy_consumption.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className="text-xs text-muted-foreground">MJ</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center">
                      <p className="text-xs text-green-700 dark:text-green-300 mb-1">GHG Emissions</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{calculatedPreview.ghg_emissions.toFixed(2)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">tCO2eq</p>
                    </div>
                  </div>

                  {/* Gas Breakdown */}
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-3">Individual Gas Emissions (Kg)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">CO₂</span>
                        </div>
                        <span className="font-mono font-medium">{calculatedPreview.kgCO2.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">CH₄</span>
                        </div>
                        <span className="font-mono font-medium">{calculatedPreview.kgCH4.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">N₂O</span>
                        </div>
                        <span className="font-mono font-medium">{calculatedPreview.kgN2O.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

<SheetFooter className="flex flex-col sm:flex-row gap-3 border-t bg-muted/30 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ml-auto">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSaving} size="lg" className="flex-1 sm:flex-none">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleAddRecord} disabled={isSaving || !formData.entity || !formData.facility || !formData.types_of_fuel} size="lg" className="flex-1 sm:flex-none">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

{/* View Detail Sheet */}
      <Sheet open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <SheetContent className="w-[95vw] max-w-[900px] sm:max-w-[900px] overflow-hidden flex flex-col p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Emission Record Details
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                {viewingRecord && `Record ID: ${viewingRecord.id} | Year: ${viewingRecord.date_collection}`}
              </SheetDescription>
            </SheetHeader>
            </div>

            {/* Content */}
            {viewingRecord && (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Entity</span>
                        <span className="text-sm font-medium text-right max-w-[200px]">{viewingRecord.entity}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Facility</span>
                        <span className="text-sm font-medium text-right max-w-[200px]">{viewingRecord.facility}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Lease Status</span>
                        <span className="text-sm font-medium">{viewingRecord.own_facility || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Year</span>
                        <span className="text-sm font-medium">{viewingRecord.date_collection}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Fuel Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Fuel Type</span>
                        <Badge variant="outline" style={{ borderColor: FUEL_COLORS[viewingRecord.types_of_fuel] }}>
                          {viewingRecord.types_of_fuel}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Own Facility</span>
                        <span className="text-sm font-medium">{viewingRecord.own_facility || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Classification</span>
                        <span className="text-sm font-medium">{viewingRecord.classification_fuel_rawmaterial || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Emission Activities</span>
                        <span className="text-sm font-medium text-right max-w-[150px]">{viewingRecord.emissions_activites || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Detailed Description</span>
                        <span className="text-sm font-medium text-right max-w-[200px]">{viewingRecord.detailed_desc || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Unit</span>
                        <span className="text-sm font-medium">{viewingRecord.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Usage */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Monthly Fuel Usage ({viewingRecord.unit})
                  </h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {[
                      { key: 'january', label: 'Jan' },
                      { key: 'february', label: 'Feb' },
                      { key: 'maret', label: 'Mar' },
                      { key: 'april', label: 'Apr' },
                      { key: 'may', label: 'May' },
                      { key: 'june', label: 'Jun' },
                      { key: 'july', label: 'Jul' },
                      { key: 'augustus', label: 'Aug' },
                      { key: 'september', label: 'Sep' },
                      { key: 'october', label: 'Oct' },
                      { key: 'november', label: 'Nov' },
                      { key: 'december', label: 'Dec' }
                    ].map(month => (
                      <div key={month.key} className="p-2 bg-background rounded border text-center">
                        <p className="text-xs text-muted-foreground mb-1">{month.label}</p>
                        <p className="text-sm font-mono font-medium">
                          {parseNumberWithComma(viewingRecord[month.key as keyof GHGScopeOneData] as string).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emission Results */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 flex items-center gap-2 mb-4">
                    <Calculator className="h-4 w-4" />
                    Calculated Emissions
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fuel Usage</p>
                      <p className="text-lg font-bold">{parseNumberWithComma(viewingRecord.fuel_usage).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{viewingRecord.unit}</p>
                    </div>
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fuel Consumption</p>
                      <p className="text-lg font-bold">{parseNumberWithComma(viewingRecord['fuel_consumption(Kg)']).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className="text-xs text-muted-foreground">Kg</p>
                    </div>
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Energy</p>
                      <p className="text-lg font-bold">{parseNumberWithComma(viewingRecord['energy_consumption(MJ)']).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className="text-xs text-muted-foreground">MJ</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center">
                      <p className="text-xs text-green-700 dark:text-green-300 mb-1">GHG Emissions</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{parseNumberWithComma(viewingRecord['ghg_emissions(tCO2eq)']).toFixed(2)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">tCO2eq</p>
                    </div>
                  </div>

                  {/* Gas Breakdown */}
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-3">Individual Gas Emissions (Kg)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">CO₂</span>
                        </div>
                        <span className="font-mono font-medium">{parseNumberWithComma(viewingRecord.kgCO2).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">CH₄</span>
                        </div>
                        <span className="font-mono font-medium">{parseNumberWithComma(viewingRecord.kgCH4).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">N₂O</span>
                        </div>
                        <span className="font-mono font-medium">{parseNumberWithComma(viewingRecord.kgN2O).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  <span>Updated by: {viewingRecord.updated_by || 'N/A'}</span>
                  <span>Last updated: {viewingRecord.updated_date || 'N/A'}</span>
                </div>
              </div>
            )}

<SheetFooter className="border-t bg-muted/30 px-6 py-4">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewModalOpen(false)
                if (viewingRecord) {
                  setEditingRecord(viewingRecord)
                  setIsEditModalOpen(true)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Record
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

{/* Edit Record Sheet - Same structure as Add Sheet */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent className="w-[95vw] max-w-[1400px] sm:max-w-[1400px] overflow-hidden flex flex-col p-0">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Edit Emission Record
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Edit record ID: {editFormData.id}. Update the data below. Emissions will be recalculated automatically.
              </SheetDescription>
            </SheetHeader>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-5 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit_entity" className="text-sm font-medium">Entity *</Label>
                    <Popover open={editOpenEntityCombobox} onOpenChange={setEditOpenEntityCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={editOpenEntityCombobox}
                          className="w-full justify-between h-10"
                        >
                          <span className="truncate text-left">{editSelectedEntity || "Select entity..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-[320px] overflow-auto">
                        <Command>
                          <CommandInput placeholder="Search entity..." />
                          <CommandList>
                            <CommandEmpty>No entity found.</CommandEmpty>
                            <CommandGroup>
                              {Array.from(new Set(businessData.map(item => item.entity))).map((entity) => (
                                <CommandItem
                                  key={entity}
                                  value={entity}
                                  onSelect={(currentValue) => {
                                    setEditSelectedEntity(currentValue === editSelectedEntity ? "" : currentValue)
                                    setEditFormData({ ...editFormData, entity: currentValue })
                                    setEditOpenEntityCombobox(false)
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", editSelectedEntity === entity ? "opacity-100" : "opacity-0")} />
                                  <span className="truncate">{entity}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_facility" className="text-sm font-medium">Facility *</Label>
                    <Popover open={editOpenFacilityCombobox} onOpenChange={setEditOpenFacilityCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={editOpenFacilityCombobox}
                          className="w-full justify-between h-10"
                          disabled={!editSelectedEntity}
                        >
                          <span className="truncate text-left">{editSelectedFacility || (editSelectedEntity ? "Select facility..." : "Select entity first")}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-[320px] overflow-auto">
                        <Command>
                          <CommandInput placeholder="Search facility..." />
                          <CommandList>
                            <CommandEmpty>No facility found for selected entity.</CommandEmpty>
                            <CommandGroup>
                              {businessData
                                .filter(item => !editSelectedEntity || item.entity === editSelectedEntity)
                                .map((item, index) => (
                                  <CommandItem
                                    key={`${item.entity}-${item.facility}-${index}`}
                                    value={item.facility}
                                    onSelect={(currentValue) => {
                                      setEditSelectedFacility(currentValue === editSelectedFacility ? "" : currentValue)
                                      setEditFormData({ ...editFormData, facility: currentValue })
                                      setEditOpenFacilityCombobox(false)
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", editSelectedFacility === item.facility ? "opacity-100" : "opacity-0")} />
                                    <span className="truncate">{item.facility}</span>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_own_facility" className="text-sm font-medium">Lease Status</Label>
                    <Select value={editFormData.own_facility} onValueChange={(value) => setEditFormData({ ...editFormData, own_facility: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select lease status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownFacilityOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_year" className="text-sm font-medium">Year *</Label>
                    <Input
                      value={editFormData.date_collection}
                      onChange={(e) => setEditFormData({ ...editFormData, date_collection: e.target.value })}
                      placeholder="e.g., 2024"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Fuel Information */}
              <div className="space-y-5 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Fuel Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit_types_of_fuel" className="text-sm font-medium">Type of Fuel <span className="text-red-500">*</span></Label>
                    <Select value={editFormData.types_of_fuel} onValueChange={(value) => setEditFormData({ ...editFormData, types_of_fuel: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[320px] overflow-auto">
                        {Object.keys(FUEL_COLORS).map(fuelType => (
                          <SelectItem key={fuelType} value={fuelType}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: FUEL_COLORS[fuelType] }} />
                              <span className="truncate">{fuelType}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_own_facility_fuel" className="text-sm font-medium">Own Facility</Label>
                    <Select value={editFormData.own_facility} onValueChange={(value) => setEditFormData({ ...editFormData, own_facility: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownFacilityOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_classification_fuel_rawmaterial" className="text-sm font-medium">Classification Fuel</Label>
                    <Select value={editFormData.classification_fuel_rawmaterial} onValueChange={(value) => setEditFormData({ ...editFormData, classification_fuel_rawmaterial: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select fuel classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Raw Material">Raw Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_emissions_activites" className="text-sm font-medium">Emission Activities</Label>
                    <Select value={editFormData.emissions_activites} onValueChange={(value) => setEditFormData({ ...editFormData, emissions_activites: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select emission activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {emissionActivitiesOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_detailed_description" className="text-sm font-medium">Detailed Description</Label>
                    <Input
                      id="edit_detailed_description"
                      placeholder="Enter detailed description of fuel usage"
                      value={editFormData.detailed_desc || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, detailed_desc: e.target.value })}
                      className="w-full h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_unit" className="text-sm font-medium">Unit</Label>
                    <Select value={editFormData.unit} onValueChange={(value) => setEditFormData({ ...editFormData, unit: value })}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="㎥">㎥ (Cubic Meter)</SelectItem>
                        <SelectItem value="L">L (Liter)</SelectItem>
                        <SelectItem value="kg">kg (Kilogram)</SelectItem>
                        <SelectItem value="ton">ton (Ton)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Monthly Usage Data */}
              <div className="space-y-5 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Monthly Fuel Usage</h3>
                    <p className="text-sm text-muted-foreground">Enter consumption data for each month ({editFormData.unit})</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { key: 'january', label: 'Jan' },
                    { key: 'february', label: 'Feb' },
                    { key: 'maret', label: 'Mar' },
                    { key: 'april', label: 'Apr' },
                    { key: 'may', label: 'May' },
                    { key: 'june', label: 'Jun' },
                    { key: 'july', label: 'Jul' },
                    { key: 'augustus', label: 'Aug' },
                    { key: 'september', label: 'Sep' },
                    { key: 'october', label: 'Oct' },
                    { key: 'november', label: 'Nov' },
                    { key: 'december', label: 'Dec' },
                  ].map(month => (
                    <div key={month.key} className="space-y-1.5">
                      <Label htmlFor={`edit_${month.key}`} className="text-xs font-medium text-center block text-muted-foreground">
                        {month.label}
                      </Label>
                      <Input
                        id={`edit_${month.key}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editFormData[month.key as keyof typeof editFormData]}
                        onChange={(e) => setEditFormData({ ...editFormData, [month.key]: e.target.value })}
                        className="text-sm h-10 text-center font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Calculation Preview */}
              {editFormData.types_of_fuel && (
                <div className="space-y-5 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                        <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">Calculated Emissions</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">Real-time emissions (IPCC)</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 flex-shrink-0">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fuel Usage</p>
                      <p className="text-lg font-bold">{editCalculatedPreview.fuel_usage.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{editFormData.unit}</p>
                    </div>
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Fuel Consumption</p>
                      <p className="text-lg font-bold">{editCalculatedPreview.fuel_consumption.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className="text-xs text-muted-foreground">Kg</p>
                    </div>
                    <div className="p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border text-center">
                      <p className="text-xs text-muted-foreground mb-1">Energy</p>
                      <p className="text-lg font-bold">{editCalculatedPreview.energy_consumption.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className="text-xs text-muted-foreground">MJ</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600 text-center">
                      <p className="text-xs text-green-700 dark:text-green-300 mb-1">GHG Emissions</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{editCalculatedPreview.ghg_emissions.toFixed(2)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">tCO2eq</p>
                    </div>
                  </div>

                  {/* Gas Breakdown */}
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-3">Individual Gas Emissions (Kg)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">CO₂</span>
                        </div>
                        <span className="font-mono font-medium">{editCalculatedPreview.kgCO2.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">CH₄</span>
                        </div>
                        <span className="font-mono font-medium">{editCalculatedPreview.kgCH4.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded border">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">N₂O</span>
                        </div>
                        <span className="font-mono font-medium">{editCalculatedPreview.kgN2O.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="flex flex-col sm:flex-row gap-3 border-t bg-muted/30 px-6 py-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ml-auto">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isEditSaving} size="lg" className="flex-1 sm:flex-none">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setIsEditSaving(true)
                    try {
                      // Update the record in the data array
                      const updatedRecord = {
                        ...editFormData,
                        fuel_usage: editCalculatedPreview.fuel_usage.toString().replace('.', ','),
                        'fuel_consumption(Kg)': editCalculatedPreview.fuel_consumption.toString().replace('.', ','),
                        'energy_consumption(MJ)': editCalculatedPreview.energy_consumption.toString().replace('.', ','),
                        'ghg_emissions(tCO2eq)': editCalculatedPreview.ghg_emissions.toString().replace('.', ','),
                        kgCO2: editCalculatedPreview.kgCO2.toString().replace('.', ','),
                        kgCH4: editCalculatedPreview.kgCH4.toString().replace('.', ','),
                        kgN2O: editCalculatedPreview.kgN2O.toString().replace('.', ','),
                        updated_by: 'Current User',
                        updated_date: new Date().toISOString().split('T')[0]
                      }

                      await new Promise(resolve => setTimeout(resolve, 1000))

                      setData(prevData => prevData.map(item =>
                        item.id === editFormData.id ? updatedRecord as GHGScopeOneData : item
                      ))

                      toast({
                        title: "Success!",
                        description: `Record ${editFormData.id} has been updated successfully.`,
                      })

                      setIsEditModalOpen(false)
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update record. Please try again.",
                        variant: "destructive"
                      })
                    } finally {
                      setIsEditSaving(false)
                    }
                  }}
                  disabled={isEditSaving || !editFormData.entity || !editFormData.facility || !editFormData.types_of_fuel}
                  size="lg"
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                >
                  {isEditSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
}