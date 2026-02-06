'use client';

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { ArrowLeft, Archive, Eye } from 'lucide-react'
import { convocatoriaService } from '@/features/Convocatorias/services/convocatoriaService'

export default function HistoricoConvocatoriasPage() {
  const [archivedConvocatorias, setArchivedConvocatorias] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadArchived = async () => {
      try {
        setError(null)
        const data = await convocatoriaService.obtenerConvocatoriasArchivadas()
        setArchivedConvocatorias(
          data.map((c) => ({
            id: c._id,
            idConvocatoria: c.idConvocatoria,
            nombreConvocatoria: c.nombreConvocatoria,
            programa: c.programa,
            nivelFormacion: c.nivelFormacion,
            totalAprendices: c.totalAprendices,
            fechaArchivado: c.fechaArchivado,
          }))
        )
      } catch (e) {
        setError(e.message)
      }
    }
    loadArchived()
  }, [])

  const getNivelFormacionLabel = (nivel) => {
    const labels = { tecnica: 'Tecnica', tecnologia: 'Tecnologia', profesional: 'Profesional' }
    return labels[nivel]
  }

  return (
    <div>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <Link to="/seleccion">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Seleccion
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Archive className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Historico Convocatorias</h1>
              <p className="text-muted-foreground mt-1">
                Convocatorias archivadas del proceso de seleccion
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Convocatorias Archivadas</CardTitle>
          </CardHeader>
          <CardContent>
            {archivedConvocatorias.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Convocatoria</TableHead>
                    <TableHead>Nombre Convocatoria</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Nivel Formacion</TableHead>
                    <TableHead className="text-center">Total Aprendices</TableHead>
                    <TableHead>Fecha Archivado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedConvocatorias.map((convocatoria) => (
                    <TableRow key={convocatoria.id}>
                      <TableCell className="font-medium">{convocatoria.idConvocatoria || convocatoria.id}</TableCell>
                      <TableCell className="font-medium">{convocatoria.nombreConvocatoria}</TableCell>
                      <TableCell>{convocatoria.programa}</TableCell>
                      <TableCell>{getNivelFormacionLabel(convocatoria.nivelFormacion)}</TableCell>
                      <TableCell className="text-center">{convocatoria.totalAprendices}</TableCell>
                      <TableCell>
                        {new Date(convocatoria.fechaArchivado).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Link to={`/seleccion/historico/${convocatoria.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalle
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay convocatorias archivadas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
