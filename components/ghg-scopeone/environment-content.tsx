'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

const fuelDensities: Record<string, number> = {
  'Automotive gasoline (petrol)': 750, // kg/m³
  'Biodiesel': 880,
  'Liquefied Petroleum Gas (LPG)': 520,
  'Gas / Diesel oil': 850,
  'Automotive gasoline/diesel oil': 800,
  'Industrial Wastes': 1000,
  'Hydrofluorocarbons(HFCs)': 1000,
  'ETC': 1000,
}

const fuelCalorific: Record<string, number> = {
  'Automotive gasoline (petrol)': 44, // MJ/kg
  'Biodiesel': 37,
  'Liquefied Petroleum Gas (LPG)': 46,
  'Gas / Diesel oil': 43,
  'Automotive gasoline/diesel oil': 43.5,
  'Industrial Wastes': 20,
  'Hydrofluorocarbons(HFCs)': 0, // no combustion
  'ETC': 40,
}

const emissionFactor = 0.0027 // kgCO2eq/MJ, approximate for fossil fuels

type Scope1Record = {
  no: number
  entity_name?: string
  facility_name?: string
  equipment_name?: string
  classification?: string
  activity?: string
  description?: string
  fuel_type?: string
  fuel_detail?: string
  unit?: string
  data_year?: number
  combustion_type?: string
  total_usage?: number
  fuel_consumption_kg?: number
  energy_consumption_mj?: number
  ghg_emissions?: number
  emission_2022?: number
  emission_2023?: number
  emission_2024?: number
  monthly?: number[]
}

