'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Search, MapPin, Building, Users, Globe, Zap, Factory, Recycle } from 'lucide-react'

interface BusinessSite {
  id: string
  no: number
  name_of_entity: string
  name_of_facility: string
  country: string
  business_type: string
  lease_status: string
  detailed_address: string
  area: string
  ghg_sources: string
  management_tools_status: string
  department_in_charge: string
  contact_information: string
}

const initialData: BusinessSite[] = [
  {
    id: '1',
    no: 1,
    name_of_entity: 'HOJEON LIMITED',
    name_of_facility: 'HOJEON LIMITED Co., Ltd',
    country: 'Korea',
    business_type: 'Head Quarters',
    lease_status: 'Ownership',
    detailed_address: '11th and 12th Floors, Shinhwa Building, 19 Mapo-daero, Mapo-gu, Seoul, Korea',
    area: '2,430.2㎡ - 4F(Part), 9F, 11F, 12F, 13F',
    ghg_sources: 'Scope 1: Vehicles (Mobile Combustion)\nScope 2: Electricity, Water Supply',
    management_tools_status: 'Other (Insert a note if \'Other\' is selected)',
    department_in_charge: '박달원 부장, 이소영 과장',
    contact_information: 'dwpark1@hojeon.co.kr , sylee4@hojeon.co.kr'
  },
  {
    id: '2',
    no: 2,
    name_of_entity: 'PT. KAHOINDAH CITRAGARMENT',
    name_of_facility: 'KAHOINDAH CITRAGARMENT',
    country: 'Indonesia',
    business_type: 'Clothing manufacturing factory',
    lease_status: 'Ownership',
    detailed_address: 'JI.Bali Blok D16, Kawasan Berikat Nusantara Cilincing Cakung Jakarta Utara, Indonesia',
    area: '14,100 M2 (facility)',
    ghg_sources: 'Scope 1 + Scope 2',
    management_tools_status: 'Other (Insert a note if \'Other\' is selected)',
    department_in_charge: 'MS. REZA',
    contact_information: 'reza@kaho.co.id'
  },
  {
    id: '3',
    no: 3,
    name_of_entity: 'PT. YONGJIN JAVASUKA GARMENT',
    name_of_facility: 'PT. YONGJIN JAVASUKA GARMENT (1공장)',
    country: 'Indonesia',
    business_type: 'Clothing manufacturing factory',
    lease_status: 'Ownership',
    detailed_address: 'JL. RAYA SILLIWANGI KM 35 DESA BUNDA KEC. CICURUG - KAB. SUKABUMI 43359',
    area: 'Yongjin 1공장 : 21,605 SQM',
    ghg_sources: 'Scope 1 + Scope 2',
    management_tools_status: 'Other (Insert a note if \'Other\' is selected)',
    department_in_charge: 'MS. ANITA',
    contact_information: 'anita@yongjin.co.id'
  },
  {
    id: '4',
    no: 4,
    name_of_entity: 'PT. HJL INDO NETWORKS',
    name_of_facility: 'PT. HJL INDO NETWORKS',
    country: 'Indonesia',
    business_type: 'Sales corporation',
    lease_status: 'Ownership',
    detailed_address: 'Graha Surveyor Indonesia 17th fl. 1701 Jl. Jend. Gatot Subroto Kav. 56 Jakarta 12950, Indonesia',
    area: '1,304 M2',
    ghg_sources: 'Scope 1 + Scope 2 (Didn\'t managed)',
    management_tools_status: 'Other (Insert a note if \'Other\' is selected)',
    department_in_charge: 'Mr. Fahmi',
    contact_information: 'fahmi@hjl.co.id'
  },
  {
    id: '5',
    no: 5,
    name_of_entity: 'PT.HOGA REKSA GARMENT',
    name_of_facility: 'PT.HOGA REKSA GARMENT',
    country: 'Indonesia',
    business_type: 'Clothing manufacturing factory',
    lease_status: 'Ownership',
    detailed_address: 'Jl.Raya Leles KM. 13 Kp. Tutugan RT001/ RW. 002 Desa Haruman, Kecamatan Leles, Kabupaten Garut, Jawa Barat. 44152, Indonesia T. +62 0262 2457677',
    area: '125,052 m2 (land) 51,968 m2 (facility)',
    ghg_sources: 'Scope 1 + Scope 2',
    management_tools_status: 'Other (Insert a note if \'Other\' is selected)',
    department_in_charge: 'mr. Andri',
    contact_information: 'andri@hoga.co.id'
  },
  {
    id: '6',
    no: 6,
    name_of_entity: '㈜엠파파',
    name_of_facility: 'MFAFA Co., Ltd',
    country: 'Korea',
    business_type: 'Head Quarters',
    lease_status: 'Lease',
    detailed_address: '13rd Floor, Shinhwa Building, 19 Mapo-daero, Mapo-gu, Seoul, Korea',
    area: '66㎡ - 13F(Part)',
    ghg_sources: 'Scope 2 : Electricty, Water supply',
    management_tools_status: 'Other (Insert a note if \'Other\' is selected)',
    department_in_charge: '박달원 부장, 이소영 과장',
    contact_information: 'dwpark1@hojeon.co.kr , sylee4@hojeon.co.kr'
  }
]

