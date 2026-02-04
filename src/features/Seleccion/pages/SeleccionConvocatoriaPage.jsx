'use client';

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ArrowLeft, Eye, Edit, FileText } from 'lucide-react'
import { convocatoriaService } from '@/features/Convocatorias/services/convocatoriaService'
import { aprendizService } from '@/features/Convocatorias/services/aprendizService'

export default function SeleccionConvocatoriaPage() {
  const { id: convocatoriaId } = useParams()

  const [convocatoriaInfo, setConvocatoriaInfo] = useState({
    id: convocatoriaId,
    idConvocatoria: '',
    nombreConvocatoria: '',
    nivelFormacion: '',
  })

  const [aprendices, setAprendices] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        const conv = await convocatoriaService.obtenerConvocatoriaPorId(convocatoriaId)
        setConvocatoriaInfo({
          id: convocatoriaId,
          idConvocatoria: conv.idConvocatoria || '',
          nombreConvocatoria: conv.nombreConvocatoria,
          nivelFormacion: conv.nivelFormacion,
        })
        const aps = await aprendizService.obtenerAprendicesPorConvocatoria(convocatoriaId)
        setAprendices(aps.filter((a) => a.etapaActual === 'seleccion2'))
      } catch (e) {
        setError(e.message)
      }
    }
    loadData()
  }, [convocatoriaId])

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
          <Link to="/seleccion">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Seleccion
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{convocatoriaInfo.nombreConvocatoria}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">{convocatoriaInfo.nivelFormacion}</Badge>
              <span className="text-muted-foreground">{convocatoriaInfo.idConvocatoria || convocatoriaId}</span>
            </div>
          </div>
          <Link to={`/seleccion/${convocatoriaId}/reporte-tecnico`}>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Reporte Tecnico
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aprendices en Seleccion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo Doc.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">N. Documento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ciudad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Programa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Inicio Lectiva</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fin Lectiva</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Inicio Productiva</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fin Productiva</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {aprendices.map((aprendiz) => (
                    <tr key={aprendiz._id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm font-medium">{aprendiz.nombre}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.tipoDocumento}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.documento}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.ciudad}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.programaFormacion}</td>
                      <td className="py-3 px-4 text-sm">
                        {aprendiz.fechaInicioLectiva ? new Date(aprendiz.fechaInicioLectiva).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {aprendiz.fechaFinLectiva ? new Date(aprendiz.fechaFinLectiva).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {aprendiz.fechaInicioProductiva ? new Date(aprendiz.fechaInicioProductiva).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {aprendiz.fechaFinProductiva ? new Date(aprendiz.fechaFinProductiva).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz._id}/editar`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