export default function EnvironmentContent() {
  const [data, setData] = useState<Scope1Record[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<Scope1Record>>({
    no: 0,
    entity_name: '',
    facility_name: '',
    equipment_name: '',
    classification: 'Fuel',
    activity: '',
    fuel_type: '',
    unit: 'kg',
    data_year: new Date().getFullYear(),
    total_usage: 0,
    monthly: Array(12).fill(0),
    fuel_consumption_kg: 0,
    energy_consumption_mj: 0,
    ghg_emissions: 0,
  })

  useEffect(() => {
    fetch('/processed_scope1.json')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const filteredData = useMemo(() => {
    const result = data.filter(item => {
      const matchesSearch = 
        item.entity_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.facility_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.equipment_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.fuel_type?.toLowerCase().includes(search.toLowerCase())
      
      const matchesYear = filterYear === 'all' || item.data_year?.toString() === filterYear
      const matchesEntity = filterEntity === 'all' || item.entity_name === filterEntity

      return matchesSearch && matchesYear && matchesEntity
    })
    setCurrentPage(1) // Reset to first page when filters change
    return result
  }, [data, search, filterYear, filterEntity])

  const entities = useMemo(() => {
    const unique = [...new Set(data.map(item => item.entity_name).filter((name): name is string => Boolean(name)))]
    return unique
  }, [data])

  const facilities = useMemo(() => {
    const unique = [...new Set(data.map(item => item.facility_name).filter((name): name is string => Boolean(name)))]
    return unique
  }, [data])

  const filteredFacilities = useMemo(() => {
    if (!newRecord.entity_name) return []
    const unique = [...new Set(data.filter(item => item.entity_name === newRecord.entity_name).map(item => item.facility_name).filter((name): name is string => Boolean(name)))]
    return unique
  }, [data, newRecord.entity_name])

  const equipments = useMemo(() => {
    const unique = [...new Set(data.map(item => item.equipment_name).filter((name): name is string => Boolean(name)))]
    return unique
  }, [data])

  const fuelTypes = useMemo(() => {
    const unique = [...new Set(data.map(item => item.fuel_type).filter((name): name is string => Boolean(name)))]
    return unique
  }, [data])

  const activities = useMemo(() => {
    const unique = [...new Set(data.map(item => item.activity).filter((name): name is string => Boolean(name)))]
    return unique
  }, [data])

  const getUnitsForFuelType = (fuelType: string) => {
    const units = data
      .filter(item => item.fuel_type === fuelType && item.unit)
      .map(item => item.unit)
      .filter((unit, index, arr) => arr.indexOf(unit) === index) // unique
    return units.length > 0 ? units[0] : 'kg' // default to kg if no data
  }

  const chartData = useMemo(() => {
    const byYear = { 2022: 0, 2023: 0, 2024: 0 }
    filteredData.forEach(item => {
      byYear[2022] += item.emission_2022 || 0
      byYear[2023] += item.emission_2023 || 0
      byYear[2024] += item.emission_2024 || 0
    })
    return [
      { year: '2022', emissions: byYear[2022] },
      { year: '2023', emissions: byYear[2023] },
      { year: '2024', emissions: byYear[2024] }
    ]
  }, [filteredData])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const calculateEmissions = (record: Partial<Scope1Record>) => {
    const monthlyUsage = record.monthly || []
    const fuelUsage = monthlyUsage.reduce((a,b)=>a+b,0)
    const fuelType = record.fuel_type || ''
    const unit = record.unit || 'kg'
    const density = fuelDensities[fuelType] || 1000
    const calorific = fuelCalorific[fuelType] || 40
    
    // Convert to kg based on unit
    let fuelConsumptionKg = fuelUsage
    if (unit === '㎥' || unit === 'm³') {
      fuelConsumptionKg = fuelUsage * density
    } else if (unit === 'kg') {
      fuelConsumptionKg = fuelUsage
    } // else assume kg
    
    // Energy consumption (MJ)
    const energyMj = fuelConsumptionKg * calorific
    
    // GHG emissions (tCO2eq)
    const ghgTco2eq = energyMj * emissionFactor / 1000 // convert to tonnes
    
    // Monthly emissions proportional
    const monthlyGhg = fuelUsage > 0 ? monthlyUsage.map(m => (m / fuelUsage) * ghgTco2eq) : Array(12).fill(0)
    
    // Breakdown into components (placeholders)
    const kgCO2 = ghgTco2eq * 1000 * 0.85
    const kgCH4 = ghgTco2eq * 1000 * 0.10
    const kgN2O = ghgTco2eq * 1000 * 0.05
    
    const year = record.data_year || 2024
    const result: any = { 
      ...record, 
      total_usage: fuelUsage,
      fuel_consumption_kg: fuelConsumptionKg,
      energy_consumption_mj: energyMj,
      ghg_emissions: ghgTco2eq,
      monthly: monthlyGhg,
      kgCO2,
      kgCH4,
      kgN2O
    }
    result[`emission_${year}`] = ghgTco2eq
    return result
  }

  const handleAddRecord = () => {
    if (!newRecord.entity_name || !newRecord.facility_name || !newRecord.equipment_name || !newRecord.fuel_type) {
      alert('Please select Entity, Facility, Equipment, and Fuel Type')
      return
    }
    const maxNo = Math.max(...data.map(item => item.no || 0), 0)
    const record = calculateEmissions({ ...newRecord, no: maxNo + 1 })
    setData(prev => [...prev, record as Scope1Record])
    setDialogOpen(false)
    setNewRecord({
      no: 0,
      entity_name: '',
      facility_name: '',
      equipment_name: '',
      classification: 'Fuel',
      activity: '',
      fuel_type: '',
      unit: 'kg',
      data_year: new Date().getFullYear(),
      total_usage: 0,
      monthly: Array(12).fill(0),
      fuel_consumption_kg: 0,
      energy_consumption_mj: 0,
      ghg_emissions: 0,
    })
  }

  const pieData = useMemo(() => {
    const byEntity: Record<string, number> = {}
    filteredData.forEach(item => {
      const entity = item.entity_name || 'Unknown'
      byEntity[entity] = (byEntity[entity] || 0) + (item.emission_2024 || 0)
    })
    return Object.entries(byEntity).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const monthlyChartData = useMemo(() => {
    const months = Array(12).fill(0)
    filteredData.forEach(item => {
      if (item.monthly && item.monthly.length === 12) {
        item.monthly.forEach((m, i) => months[i] += m)
      }
    })
    return months
  }, [filteredData])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.reduce((sum, item) => sum + (item.emission_2024 || 0), 0).toFixed(2)} tCO2eq
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredData.map(item => item.fuel_type).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Year</CardTitle>
            <CardDescription>Total GHG emissions for filtered data</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar
              data={{
                labels: chartData.map(item => item.year),
                datasets: [{
                  label: 'GHG Emissions (tCO2eq)',
                  data: chartData.map(item => item.emissions),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Emissions by Year',
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions by Entity</CardTitle>
            <CardDescription>Distribution of emissions across entities</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Pie
              data={{
                labels: pieData.map(item => item.name),
                datasets: [{
                  data: pieData.map(item => item.value),
                  backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                  ],
                  hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                  ],
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  title: {
                    display: true,
                    text: 'Emissions Distribution by Entity',
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Emissions</CardTitle>
            <CardDescription>Monthly GHG emissions for filtered data</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                  label: 'GHG Emissions (tCO2eq)',
                  data: monthlyChartData,
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Monthly Emissions',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scope 1 Emissions Data</CardTitle>
          <CardDescription>Manage and view your emissions data</CardDescription>
          <div className="flex gap-4 mt-4 flex-wrap items-center">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Emission</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Emissions Record</DialogTitle>
                  <DialogDescription>
                    Select equipment and fuel type from existing data. Unit will auto-populate based on fuel type. Enter usage for auto-calculations.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entity_name">Entity Name *</Label>
                      <Select 
                        value={newRecord.entity_name} 
                        onValueChange={(value) => setNewRecord(prev => ({ ...prev, entity_name: value, facility_name: '' }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          {entities.map((entity: string) => (
                            <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="facility_name">Facility Name *</Label>
                      <Select 
                        value={newRecord.facility_name} 
                        onValueChange={(value) => setNewRecord(prev => ({ ...prev, facility_name: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredFacilities.map((facility: string) => (
                            <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipment_name">Equipment Name *</Label>
                      <Select 
                        value={newRecord.equipment_name} 
                        onValueChange={(value) => setNewRecord(prev => ({ ...prev, equipment_name: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipments.map((equipment: string) => (
                            <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="classification">Classification</Label>
                      <Select value={newRecord.classification} onValueChange={(value) => setNewRecord(prev => ({ ...prev, classification: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fuel">Fuel</SelectItem>
                          <SelectItem value="RawMaterial">Raw Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="activity">Activity</Label>
                    <Select value={newRecord.activity} onValueChange={(value) => setNewRecord(prev => ({ ...prev, activity: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.map((activity: string) => (
                          <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuel_type">Fuel Type *</Label>
                      <Select 
                        value={newRecord.fuel_type} 
                        onValueChange={(value) => {
                          const unit = getUnitsForFuelType(value)
                          setNewRecord(prev => ({ ...prev, fuel_type: value, unit }))
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((fuel: string) => (
                            <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={newRecord.unit || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_year">Data Year</Label>
                      <Input
                        id="data_year"
                        type="number"
                        value={newRecord.data_year || ''}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, data_year: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Monthly Fuel Usage</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                        <div key={month}>
                          <Label className="text-xs">{month}</Label>
                          <Input
                            type="number"
                            value={newRecord.monthly?.[i] || 0}
                            onChange={(e) => {
                              const newMonthly = [...(newRecord.monthly || Array(12).fill(0))]
                              newMonthly[i] = parseFloat(e.target.value) || 0
                              setNewRecord(prev => ({ ...prev, monthly: newMonthly }))
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fuel Consumption (kg)</Label>
                      <Input
                        value={calculateEmissions(newRecord).fuel_consumption_kg?.toFixed(2) || '0.00'}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Energy Consumption (MJ)</Label>
                      <Input
                        value={calculateEmissions(newRecord).energy_consumption_mj?.toFixed(2) || '0.00'}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>GHG Emissions (tCO2eq)</Label>
                      <Input
                        value={calculateEmissions(newRecord).ghg_emissions?.toFixed(4) || '0.0000'}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>kgCO2</Label>
                      <Input
                        value={calculateEmissions(newRecord).kgCO2?.toFixed(2) || '0.00'}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>kgCH4</Label>
                      <Input
                        value={calculateEmissions(newRecord).kgCH4?.toFixed(2) || '0.00'}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <Label>kgN2O</Label>
                    <Input
                      value={calculateEmissions(newRecord).kgN2O?.toFixed(2) || '0.00'}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddRecord}>Add Record</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.filter(Boolean).map((entity: string) => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Usage</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>GHG Emissions (tCO2eq)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.no}</TableCell>
                    <TableCell>{item.entity_name}</TableCell>
                    <TableCell>{item.facility_name}</TableCell>
                    <TableCell>{item.equipment_name}</TableCell>
                    <TableCell>{item.fuel_type}</TableCell>
                    <TableCell>{item.data_year}</TableCell>
                    <TableCell>{item.total_usage?.toFixed(2)}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.ghg_emissions?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}