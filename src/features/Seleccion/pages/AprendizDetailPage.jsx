'use client';

import { useParams, Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function AprendizDetailPage() {
  const { id: convocatoriaId } = useParams()

  const aprendiz = {
    nombre: 'Maria Gonzalez Lopez',
    documento: '9876543210',
    tipoDocumento: 'CC',
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
    fechaInicioContrato: '2024-06-16',
    fechaFinContrato: '2024-12-15',
    pruebas: [
      { nombre: 'Prueba Psicologica', estado: 'aprobado' },
      { nombre: 'Prueba Tecnica', estado: 'aprobado' },
      { nombre: 'Examenes Medicos', estado: 'aprobado' },
    ],
    aprendizAReemplazar: {
      nombre: 'Carlos Rodriguez Sanchez',
      documento: '5555555555',
      tipoDocumento: 'CC',
    },
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="h-4 w-4 text-primary-foreground" />
      case 'no aprobado':
        return <XCircle className="h-4 w-4 text-primary-foreground" />
      default:
        return <Clock className="h-4 w-4 text-primary-foreground" />
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-600'
      case 'no aprobado':
        return 'bg-red-600'
      default:
        return 'bg-muted'
    }
  }

  return (
    <div>
      <Navbar />
      <main className="ml-64 min-h-screen bg-gray-50 p-8">
        <div className="mb-6">
          <Link to={`/seleccion/${convocatoriaId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Convocatoria
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Detalle del Aprendiz</h1>
          <p className="text-muted-foreground mt-2">Informacion completa y estado de pruebas</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informacion Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="break-words">
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p className="text-sm break-words">{aprendiz.nombre}</p>
                </div>
                <div className="break-words">
                  <p className="text-sm font-medium text-muted-foreground">Documento</p>
                  <p className="text-sm break-words">
                    {aprendiz.tipoDocumento} {aprendiz.documento}
                  </p>
                </div>
                <div className="break-words">
                  <p className="text-sm font-medium text-muted-foreground">Pais</p>
                  <p className="text-sm break-words">{aprendiz.pais}</p>
                </div>
                <div className="break-words">
                  <p className="text-sm font-medium text-muted-foreground">Ciudad</p>
                  <p className="text-sm break-words">{aprendiz.ciudad}</p>
                </div>
                <div className="col-span-1 sm:col-span-2 break-words">
                  <p className="text-sm font-medium text-muted-foreground">Direccion</p>
                  <p className="text-sm break-words">{aprendiz.direccion}</p>
                </div>
                <div className="break-words">
                  <p className="text-sm font-medium text-muted-foreground">Telefono</p>
                  <p className="text-sm break-words">{aprendiz.telefono}</p>
                </div>
                <div className="break-words overflow-hidden">
                  <p className="text-sm font-medium text-muted-foreground">Correo</p>
                  <p className="text-sm break-all">{aprendiz.correo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informacion del Programa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="break-words">
                  <p className="text-sm font-medium text-muted-foreground">Programa de Formacion</p>
                  <p className="text-sm break-words">{aprendiz.programaFormacion}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inicio Lectiva</p>
                    <p className="text-sm">{new Date(aprendiz.fechaInicioLectiva).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fin Lectiva</p>
                    <p className="text-sm">{new Date(aprendiz.fechaFinLectiva).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inicio Productiva</p>
                    <p className="text-sm">{new Date(aprendiz.fechaInicioProductiva).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fin Productiva</p>
                    <p className="text-sm">{new Date(aprendiz.fechaFinProductiva).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Estado de Pruebas de Seleccion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {aprendiz.pruebas.map((prueba, index) => (
                  <div key={index} className="relative flex items-start gap-4 pl-10">
                    <div
                      className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${getEstadoColor(prueba.estado)}`}
                    >
                      {getEstadoIcon(prueba.estado)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium break-words">{prueba.nombre}</h4>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={prueba.estado === 'aprobado' ? 'default' : 'destructive'}>{prueba.estado}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
