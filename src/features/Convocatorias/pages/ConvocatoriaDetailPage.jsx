'use client';

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ArrowLeft, Lock, Unlock, Upload, FileUp } from 'lucide-react'

export default function ConvocatoriaDetailPage() {
  const { id: convocatoriaId } = useParams()

  const [convocatoriaEstado, setConvocatoriaEstado] = useState('en proceso')
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [selectedRecomendados, setSelectedRecomendados] = useState(null)
  const [showExcelModal, setShowExcelModal] = useState(false)

  const [aprendices, setAprendices] = useState([
    {
      id: '1',
      nombre: 'Juan Perez Garcia',
      tipoDocumento: 'CC',
      documento: '1234567890',
      pais: 'Colombia',
      ciudad: 'Medellin',
      direccion: 'Calle 50 #45-67',
      programaFormacion: 'Desarrollo de Software',
      telefono: '+57 300 1234567',
      correo: 'juan.perez@example.com',
      fechaInicioLectiva: '2024-01-15',
      fechaFinLectiva: '2024-06-15',
      fechaInicioProductiva: '2024-06-16',
      fechaFinProductiva: '2024-12-15',
      aprendicesRecomendados: [
        { id: 'r1', nombre: 'Carlos Rodriguez Sanchez', tipoDocumento: 'CC', documento: '5555555555', fechaFinLectiva: '2024-06-20', fechaFinContrato: '2024-12-20' },
        { id: 'r2', nombre: 'Sandra Martinez Lopez', tipoDocumento: 'TI', documento: '6666666666', fechaFinLectiva: '2024-06-25', fechaFinContrato: '2024-12-25' },
      ],
      estado: 'no seleccionado',
      ranking: 1,
    },
    {
      id: '2',
      nombre: 'Maria Gonzalez Lopez',
      tipoDocumento: 'CC',
      documento: '9876543210',
      pais: 'Colombia',
      ciudad: 'Bogota',
      direccion: 'Carrera 15 #30-20',
      programaFormacion: 'Administracion de Empresas',
      telefono: '+57 310 9876543',
      correo: 'maria.gonzalez@example.com',
      fechaInicioLectiva: '2024-02-01',
      fechaFinLectiva: '2024-07-01',
      fechaInicioProductiva: '2024-07-02',
      fechaFinProductiva: '2025-01-01',
      aprendicesRecomendados: [
        { id: 'r3', nombre: 'Ana Martinez Ruiz', tipoDocumento: 'CE', documento: '7777777777', fechaFinLectiva: '2024-05-30', fechaFinContrato: '2024-11-30' },
      ],
      estado: 'seleccionado',
      ranking: 2,
    },
    {
      id: '3',
      nombre: 'Carlos Rodriguez Sanchez',
      tipoDocumento: 'TI',
      documento: '5555555555',
      pais: 'Colombia',
      ciudad: 'Cali',
      direccion: 'Avenida 6 #12-34',
      programaFormacion: 'Contabilidad',
      telefono: '+57 320 5555555',
      correo: 'carlos.rodriguez@example.com',
      fechaInicioLectiva: '2024-01-20',
      fechaFinLectiva: '2024-06-20',
      fechaInicioProductiva: '2024-06-21',
      fechaFinProductiva: '2024-12-20',
      aprendicesRecomendados: [],
      estado: 'no seleccionado',
      ranking: 3,
    },
  ])

  const handleEstadoChange = (aprendizId, nuevoEstado) => {
    if (convocatoriaEstado === 'finalizado') return
    setAprendices(aprendices.map((a) => (a.id === aprendizId ? { ...a, estado: nuevoEstado } : a)))
  }

  const handleCloseConvocatoria = () => {
    setConvocatoriaEstado('finalizado')
    setShowCloseDialog(false)
  }

  const handleEditConvocatoria = () => {
    setConvocatoriaEstado('en proceso')
  }

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const newAprendices = [
        {
          id: `${aprendices.length + 1}`,
          nombre: 'Nuevo Aprendiz desde Excel',
          tipoDocumento: 'CC',
          documento: '1112223334',
          pais: 'Colombia',
          ciudad: 'Barranquilla',
          direccion: 'Calle Nueva #10-20',
          programaFormacion: 'Marketing Digital',
          telefono: '+57 315 1112223',
          correo: 'nuevo.aprendiz@example.com',
          fechaInicioLectiva: '2024-03-01',
          fechaFinLectiva: '2024-08-01',
          fechaInicioProductiva: '2024-08-02',
          fechaFinProductiva: '2025-02-01',
          aprendicesRecomendados: [
            { id: 'r4', nombre: 'Laura Garcia Torres', tipoDocumento: 'CC', documento: '8888888888', fechaFinLectiva: '2024-07-15', fechaFinContrato: '2025-01-15' },
          ],
          estado: 'no seleccionado',
          ranking: aprendices.length + 1,
        },
      ]
      setAprendices([...aprendices, ...newAprendices])
      setShowExcelModal(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="ml-64 min-h-screen bg-gray-50 p-8">
        <div className="mb-6">
          <Link to="/convocatorias">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Convocatorias
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Convocatoria</h1>
            <p className="text-muted-foreground mt-2">{convocatoriaId}</p>
          </div>
          <div className="flex gap-2">
            {convocatoriaEstado === 'en proceso' && (
              <Button variant="outline" onClick={() => setShowExcelModal(true)} className="bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Cargar Excel Adicional
              </Button>
            )}
            {convocatoriaEstado === 'finalizado' && (
              <Button variant="outline" onClick={handleEditConvocatoria} className="bg-transparent">
                <Unlock className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {convocatoriaEstado === 'en proceso' && (
              <Button onClick={() => setShowCloseDialog(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Cerrar Convocatoria
              </Button>
            )}
          </div>
        </div>

<Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Aprendices Registrados</h2>
              <Badge 
                className={`rounded-full px-3 py-1 text-xs font-medium ${convocatoriaEstado === 'en proceso' 
                  ? 'bg-blue-600 text-white hover:bg-blue-600' 
                  : 'bg-pink-500 text-white hover:bg-pink-500'}`}
              >
                {convocatoriaEstado}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ranking</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo Doc.</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">N. Documento</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ciudad</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Programa</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inicio Lectiva</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fin Lectiva</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inicio Productiva</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fin Productiva</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aprendices Recomendados</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {aprendices.map((aprendiz) => (
                    <tr key={aprendiz.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{aprendiz.ranking}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.nombre}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.tipoDocumento}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.documento}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.ciudad}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.programaFormacion}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.fechaInicioLectiva}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.fechaFinLectiva}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{aprendiz.fechaInicioProductiva}</td>
