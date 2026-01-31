'use client';

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useToast } from '@/shared/hooks/useToast'
import { ArrowLeft, CheckCircle, XCircle, Save, Clock, Lock } from 'lucide-react'

export default function AprendizEditPage() {
  const { id: convocatoriaId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [showAprobarDialog, setShowAprobarDialog] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [aprendiz] = useState({
    nombre: 'Maria Gonzalez Lopez',
    tipoDocumento: 'CC',
    documento: '9876543210',
    correo: 'maria.gonzalez@example.com',
    telefono: '+57 310 9876543',
    fechaInicioLectiva: '2024-02-01',
    fechaFinLectiva: '2024-07-01',
    fechaInicioProductiva: '2024-07-02',
    fechaFinProductiva: '2025-01-01',
    pruebaTecnica: 'aprobado',
  })

  const [initialState] = useState({
    pruebas: { psicologica: 'aprobado', medica: 'aprobado' },
    fechaInicioContrato: '2024-06-16',
    fechaFinContrato: '2024-12-15',
  })

  const [pruebas, setPruebas] = useState(initialState.pruebas)
  const [fechaInicioContrato, setFechaInicioContrato] = useState(initialState.fechaInicioContrato)
  const [fechaFinContrato, setFechaFinContrato] = useState(initialState.fechaFinContrato)

  useEffect(() => {
    const pruebasChanged =
      pruebas.psicologica !== initialState.pruebas.psicologica ||
      pruebas.medica !== initialState.pruebas.medica

    const fechasChanged =
      fechaInicioContrato !== initialState.fechaInicioContrato || fechaFinContrato !== initialState.fechaFinContrato

    setHasUnsavedChanges(pruebasChanged || fechasChanged)
  }, [pruebas, fechaInicioContrato, fechaFinContrato, initialState])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const todasPruebasAprobadas =
    pruebas.psicologica === 'aprobado' && 
    aprendiz.pruebaTecnica === 'aprobado' && 
    pruebas.medica === 'aprobado'

  const puedeAprobar = fechaInicioContrato !== '' && fechaFinContrato !== ''

  const handlePruebaChange = (prueba, estado) => {
    setPruebas((prev) => ({ ...prev, [prueba]: estado }))
  }

  const handleGuardar = () => {
    toast({
      title: 'Cambios Guardados',
      description: 'Los cambios se han guardado correctamente',
    })
    setHasUnsavedChanges(false)
  }

  const handleAprobar = () => {
    if (!puedeAprobar) return
    setShowAprobarDialog(true)
  }

  const confirmarAprobar = () => {
    setShowAprobarDialog(false)
    setHasUnsavedChanges(false)
    navigate(`/seleccion/${convocatoriaId}?aprobado=true&nombre=${encodeURIComponent(aprendiz.nombre)}`)
  }

  const handleBack = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      setShowUnsavedDialog(true)
    }
  }

  const confirmarSalir = () => {
    setHasUnsavedChanges(false)
    setShowUnsavedDialog(false)
    navigate(`/seleccion/${convocatoriaId}`)
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="h-4 w-4 text-primary-foreground" />
      case 'no aprobado':
        return <XCircle className="h-4 w-4 text-primary-foreground" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
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
        <div className="mb-6 flex items-center justify-between">
          <Link to={`/seleccion/${convocatoriaId}`} onClick={handleBack}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Convocatoria
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Editar Aprendiz</h1>
          <p className="text-muted-foreground">Gestionar pruebas y fechas de contrato</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Informacion del Aprendiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg break-words">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Nombre</p>
                  <p className="text-sm font-medium text-foreground break-words">{aprendiz.nombre}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg break-words">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Documento</p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {aprendiz.tipoDocumento} {aprendiz.documento}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg break-all overflow-hidden">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Correo</p>
                  <p className="text-sm font-medium text-foreground break-all">{aprendiz.correo}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg break-words">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Telefono</p>
                  <p className="text-sm font-medium text-foreground break-words">{aprendiz.telefono}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Fechas de Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fecha-inicio" className="text-sm font-semibold">
                  Fecha Inicio Contrato
                </Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={fechaInicioContrato}
                  onChange={(e) => setFechaInicioContrato(e.target.value)}
                  disabled={!todasPruebasAprobadas}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="fecha-fin" className="text-sm font-semibold">
                  Fecha Fin Contrato
                </Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={fechaFinContrato}
                  onChange={(e) => setFechaFinContrato(e.target.value)}
                  disabled={!todasPruebasAprobadas}
                  className="mt-2"
                />
              </div>
              {!todasPruebasAprobadas && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Las fechas se habilitaran cuando todas las pruebas esten aprobadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Pruebas de Seleccion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                <div className="relative flex items-start gap-4 pl-10">
                  <div className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(pruebas.psicologica)}`}>
                    {getEstadoIcon(pruebas.psicologica)}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <h4 className="font-semibold text-foreground">Prueba Psicologica</h4>
                    <div className="flex gap-3 items-center flex-wrap">
                      <Select value={pruebas.psicologica} onValueChange={(value) => handlePruebaChange('psicologica', value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="no aprobado">No Aprobado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-10">
                  <div className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(aprendiz.pruebaTecnica)}`}>
                    {getEstadoIcon(aprendiz.pruebaTecnica)}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">Prueba Tecnica</h4>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                      <div className="px-3 py-2 bg-muted/50 rounded-md border border-border">
                        <span className="text-sm capitalize">{aprendiz.pruebaTecnica}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este campo se modifica desde Reporte Tecnico
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-10">
                  <div className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(pruebas.medica)}`}>
                    {getEstadoIcon(pruebas.medica)}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <h4 className="font-semibold text-foreground">Examenes Medicos</h4>
                    <div className="flex gap-3 items-center flex-wrap">
                      <Select value={pruebas.medica} onValueChange={(value) => handlePruebaChange('medica', value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="no aprobado">No Aprobado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4 items-center justify-end flex-wrap">
          {!puedeAprobar && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex-1 min-w-[250px]">
              <p className="text-sm text-yellow-800">
                Complete las fechas de inicio y fin de contrato para habilitar la aprobacion
              </p>
            </div>
          )}
          <Button
            onClick={handleAprobar}
            disabled={!puedeAprobar}
            className="bg-green-600 hover:bg-green-700 text-primary-foreground shadow-md disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprobar Aprendiz
          </Button>
          {hasUnsavedChanges && (
            <Button onClick={handleGuardar} className="bg-primary hover:bg-primary/90 shadow-md">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
        </div>

        <Dialog open={showAprobarDialog} onOpenChange={setShowAprobarDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Aprobacion</DialogTitle>
              <DialogDescription>
                Estas seguro de que deseas que el aprendiz <strong>{aprendiz.nombre}</strong>, pase a estado "en
                seguimiento"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAprobarDialog(false)} className="bg-transparent">
                Cancelar
              </Button>
              <Button onClick={confirmarAprobar} className="bg-green-600 hover:bg-green-700">
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambios sin Guardar</DialogTitle>
              <DialogDescription>
                Desea salir sin guardar los cambios realizados? Los cambios se perderan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUnsavedDialog(false)} className="bg-transparent">
                Cancelar
              </Button>
              <Button onClick={confirmarSalir} variant="destructive">
                Salir sin Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
