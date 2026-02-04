'use client';

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Navbar } from '@/shared/components/Navbar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Eye, Search, Users, Archive, History } from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'
import { convocatoriaService } from '@/features/Convocatorias/services/convocatoriaService'
import { aprendizService } from '@/features/Convocatorias/services/aprendizService'
import { pruebaSeleccionService } from '@/features/Convocatorias/services/pruebaSeleccionService'

export default function SeleccionPage() {
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null)

  const [convocatorias, setConvocatorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (searchParams.get('aprobado') === 'true') {
      const nombre = searchParams.get('nombre') || 'el aprendiz'
      toast({
        title: 'Aprendiz aprobado con exito',
        description: `${nombre} ha pasado a estado "en seguimiento"`,
        className: 'bg-green-600 text-white border-green-700',
        duration: 5000,
      })
      window.history.replaceState({}, '', '/seleccion')
    }
  }, [searchParams, toast])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const convs = await convocatoriaService.obtenerConvocatorias()
        const enriched = await Promise.all(
          convs.map(async (conv) => {
            const aprendices = await aprendizService.obtenerAprendicesPorConvocatoria(conv._id)
            const seleccionados = aprendices.filter((a) => a.etapaActual === 'seleccion2')
            let aprobadas = 0
            let totalPruebasPendientes = 0
            for (const a of seleccionados) {
              if (a.pruebaSeleccionId) {
                try {
                  const pruebas = await pruebaSeleccionService.obtenerPorAprendiz(a._id)
                  const ps = Array.isArray(pruebas) ? pruebas[0] : null
                  if (ps) {
                    totalPruebasPendientes += ['pruebaPsicologica', 'pruebaTecnica', 'examenesMedicos'].filter(
                      (k) => ps[k] === 'pendiente'
                    ).length
                    aprobadas += ['pruebaPsicologica', 'pruebaTecnica', 'examenesMedicos'].filter(
                      (k) => ps[k] === 'aprobado'
                    ).length
                  }
                } catch (e) {
                  console.error(e)
                }
              }
            }
            return {
              id: conv._id,
            idConvocatoria: conv.idConvocatoria,
              nombreConvocatoria: conv.nombreConvocatoria,
              programa: conv.programa,
              nivelFormacion: conv.nivelFormacion,
              fechaCreacion: conv.fechaCreacion,
              totalAprendices: seleccionados.length,
              aprendicesConPruebasCompletas: aprobadas,
              totalPruebasPendientes,
            }
          })
        )
        setConvocatorias(enriched)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getNivelFormacionLabel = (nivel) => {
    const labels = { tecnica: 'Tecnica', tecnologia: 'Tecnologia', profesional: 'Profesional' }
    return labels[nivel]
  }

  const filteredConvocatorias = convocatorias.filter((conv) =>
    conv.nombreConvocatoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleArchiveClick = (convocatoria) => {
    setSelectedConvocatoria(convocatoria)
    setArchiveDialogOpen(true)
  }

  const handleConfirmArchive = () => {
    if (selectedConvocatoria) {
      const existingArchived = JSON.parse(localStorage.getItem('archivedConvocatorias') || '[]')
      const archivedConvocatoria = {
        ...selectedConvocatoria,
        fechaArchivado: new Date().toISOString().split('T')[0],
      }
      existingArchived.push(archivedConvocatoria)
      localStorage.setItem('archivedConvocatorias', JSON.stringify(existingArchived))
      setConvocatorias(convocatorias.filter((c) => c.id !== selectedConvocatoria.id))
      setArchiveDialogOpen(false)
      setSelectedConvocatoria(null)
    }
  }

  const isPruebasCompletas = (conv) => {
    return conv.aprendicesConPruebasCompletas > 0 && conv.totalAprendices > 0
  }

  return (
    <div>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50 p-8">
        {loading && (
          <Card className="mb-4">
            <CardContent className="p-4 text-muted-foreground bg-muted/30 border border-border">
              Cargando...
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="mb-4">
            <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
              {error}
            </CardContent>
          </Card>
        )}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Seleccion</h1>
            <p className="text-muted-foreground mt-2">
              Proceso completo de evaluacion de aprendices agrupados por convocatoria
            </p>
          </div>
          <Link to="/seleccion/historico">
            <Button variant="outline" className="bg-transparent">
              <History className="h-4 w-4 mr-2" />
              Historico
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar convocatoria por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConvocatorias.map((convocatoria) => (
            <Card key={convocatoria.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{getNivelFormacionLabel(convocatoria.nivelFormacion)}</Badge>
                  <span className="text-xs text-muted-foreground">{convocatoria.idConvocatoria || convocatoria.id}</span>
                </div>
                <CardTitle className="text-lg">{convocatoria.nombreConvocatoria}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {convocatoria.totalAprendices} aprendices en seleccion2
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {convocatoria.aprendicesConPruebasCompletas}/
                      {convocatoria.totalAprendices * 3 || 0} pruebas aprobadas
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creada: {new Date(convocatoria.fechaCreacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to={`/seleccion/${convocatoria.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Aprendices
                  </Button>
                </Link>
                {isPruebasCompletas(convocatoria) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => handleArchiveClick(convocatoria)}
                    title="Archivar convocatoria"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredConvocatorias.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron convocatorias con ese nombre</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archivar Convocatoria</DialogTitle>
              <DialogDescription>
                Desea archivar esta convocatoria? Este proceso es irreversible.
              </DialogDescription>
            </DialogHeader>
            {selectedConvocatoria && (
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Convocatoria: <span className="font-medium text-foreground">{selectedConvocatoria.nombreConvocatoria}</span>
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchiveDialogOpen(false)} className="bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleConfirmArchive}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