<td className="py-4 px-4 text-sm text-gray-600">{aprendiz.fechaFinProductiva}</td>
                      <td className="py-4 px-4 text-sm">
                        {aprendiz.aprendicesRecomendados.length > 0 ? (
                          <Button
                            variant="link"
                            className="h-auto p-0 text-blue-600 hover:underline"
                            onClick={() => setSelectedRecomendados(aprendiz.aprendicesRecomendados)}
                          >
                            Ver {aprendiz.aprendicesRecomendados.length} recomendado(s)
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Select
                          value={aprendiz.estado}
                          onValueChange={(value) => handleEstadoChange(aprendiz.id, value)}
                          disabled={convocatoriaEstado === 'finalizado'}
                        >
                          <SelectTrigger className="w-[160px] border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no seleccionado">No Seleccionado</SelectItem>
                            <SelectItem value="seleccionado">Seleccionado</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

<Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Cerrar Convocatoria</DialogTitle>
              <DialogDescription className="text-gray-500">
                Esta seguro de que desea cerrar esta convocatoria? Los aprendices seleccionados pasaran al modulo de
                Seleccion y no podra editarla a menos que la reabra.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloseDialog(false)} className="bg-transparent border-gray-200">
                Cancelar
              </Button>
              <Button onClick={handleCloseConvocatoria}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

<Dialog open={!!selectedRecomendados} onOpenChange={() => setSelectedRecomendados(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Aprendices Recomendados para Reemplazo</DialogTitle>
            </DialogHeader>
            {selectedRecomendados && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedRecomendados.map((aprendiz, index) => (
                  <div key={aprendiz.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="border-gray-300 text-gray-700">{index + 1}</Badge>
                      <span className="font-medium text-gray-900">{aprendiz.nombre}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Tipo Documento</p>
                        <p className="font-medium text-gray-900">{aprendiz.tipoDocumento}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Documento</p>
                        <p className="font-medium text-gray-900">{aprendiz.documento}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha Fin Lectiva</p>
                        <p className="font-medium text-gray-900">{new Date(aprendiz.fechaFinLectiva).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha Fin Contrato</p>
                        <p className="font-medium text-gray-900">{new Date(aprendiz.fechaFinContrato).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecomendados(null)} className="bg-transparent border-gray-200">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

<Dialog open={showExcelModal} onOpenChange={setShowExcelModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Cargar Excel Adicional</DialogTitle>
              <DialogDescription className="text-gray-500">
                Adjunte un archivo Excel con aprendices adicionales para agregar a esta convocatoria.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-blue-100 p-6">
                <FileUp className="h-12 w-12 text-blue-600" />
              </div>
              <input
                type="file"
                id="excel-upload-additional"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
              />
              <label htmlFor="excel-upload-additional">
                <Button type="button" variant="outline" asChild className="bg-transparent border-gray-200">
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar archivo Excel
                  </span>
                </Button>
              </label>
            </div>
            <DialogFooter className="justify-end">
              <Button variant="ghost" onClick={() => setShowExcelModal(false)} className="text-gray-600">
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
