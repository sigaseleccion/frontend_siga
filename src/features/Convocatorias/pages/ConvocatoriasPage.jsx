'use client';

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Upload, PenBoxIcon, FileUp, Search, X } from 'lucide-react'
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

<Card className="border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Listado de Convocatorias</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Convocatoria</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Convocatoria</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Programa</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nivel Formacion</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Creacion</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Aprendices</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConvocatorias.map((conv) => (
                    <tr key={conv.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{conv.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{conv.nombreConvocatoria}</td>
<td className="py-4 px-4 text-sm text-gray-600 max-w-[200px] truncate" title={conv.programa}>{conv.programa}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="border-gray-300 bg-transparent text-gray-700 hover:bg-transparent rounded-full px-3 py-1 text-xs font-medium">{getNivelFormacionLabel(conv.nivelFormacion)}</Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{new Date(conv.fechaCreacion).toLocaleDateString('es-ES')}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{conv.totalAprendices}</td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={`rounded-full px-3 py-1 text-xs font-medium ${conv.estado === 'en proceso' 
                            ? 'bg-blue-600 text-white hover:bg-blue-600' 
                            : 'bg-pink-500 text-white hover:bg-pink-500'}`}
                        >
                          {conv.estado}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Link to={`/convocatorias/${conv.id}`}>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                            <PenBoxIcon className="h-4 w-4 mr-1" />
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
          <DialogContent className="max-w-md [&>button]:hidden">
            <button
              type="button"
              onClick={handleCancelModal}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </button>
            <DialogHeader>
              <DialogTitle>Crear Nueva Convocatoria</DialogTitle>
              <DialogDescription>
                Complete los datos y adjunte el excel con el listado de aprendices
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-4">
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

            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-blue-100 p-6">
                <FileUp className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-muted-foreground text-center text-sm">No se ha adjuntado ningun archivo aun</p>
            </div>

            <div className="flex items-center justify-between mt-2">
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
                    Adjuntar excel
                  </span>
                </Button>
              </label>
              <Button variant="ghost" onClick={handleCancelModal}>
                Cancelar
              </Button>
            </div>
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
