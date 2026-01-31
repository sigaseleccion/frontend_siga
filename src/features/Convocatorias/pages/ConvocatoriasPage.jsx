'use client';

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Upload, PenBoxIcon, FileUp, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

const programaOptions = [
  { value: 'TECNICO EN PROGRAMACION DE SOFTWARE', label: 'Tecnico en Programacion de Software' },
  { value: 'TECNOLOGO EN ANALISIS Y DESARROLLO DE SOFTWARE', label: 'Tecnologo en Analisis y Desarrollo de Software' },
  { value: 'TNLOG. IMPLEMENTACION DE INFRAESTRUCTURA DE TIC', label: 'Tnlog. Implementacion de Infraestructura de TIC' },
  { value: 'TNLOG. DESARROLLO DE SOFTWARE', label: 'Tnlog. Desarrollo de Software' },
  { value: 'ADMINISTRACION DE EMPRESAS', label: 'Administracion de Empresas' },
  { value: 'Otro', label: 'Otro' },
]

export default function ConvocatoriasPage() {
  const [convocatorias, setConvocatorias] = useState([
    {
      id: 'CONV-2024-001',
      nombreConvocatoria: 'TECNOLOGO EN ANALISIS Y DESARROLLO DE SOFTWARE - 15/01/2024',
      programa: 'TECNOLOGO EN ANALISIS Y DESARROLLO DE SOFTWARE',
      nivelFormacion: 'tecnologia',
      fechaCreacion: '2024-01-15',
      estado: 'en proceso',
      totalAprendices: 45,
    },
    {
      id: 'CONV-2024-002',
      nombreConvocatoria: 'ADMINISTRACION DE EMPRESAS - 20/01/2024',
      programa: 'ADMINISTRACION DE EMPRESAS',
      nivelFormacion: 'profesional',
      fechaCreacion: '2024-01-20',
      estado: 'en proceso',
      totalAprendices: 32,
    },
    {
      id: 'CONV-2023-012',
      nombreConvocatoria: 'TECNICO EN PROGRAMACION DE SOFTWARE - 10/12/2023',
      programa: 'TECNICO EN PROGRAMACION DE SOFTWARE',
      nivelFormacion: 'tecnica',
      fechaCreacion: '2023-12-10',
      estado: 'finalizado',
      totalAprendices: 28,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [aprendicesFiltrados, setAprendicesFiltrados] = useState([])
  const [selectedAprendizReemplazo, setSelectedAprendizReemplazo] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const [programa, setPrograma] = useState('')
  const [programaOtro, setProgramaOtro] = useState('')
  const [nivelFormacion, setNivelFormacion] = useState('')

  const [searchNombre, setSearchNombre] = useState('')
  const [filterNivel, setFilterNivel] = useState('todas')

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const mockData = [
        {
          nombre: 'Juan Perez Garcia',
          tipoDocumento: 'CC',
          documento: '1234567890',
          fechaInicioLectiva: '2024-01-15',
          fechaFinLectiva: '2024-06-15',
          fechaInicioProductiva: '2024-06-16',
          fechaFinProductiva: '2024-12-15',
          aprendicesRecomendados: [
            { id: 'r1', nombre: 'Maria Lopez Sanchez', tipoDocumento: 'CC', documento: '1098765432', fechaFinLectiva: '2024-05-30', fechaFinContrato: '2024-11-30' },
            { id: 'r2', nombre: 'Pedro Martinez Ruiz', tipoDocumento: 'TI', documento: '1087654322', fechaFinLectiva: '2024-06-10', fechaFinContrato: '2024-12-10' },
          ],
        },
        {
          nombre: 'Ana Maria Torres',
          tipoDocumento: 'CC',
          documento: '9876543210',
          fechaInicioLectiva: '2024-02-01',
          fechaFinLectiva: '2024-07-01',
          fechaInicioProductiva: '2024-07-02',
          fechaFinProductiva: '2025-01-01',
          aprendicesRecomendados: [
            { id: 'r3', nombre: 'Carlos Rodriguez Diaz', tipoDocumento: 'CE', documento: '1087654321', fechaFinLectiva: '2024-06-15', fechaFinContrato: '2024-12-15' },
          ],
        },
      ]
      setAprendicesFiltrados(mockData)
    }
  }

  const generateNombreConvocatoria = (programaName) => {
    const today = new Date()
    const dateStr = today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${programaName} - ${dateStr}`
  }

  const handleCreateConvocatoria = () => {
    if (!programa || !nivelFormacion) return
    const programaFinal = programa === 'Otro' ? programaOtro : programa
    if (programa === 'Otro' && !programaOtro.trim()) return

    const nombreConvocatoria = generateNombreConvocatoria(programaFinal)

    const newConv = {
      id: `CONV-${new Date().getFullYear()}-${String(convocatorias.length + 1).padStart(3, '0')}`,
      nombreConvocatoria,
      programa: programaFinal,
      nivelFormacion,
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'en proceso',
      totalAprendices: aprendicesFiltrados.length,
    }
    setConvocatorias([newConv, ...convocatorias])
    setIsModalOpen(false)
    setAprendicesFiltrados([])
    setPrograma('')
    setProgramaOtro('')
    setNivelFormacion('')
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
    setAprendicesFiltrados([])
    setPrograma('')
    setProgramaOtro('')
    setNivelFormacion('')
  }

  const handleShowReemplazDetails = (aprendices) => {
    setSelectedAprendizReemplazo(aprendices)
    setIsDetailModalOpen(true)
  }

  const getNivelFormacionLabel = (nivel) => {
    const labels = { tecnica: 'Tecnica', tecnologia: 'Tecnologia', profesional: 'Profesional' }
    return labels[nivel]
  }

  const filteredConvocatorias = convocatorias.filter((conv) => {
    const matchesNombre = conv.nombreConvocatoria.toLowerCase().includes(searchNombre.toLowerCase())
    const matchesNivel = filterNivel === 'todas' || conv.nivelFormacion === filterNivel
    return matchesNombre && matchesNivel
  })

  const canCreate = programa && nivelFormacion && (programa !== 'Otro' || programaOtro.trim())

  return (
    <div>
      <Navbar />
      <main className="ml-64 min-h-screen bg-gray-50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Convocatorias</h1>
            <p className="text-muted-foreground mt-2">Gestion de candidatos y procesos de convocatoria</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Crear convocatoria
          </Button>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de convocatoria..."
              value={searchNombre}
              onChange={(e) => setSearchNombre(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterNivel} onValueChange={(v) => setFilterNivel(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Nivel de formacion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos los niveles</SelectItem>
              <SelectItem value="tecnica">Tecnica</SelectItem>
              <SelectItem value="tecnologia">Tecnologia</SelectItem>
              <SelectItem value="profesional">Profesional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Convocatorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID Convocatoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nombre Convocatoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Programa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nivel Formacion</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha Creacion</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Aprendices</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConvocatorias.map((conv) => (
                    <tr key={conv.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm font-medium">{conv.id}</td>
                      <td className="py-3 px-4 text-sm">{conv.nombreConvocatoria}</td>
                      <td className="py-3 px-4 text-sm max-w-[200px] truncate" title={conv.programa}>{conv.programa}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{getNivelFormacionLabel(conv.nivelFormacion)}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(conv.fechaCreacion).toLocaleDateString('es-ES')}</td>
                      <td className="py-3 px-4 text-sm">{conv.totalAprendices}</td>
                      <td className="py-3 px-4">
                        <Badge variant={conv.estado === 'en proceso' ? 'default' : 'secondary'}>{conv.estado}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/convocatorias/${conv.id}`}>
                          <Button variant="ghost" size="sm">
                            <PenBoxIcon className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[98vw] max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <DialogHeader>
              <DialogTitle>Crear Nueva Convocatoria</DialogTitle>
              <DialogDescription>
                {aprendicesFiltrados.length === 0
                  ? 'Complete los datos y adjunte el excel con el listado de aprendices'
                  : 'Previsualizacion de aprendices filtrados'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="programa">Programa</Label>
                <Select value={programa} onValueChange={(v) => setPrograma(v)}>
                  <SelectTrigger id="programa">
                    <SelectValue placeholder="Seleccionar programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programaOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {programa === 'Otro' && (
                <div className="space-y-2">
                  <Label htmlFor="programa-otro">Nombre del Programa</Label>
                  <Input
                    id="programa-otro"
                    placeholder="Ingrese el nombre del programa"
                    value={programaOtro}
                    onChange={(e) => setProgramaOtro(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nivel-formacion">Nivel de Formacion</Label>
                <Select value={nivelFormacion} onValueChange={(v) => setNivelFormacion(v)}>
                  <SelectTrigger id="nivel-formacion">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnica">Tecnica</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="profesional">Profesional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {programa && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Nombre de convocatoria (generado automaticamente)</p>
                <p className="text-sm font-medium">
                  {generateNombreConvocatoria(programa === 'Otro' ? programaOtro || 'Programa Personalizado' : programa)}
                </p>
              </div>
            )}

            {aprendicesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="rounded-full bg-primary/10 p-6">
                  <FileUp className="h-12 w-12 text-primary" />
                </div>
                <p className="text-muted-foreground text-center">No se ha adjuntado ningun archivo aun</p>
                <input
                  type="file"
                  id="excel-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
                <label htmlFor="excel-upload">
                  <Button type="button" variant="outline" asChild className="bg-transparent">
                    <span className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Seleccionar archivo Excel
                    </span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Nombre</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Tipo Doc.</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">N. Documento</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Inicio Lectiva</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Fin Lectiva</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Recomendados Reemplazo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aprendicesFiltrados.map((aprendiz, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="py-3 px-4 text-sm whitespace-nowrap">{aprendiz.nombre}</td>
                          <td className="py-3 px-4 text-sm whitespace-nowrap">{aprendiz.tipoDocumento}</td>
                          <td className="py-3 px-4 text-sm whitespace-nowrap">{aprendiz.documento}</td>
                          <td className="py-3 px-4 text-sm whitespace-nowrap">{aprendiz.fechaInicioLectiva}</td>
                          <td className="py-3 px-4 text-sm whitespace-nowrap">{aprendiz.fechaFinLectiva}</td>
                          <td className="py-3 px-4 text-sm">
                            {aprendiz.aprendicesRecomendados.length > 0 ? (
                              <Button
                                variant="link"
                                className="h-auto p-0 text-primary hover:underline"
                                onClick={() => handleShowReemplazDetails(aprendiz.aprendicesRecomendados)}
                              >
                                Ver {aprendiz.aprendicesRecomendados.length} recomendado(s)
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleCancelModal} className="bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleCreateConvocatoria} disabled={!canCreate || aprendicesFiltrados.length === 0}>
                Crear Convocatoria
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Aprendices Recomendados para Reemplazo</DialogTitle>
            </DialogHeader>
            {selectedAprendizReemplazo && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedAprendizReemplazo.map((aprendiz, index) => (
                  <div key={aprendiz.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{aprendiz.nombre}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tipo Documento</p>
                        <p className="font-medium">{aprendiz.tipoDocumento}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Documento</p>
                        <p className="font-medium">{aprendiz.documento}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fecha Fin Lectiva</p>
                        <p className="font-medium">{new Date(aprendiz.fechaFinLectiva).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fecha Fin Contrato</p>
                        <p className="font-medium">{new Date(aprendiz.fechaFinContrato).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="bg-transparent">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
