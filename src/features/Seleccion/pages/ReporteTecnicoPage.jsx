'use client';

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ArrowLeft, Upload, FileUp, FileText, X, File } from 'lucide-react'
import { aprendizService } from '@/features/Convocatorias/services/aprendizService'
import { pruebaSeleccionService } from '@/features/Convocatorias/services/pruebaSeleccionService'

export default function ReporteTecnicoPage() {
  const { id: convocatoriaId } = useParams()

  const [reporteFile, setReporteFile] = useState(null)

  const convocatoriaInfo = {
    id: convocatoriaId,
    nombreConvocatoria: 'Convocatoria Desarrollo Web 2024',
    nivelFormacion: 'Tecnologia',
  }

  const [aprendices, setAprendices] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        const aps = await aprendizService.obtenerAprendicesPorConvocatoria(convocatoriaId)
        const seleccionados = aps.filter((a) => a.etapaActual === 'seleccion2')
        const base = seleccionados.map((a) => ({
          id: a._id,
          _id: a._id,
          nombre: a.nombre,
          tipoDocumento: a.tipoDocumento,
          documento: a.documento,
          pruebaTecnica: 'pendiente',
          pruebaSeleccionId: a.pruebaSeleccionId || null,
        }))
        const withEstados = await Promise.all(
          base.map(async (a) => {
            if (a.pruebaSeleccionId) {
              try {
                const ps = await pruebaSeleccionService.obtenerPorId(a.pruebaSeleccionId)
                return { ...a, pruebaTecnica: ps.pruebaTecnica || 'pendiente' }
              } catch {
                return a
              }
            }
            return a
          })
        )
        setAprendices(withEstados)
      } catch (e) {
        setError(e.message)
      }
    }
    loadData()
  }, [convocatoriaId])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/pdf',
      ]
      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.pdf')) {
        setReporteFile(file)
      } else {
        alert('Solo se permiten archivos Excel (.xlsx, .xls) o PDF')
      }
    }
  }

  const handleRemoveFile = () => {
    setReporteFile(null)
  }

  const handlePruebaTecnicaChange = async (aprendizId, estado) => {
    const target = aprendices.find((a) => a.id === aprendizId)
    if (target && target.pruebaSeleccionId) {
      try {
        await pruebaSeleccionService.actualizarPrueba(target.pruebaSeleccionId, { pruebaTecnica: estado })
        setAprendices((prev) =>
          prev.map((a) => (a.id === aprendizId ? { ...a, pruebaTecnica: estado } : a))
        )
      } catch (e) {
        setError(e.message)
      }
    } else {
      setAprendices((prev) =>
        prev.map((a) => (a.id === aprendizId ? { ...a, pruebaTecnica: estado } : a))
      )
    }
  }

  const getFileIcon = () => {
    if (!reporteFile) return null
    if (reporteFile.name.endsWith('.pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <File className="h-8 w-8 text-green-600" />
  }

  return (
    <div>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50 p-8">
        {error && (
          <Card className="mb-4">
            <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
              {error}
            </CardContent>
          </Card>
        )}
        <div className="mb-6">
          <Link to={`/seleccion/${convocatoriaId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Convocatoria
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reporte Tecnico</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-muted-foreground">{convocatoriaInfo.nombreConvocatoria}</span>
            <Badge variant="outline">{convocatoriaInfo.nivelFormacion}</Badge>
          </div>
        </div>

        <Tabs defaultValue="adjuntar" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="adjuntar">Adjuntar Reporte</TabsTrigger>
            <TabsTrigger value="estado">Estado Aprendices</TabsTrigger>
          </TabsList>

          <TabsContent value="adjuntar">
            <Card>
              <CardHeader>
                <CardTitle>Adjuntar Reporte Tecnico</CardTitle>
              </CardHeader>
              <CardContent>
                {reporteFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                      {getFileIcon()}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{reporteFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(reporteFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="reporte-replace"
                        className="hidden"
                        accept=".xlsx,.xls,.pdf"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="reporte-replace">
                        <Button type="button" variant="outline" asChild className="bg-transparent">
                          <span className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Reemplazar archivo
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="rounded-full bg-primary/10 p-6">
                      <FileUp className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">
                        No se ha adjuntado ningun reporte tecnico
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: Excel (.xlsx, .xls) o PDF
                      </p>
                    </div>
                    <input
                      type="file"
                      id="reporte-upload"
                      className="hidden"
                      accept=".xlsx,.xls,.pdf"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="reporte-upload">
                      <Button type="button" variant="outline" asChild className="bg-transparent">
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Seleccionar archivo
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estado">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Prueba Tecnica por Aprendiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo Doc.</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">N. Documento</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">P. Tecnica</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aprendices.map((aprendiz) => (
                        <tr key={aprendiz.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-4 text-sm font-medium">{aprendiz.nombre}</td>
                          <td className="py-3 px-4 text-sm">{aprendiz.tipoDocumento}</td>
                          <td className="py-3 px-4 text-sm">{aprendiz.documento}</td>
                          <td className="py-3 px-4">
                            <Select
                              value={aprendiz.pruebaTecnica}
                              onValueChange={(value) => handlePruebaTecnicaChange(aprendiz.id, value)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="aprobado">Aprobado</SelectItem>
                                <SelectItem value="no aprobado">No Aprobado</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button>
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
