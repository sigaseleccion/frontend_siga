'use client';

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ArrowLeft, Eye, Edit, FileText } from 'lucide-react'

export default function SeleccionConvocatoriaPage() {
  const { id: convocatoriaId } = useParams()

  const convocatoriaInfo = {
    id: convocatoriaId,
    nombreConvocatoria: 'Convocatoria Desarrollo Web 2024',
    nivelFormacion: 'Tecnologia',
  }

  const [aprendices] = useState([
    {
      id: '1',
      nombre: 'Maria Gonzalez Lopez',
      tipoDocumento: 'CC',
      documento: '9876543210',
      convocatoria: convocatoriaId,
      ciudad: 'Bogota',
      programaFormacion: 'Desarrollo de Software',
      fechaInicioLectiva: '2024-02-01',
      fechaFinLectiva: '2024-07-01',
      fechaInicioProductiva: '2024-07-02',
      fechaFinProductiva: '2025-01-01',
    },
    {
      id: '2',
      nombre: 'Ana Martinez Silva',
      tipoDocumento: 'TI',
      documento: '1111111111',
      convocatoria: convocatoriaId,
      ciudad: 'Medellin',
      programaFormacion: 'Administracion de Empresas',
      fechaInicioLectiva: '2024-01-15',
      fechaFinLectiva: '2024-06-15',
      fechaInicioProductiva: '2024-06-16',
      fechaFinProductiva: '2024-12-15',
    },
    {
      id: '3',
      nombre: 'Luis Castro Gomez',
      tipoDocumento: 'CE',
      documento: '2222222222',
      convocatoria: convocatoriaId,
      ciudad: 'Cali',
      programaFormacion: 'Contabilidad',
      fechaInicioLectiva: '2024-01-20',
      fechaFinLectiva: '2024-06-20',
      fechaInicioProductiva: '2024-06-21',
      fechaFinProductiva: '2024-12-20',
    },
  ])

  return (
    <div>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50 p-8">
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
              <span className="text-muted-foreground">{convocatoriaId}</span>
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
                    <tr key={aprendiz.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm font-medium">{aprendiz.nombre}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.tipoDocumento}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.documento}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.ciudad}</td>
                      <td className="py-3 px-4 text-sm">{aprendiz.programaFormacion}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(aprendiz.fechaInicioLectiva).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(aprendiz.fechaFinLectiva).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(aprendiz.fechaInicioProductiva).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(aprendiz.fechaFinProductiva).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz.id}/editar`}>
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
