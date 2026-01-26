import { Navbar } from '@/shared/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Users, CheckCircle, Clock, AlertTriangle, BookOpen, Briefcase } from 'lucide-react'

export default function Dashboard() {
  const pruebasStats = {
    psicologica: { aprobados: 45, rechazados: 8 },
    tecnica: { aprobados: 42, rechazados: 11 },
    medica: { aprobados: 48, rechazados: 5 },
  }

  const proximosVencimientos = [
    { nombre: 'Juan Perez', dias: 5, program: 'Desarrollo de Software', etapa: 'lectiva' },
    { nombre: 'Maria Gonzalez', dias: 12, program: 'Administracion', etapa: 'lectiva' },
    { nombre: 'Carlos Rodriguez', dias: 18, program: 'Contabilidad', etapa: 'productiva' },
    { nombre: 'Ana Martinez', dias: 25, program: 'Marketing Digital', etapa: 'lectiva' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Main Dashboard</h1>
          <p className="text-muted-foreground">Vista general del sistema de gestion de aprendices</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Convocatorias Activas</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">12</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-600 font-medium">+12%</span>
                <p className="text-xs text-muted-foreground">vs mes anterior</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">En Seleccion</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">28</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-600 font-medium">+5%</span>
                <p className="text-xs text-muted-foreground">en proceso</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">En Seguimiento</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">145</div>
              <p className="text-xs text-muted-foreground mt-2">85 lectiva / 60 productiva</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Aprendices por Ciudad</CardTitle>
              <CardDescription>Distribucion geografica actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  { ciudad: 'Bogota', cantidad: 65, porcentaje: 65 },
                  { ciudad: 'Medellin', cantidad: 48, porcentaje: 48 },
                  { ciudad: 'Cali', cantidad: 22, porcentaje: 22 },
                  { ciudad: 'Otras', cantidad: 18, porcentaje: 18 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{item.ciudad}</span>
                      <span className="text-sm font-bold text-primary">{item.cantidad}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${item.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Proximos Vencimientos</CardTitle>
              <CardDescription>Aprendices que terminan etapa pronto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximosVencimientos.map((apprentice, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{apprentice.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{apprentice.program}</p>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 border-primary/30 text-primary bg-primary/5"
                        >
                          {apprentice.etapa === 'lectiva' ? (
                            <>
                              <BookOpen className="h-2.5 w-2.5 mr-1" />
                              Lectiva
                            </>
                          ) : (
                            <>
                              <Briefcase className="h-2.5 w-2.5 mr-1" />
                              Productiva
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={apprentice.dias <= 7 ? 'destructive' : 'secondary'} className="font-semibold ml-3">
                      {apprentice.dias} dias
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Resultados de Pruebas de Seleccion</CardTitle>
              <CardDescription>Estadisticas de aprobacion por prueba</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  { nombre: 'Prueba Psicologica', data: pruebasStats.psicologica },
                  { nombre: 'Prueba Tecnica', data: pruebasStats.tecnica },
                  { nombre: 'Examenes Medicos', data: pruebasStats.medica },
                ].map((prueba, i) => {
                  const total = prueba.data.aprobados + prueba.data.rechazados
                  const porcentaje = Math.round((prueba.data.aprobados / total) * 100)

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{prueba.nombre}</span>
                        <span className="text-sm font-bold text-primary">{porcentaje}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600 font-medium">Aprobados: {prueba.data.aprobados}</span>
                        <span className="text-muted-foreground">Rechazados: {prueba.data.rechazados}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                Alertas y Acciones Requeridas
              </CardTitle>
              <CardDescription>Tareas pendientes que requieren atencion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                      <span className="text-xs text-muted-foreground">5 casos</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Aprendices terminan etapa en menos de 7 dias
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Buscar reemplazos inmediatamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border-l-4 border-primary bg-primary/5 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs bg-primary">Importante</Badge>
                      <span className="text-xs text-muted-foreground">8 casos</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Pruebas de seleccion pendientes</p>
                    <p className="text-xs text-muted-foreground mt-1">Completar evaluaciones para avanzar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border-l-4 border-secondary bg-secondary/10 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs bg-secondary">Informacion</Badge>
                      <span className="text-xs text-muted-foreground">3 casos</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Convocatorias listas para cerrar</p>
                    <p className="text-xs text-muted-foreground mt-1">Revisar seleccion y confirmar cierre</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