export default function InformationContent() {
  const [data, setData] = useState<BusinessSite[]>([])
  const [editing, setEditing] = useState<BusinessSite | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('business_sites')
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      setData(initialData)
      localStorage.setItem('business_sites', JSON.stringify(initialData))
    }
  }, [])

  const saveData = (newData: BusinessSite[]) => {
    setData(newData)
    localStorage.setItem('business_sites', JSON.stringify(newData))
  }

  const filteredData = useMemo(() => data.filter(site =>
    Object.values(site).some(value =>
      value.toString().toLowerCase().includes(search.toLowerCase())
    )
  ), [data, search])

  const chartData = useMemo(() => {
    const counts = data.reduce((acc, site) => {
      acc[site.country] = (acc[site.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([country, count]) => ({ country, count }))
  }, [data])

  const stats = useMemo(() => ({
    totalSites: data.length,
    countries: new Set(data.map(s => s.country)).size,
    ownership: data.filter(s => s.lease_status === 'Ownership').length,
    lease: data.filter(s => s.lease_status === 'Lease').length
  }), [data])

  const handleAdd = () => {
    const newId = Date.now().toString()
    const newSite: BusinessSite = {
      id: newId,
      no: data.length + 1,
      name_of_entity: '',
      name_of_facility: '',
      country: '',
      business_type: '',
      lease_status: '',
      detailed_address: '',
      area: '',
      ghg_sources: '',
      management_tools_status: '',
      department_in_charge: '',
      contact_information: ''
    }
    setEditing(newSite)
    setIsDialogOpen(true)
  }

  const handleEdit = (site: BusinessSite) => {
    setEditing(site)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const newData = data.filter(d => d.id !== id)
    saveData(newData)
  }

  const handleSave = (site: BusinessSite) => {
    let newData
    if (data.find(d => d.id === site.id)) {
      newData = data.map(d => d.id === site.id ? site : d)
    } else {
      newData = [...data, site]
    }
    saveData(newData)
    setIsDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-2 sm:p-4 pt-0 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSites}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.countries}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ownership</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ownership}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lease}</div>
          </CardContent>
        </Card>
      </div>
       {/* Section: Organizational Boundaries */}
      <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-card to-card/80">
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">General Information of Business Site</h3>
            <p className="text-sm mt-2">
              Target Business Establishments for Reporting:<br />
              Business establishments of entities (subsidiaries + affiliates) that are reported as affiliates in the business report of Hojeon Limited.<br />
              Business establishments where Hojeon Limited has actual operational control, such as those leased, even if not directly owned by Hojeon Limited.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Basic Information of Business Site</h3>
            <ul className="list-disc ml-6 mt-2 text-sm">
              <li>Business location details</li>
              <li>Status of greenhouse gas activity data management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      {/* Business Sites Table */}
      <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-card to-card/80">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg sm:text-xl font-bold">Business Sites</CardTitle>
            <Button onClick={handleAdd} size="sm" title="Add new business site">
              <Plus className="h-4 w-4 mr-2" />
              Add New Site
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name of Entity</TableHead>
              <TableHead>Name of Facility</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Business Type</TableHead>
              <TableHead>Lease Status</TableHead>
              <TableHead>Detailed Address</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>GHG Sources</TableHead>
              <TableHead>Management Tools Status</TableHead>
              <TableHead>Department in Charge</TableHead>
              <TableHead>Contact Information</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((site) => (
              <TableRow key={site.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>{site.no}</TableCell>
                <TableCell>{site.name_of_entity}</TableCell>
                <TableCell>{site.name_of_facility}</TableCell>
                <TableCell>{site.country}</TableCell>
                <TableCell>{site.business_type}</TableCell>
                <TableCell><Badge variant={site.lease_status === 'Ownership' ? 'default' : 'secondary'}>{site.lease_status}</Badge></TableCell>
                <TableCell>{site.detailed_address}</TableCell>
                <TableCell>{site.area}</TableCell>
                <TableCell>{site.ghg_sources}</TableCell>
                <TableCell>{site.management_tools_status}</TableCell>
                <TableCell>{site.department_in_charge}</TableCell>
                <TableCell>{site.contact_information}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(site)} title="Edit site">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(site.id)} title="Delete site">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-card to-card/80">
        <CardHeader>
          <CardTitle>Business Sites by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ count: { label: 'Count' } }} className="h-48 sm:h-64">
            <BarChart data={chartData}>
              <XAxis dataKey="country" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#3b82f6" animationDuration={1000} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Reference Section */}
      <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-card to-card/80">
        <CardHeader>
          <CardTitle>[Reference] Classification of Greenhouse Gas Emission Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead>Definition</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-muted/50 transition-colors">
              <TableCell className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Scope 1 (Direct Emission)
              </TableCell>
              <TableCell>Green House Gas Emissions from sources owned or controlled by the company</TableCell>
              <TableCell>Boilers, Furnaces, Turbines, Transportation vehicles, Incinerators Greenhouse gas-emitting chemical processes</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/50 transition-colors">
              <TableCell className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-blue-500" />
                Scope 2 (Indirect Emission)
              </TableCell>
              <TableCell>Green House Gas Emissions from the generation of purchased electricity and steam consumed by the company</TableCell>
              <TableCell>Electricity and steam purchased or brought into the organizational boundary of the company through other means</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/50 transition-colors">
              <TableCell className="flex items-center gap-2">
                <Recycle className="h-4 w-4 text-green-500" />
                Scope 3 (Other Indirect Emissions)
              </TableCell>
              <TableCell>Green House Gas Emissions from activities related to the company, but occurring at facilities not owned or controlled by the company</TableCell>
              <TableCell>- Leased assets, Franchises, Outsourced activities - Use of sold products and services - Waste disposal</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit' : 'Add'} Business Site</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing) }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="no">No.</Label>
                  <Input id="no" type="number" value={editing.no} onChange={(e) => setEditing({...editing, no: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="name_of_entity">Name of Entity</Label>
                  <Input id="name_of_entity" value={editing.name_of_entity} onChange={(e) => setEditing({...editing, name_of_entity: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="name_of_facility">Name of Facility</Label>
                  <Input id="name_of_facility" value={editing.name_of_facility} onChange={(e) => setEditing({...editing, name_of_facility: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={editing.country} onChange={(e) => setEditing({...editing, country: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input id="business_type" value={editing.business_type} onChange={(e) => setEditing({...editing, business_type: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="lease_status">Lease Status</Label>
                  <Select value={editing.lease_status} onValueChange={(value) => setEditing({...editing, lease_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ownership">Ownership</SelectItem>
                      <SelectItem value="Lease">Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="detailed_address">Detailed Address</Label>
                  <Textarea id="detailed_address" value={editing.detailed_address} onChange={(e) => setEditing({...editing, detailed_address: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" value={editing.area} onChange={(e) => setEditing({...editing, area: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="ghg_sources">GHG Sources</Label>
                  <Textarea id="ghg_sources" value={editing.ghg_sources} onChange={(e) => setEditing({...editing, ghg_sources: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="management_tools_status">Management Tools Status</Label>
                  <Input id="management_tools_status" value={editing.management_tools_status} onChange={(e) => setEditing({...editing, management_tools_status: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="department_in_charge">Department in Charge</Label>
                  <Input id="department_in_charge" value={editing.department_in_charge} onChange={(e) => setEditing({...editing, department_in_charge: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="contact_information">Contact Information</Label>
                  <Input id="contact_information" value={editing.contact_information} onChange={(e) => setEditing({...editing, contact_information: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}