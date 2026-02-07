import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckSquare, LayoutDashboard, Shield, TrendingUp, UserCog, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Convocatorias', href: '/convocatorias', icon: Users },
  { title: 'Selección', href: '/seleccion', icon: CheckSquare },
  { title: 'Seguimiento', href: '/seguimiento', icon: TrendingUp },
  { title: 'Roles', href: '/roles', icon: Shield },
  { title: 'Usuarios', href: '/usuarios', icon: UserCog },
]

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    let errorMessage = 'Error al consultar el servidor'
    try {
      const error = await response.json()
      errorMessage = error?.message || errorMessage
    } catch (e) {
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

const DISMISSED_NOTIFICATIONS_KEY = 'siga.notifications.dismissed'
const DISMISSED_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const DISMISSED_MAX_ITEMS = 500

const readDismissedMap = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed
  } catch (e) {
    return {}
  }
}

const pruneDismissedMap = (map) => {
  const now = Date.now()
  const entries = Object.entries(map)
    .filter(([, ts]) => typeof ts === 'number' && now - ts <= DISMISSED_MAX_AGE_MS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, DISMISSED_MAX_ITEMS)

  return Object.fromEntries(entries)
}

const writeDismissedMap = (map) => {
  try {
    localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(map))
  } catch (e) {
  }
}

const getDateKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getMonthKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const getCurrentQuotaSlot = (date = new Date()) => {
  const hour = date.getHours()
  if (hour >= 16) return '16'
  if (hour >= 8) return '08'
  return null
}

const getNextQuotaTriggerAt = (now = new Date()) => {
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  const todayAt8 = new Date(y, m, d, 8, 0, 0, 0)
  const todayAt16 = new Date(y, m, d, 16, 0, 0, 0)

  if (now.getTime() < todayAt8.getTime()) return todayAt8
  if (now.getTime() < todayAt16.getTime()) return todayAt16
  return new Date(y, m, d + 1, 8, 0, 0, 0)
}

const formatMonthLabel = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
  } catch (e) {
    return getMonthKey(date)
  }
}

const getDotClassName = (type) => {
  if (type === 'urgent') return 'bg-red-500'
  if (type === 'important') return 'bg-primary'
  if (type === 'quota') return 'bg-amber-500'
  return 'bg-secondary'
}

function NotificationsBell({ onNavigate }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [allOpen, setAllOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [dismissedMap, setDismissedMap] = useState(() => {
    const initial = pruneDismissedMap(readDismissedMap())
    writeDismissedMap(initial)
    return initial
  })
  const lastLoadedAtRef = useRef(0)
  const quotaTimerRef = useRef(null)

  const previewLimit = 8

  const totalNotifications = notifications.length

  const previewNotifications = useMemo(
    () => notifications.slice(0, previewLimit),
    [notifications],
  )

  const groupedNotifications = useMemo(() => {
    const urgent = []
    const important = []
    const quota = []
    const info = []

    for (const n of notifications) {
      if (n.type === 'urgent') urgent.push(n)
      else if (n.type === 'important') important.push(n)
      else if (n.type === 'quota') quota.push(n)
      else info.push(n)
    }

    return { urgent, quota, important, info }
  }, [notifications])

  const dismissNotification = (id) => {
    if (!id) return

    setDismissedMap((prev) => {
      const next = pruneDismissedMap({ ...prev, [id]: Date.now() })
      writeDismissedMap(next)
      return next
    })

    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNavigate = (notification) => {
    if (!notification?.href) return
    dismissNotification(notification.id)
    setOpen(false)
    setAllOpen(false)
    if (typeof onNavigate === 'function') onNavigate(notification.href)
    else navigate(notification.href)
  }

  const loadNotifications = async ({ force = false } = {}) => {
    const now = Date.now()
    if (isLoading) return
    if (!force && now - lastLoadedAtRef.current < 15_000) return

    setIsLoading(true)
    setErrorMessage(null)

    const headers = getAuthHeaders()

    const [seguimientoResult, estadisticasResult, incompletosResult, pruebasResult] = await Promise.allSettled([
      fetchJson(`${API_URL}/api/seguimiento`, { method: 'GET', headers }),
      fetchJson(`${API_URL}/api/seguimiento/estadisticas`, { method: 'GET', headers }),
      fetchJson(`${API_URL}/api/seguimiento/incompletos`, { method: 'GET', headers }),
      fetchJson(`${API_URL}/api/pruebas-seleccion`, { method: 'GET', headers }),
    ])

    const aprendicesSeguimiento = seguimientoResult.status === 'fulfilled' ? seguimientoResult.value : []
    const estadisticas = estadisticasResult.status === 'fulfilled' ? (estadisticasResult.value?.data || estadisticasResult.value) : null
    const incompletos = incompletosResult.status === 'fulfilled' ? incompletosResult.value : []
    const pruebas = pruebasResult.status === 'fulfilled' ? pruebasResult.value : []

    if (
      seguimientoResult.status === 'rejected' &&
      estadisticasResult.status === 'rejected' &&
      incompletosResult.status === 'rejected' &&
      pruebasResult.status === 'rejected'
    ) {
      setErrorMessage('No se pudieron cargar notificaciones')
    }

    const urgentNotifications = Array.isArray(aprendicesSeguimiento)
      ? aprendicesSeguimiento
          .filter((a) => {
            const dias = a?.diasRestantes
            return typeof dias === 'number' && dias >= 0 && dias <= 7
          })
          .sort((a, b) => (a?.diasRestantes ?? 999999) - (b?.diasRestantes ?? 999999))
          .map((a) => ({
            id: `urgent:${a._id}`,
            type: 'urgent',
            badge: 'Urgente',
            badgeVariant: 'destructive',
            title: `${a?.nombre || 'Aprendiz'}${a?.documento ? ` (${a.documento})` : ''}`,
            description:
              typeof a?.diasRestantes === 'number'
                ? a.diasRestantes === 0
                  ? 'El contrato vence hoy'
                  : `El contrato vence en ${a.diasRestantes} días`
                : 'Contrato por vencer',
            href: '/seguimiento',
            priority: 1,
          }))
      : []

    const cuotaMaximaRaw = typeof estadisticas?.cuota === 'number' ? estadisticas.cuota : null
    const cuotaMaxima = typeof cuotaMaximaRaw === 'number' && cuotaMaximaRaw > 0 ? cuotaMaximaRaw : 150
    const cuotaActual = typeof estadisticas?.totalActivos === 'number' ? estadisticas.totalActivos : 0
    const monthLabel = formatMonthLabel()
    const todayKey = getDateKey()
    const currentSlot = getCurrentQuotaSlot()
    const slotLabel = currentSlot === '16' ? '16:00' : '08:00'

    const quotaNotifications =
      cuotaActual < cuotaMaxima && currentSlot
        ? [
            {
              id: `quota:${todayKey}:${currentSlot}`,
              type: 'quota',
              badge: 'Cuota',
              badgeVariant: 'secondary',
              badgeClassName: 'bg-amber-500 text-white hover:bg-amber-500',
              title: 'Cuota de aprendices no cumplida',
              description: `Mes: ${monthLabel} · Actual: ${cuotaActual} / Meta: ${cuotaMaxima} · Recordatorio ${slotLabel}`,
              href: '/seguimiento',
              priority: 2,
            },
          ]
        : []

    const importantNotifications = Array.isArray(pruebas)
      ? pruebas
          .map((p) => {
            const pendingParts = []
            if (p?.pruebaPsicologica === 'pendiente') pendingParts.push('Psicológica')
            if (p?.pruebaTecnica === 'pendiente') pendingParts.push('Técnica')
            if (p?.examenesMedicos === 'pendiente') pendingParts.push('Médicos')

            if (pendingParts.length === 0) return null

            const aprendizId =
              typeof p?.aprendizId === 'string' ? p.aprendizId : p?.aprendizId?._id
            const aprendizNombre =
              typeof p?.aprendizId === 'object' ? p?.aprendizId?.nombre : null
            const convocatoriaId =
              typeof p?.convocatoriaId === 'string' ? p.convocatoriaId : p?.convocatoriaId?._id

            const href =
              aprendizId && convocatoriaId
                ? `/seleccion/${convocatoriaId}/aprendiz/${aprendizId}`
                : '/seleccion'

            return {
              id: `important:${p?._id || `${aprendizId || 'apr'}:${convocatoriaId || 'conv'}`}`,
              type: 'important',
              badge: 'Importante',
              badgeVariant: 'default',
              title: `Pruebas pendientes${aprendizNombre ? ` · ${aprendizNombre}` : ''}`,
              description: `Pendiente: ${pendingParts.join(', ')}`,
              href,
              priority: 2,
            }
          })
          .filter(Boolean)
      : []

    const infoNotifications = Array.isArray(incompletos)
      ? incompletos.map((a) => ({
          id: `info:${a._id}`,
          type: 'info',
          badge: 'Información',
          badgeVariant: 'secondary',
          title: `${a?.nombre || 'Aprendiz'}${a?.documento ? ` (${a.documento})` : ''}`,
          description: `Datos incompletos${a?.etapaActual ? ` · Etapa: ${a.etapaActual}` : ''}`,
          href: '/seguimiento',
          priority: 3,
        }))
      : []

    const dismissedSet = new Set(Object.keys(dismissedMap))

    setNotifications(
      [...urgentNotifications, ...quotaNotifications, ...importantNotifications, ...infoNotifications]
        .filter((n) => !dismissedSet.has(n.id))
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority
          return String(a.title).localeCompare(String(b.title), 'es')
        }),
    )

    lastLoadedAtRef.current = now
    setIsLoading(false)

    if (quotaTimerRef.current) {
      clearTimeout(quotaTimerRef.current)
      quotaTimerRef.current = null
    }

    const nextTriggerAt = getNextQuotaTriggerAt(new Date())
    const delayMs = Math.max(1_000, nextTriggerAt.getTime() - Date.now() + 1_000)
    quotaTimerRef.current = setTimeout(() => {
      loadNotifications({ force: true })
    }, delayMs)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    return () => {
      if (quotaTimerRef.current) {
        clearTimeout(quotaTimerRef.current)
        quotaTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    setDismissedMap((prev) => {
      const next = pruneDismissedMap(prev)
      if (Object.keys(next).length !== Object.keys(prev).length) writeDismissedMap(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (!open) return
    loadNotifications()
  }, [open])

  useEffect(() => {
    if (!allOpen) return
    loadNotifications()
  }, [allOpen])

  const NotificationsList = ({ items, emptyText }) => {
    if (items.length === 0) {
      return (
        <div className="p-4 text-xs text-muted-foreground">
          {emptyText}
        </div>
      )
    }

    return (
      <div>
        {items.map((notification, index) => (
          <div key={notification.id}>
            <button
              type="button"
              onClick={() => handleNavigate(notification)}
              className="w-full text-left p-4 hover:bg-muted focus:bg-muted outline-none"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${getDotClassName(notification.type)}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={notification.badgeVariant}
                      className={`text-xs ${notification.badgeClassName || ''}`}
                    >
                      {notification.badge}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                </div>
              </div>
            </button>
            {index < items.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-foreground">Notificaciones</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {errorMessage
              ? errorMessage
              : isLoading
                ? 'Cargando…'
                : totalNotifications > 0
                  ? `Tienes ${totalNotifications} notificaciones`
                  : 'No tienes notificaciones'}
          </p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {previewNotifications.length === 0 && !isLoading ? (
            <div className="p-4 text-xs text-muted-foreground">Sin notificaciones</div>
          ) : (
            previewNotifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className="p-0 cursor-pointer hover:bg-muted focus:bg-muted"
                  onSelect={() => handleNavigate(notification)}
                >
                  <div className="w-full p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${getDotClassName(notification.type)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={notification.badgeVariant}
                            className={`text-xs ${notification.badgeClassName || ''}`}
                          >
                            {notification.badge}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < previewNotifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-gray-200 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary hover:text-primary/80"
            onClick={() => {
              setAllOpen(true)
              setOpen(false)
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </DropdownMenuContent>
      <Dialog open={allOpen} onOpenChange={setAllOpen}>
        <DialogContent className="max-w-2xl p-0">
          <div className="p-6 border-b border-gray-200">
            <DialogHeader className="space-y-2">
              <DialogTitle>Notificaciones</DialogTitle>
              <DialogDescription>
                {errorMessage
                  ? errorMessage
                  : isLoading
                    ? 'Cargando…'
                    : totalNotifications > 0
                      ? `Total: ${totalNotifications}`
                      : 'No hay notificaciones'}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadNotifications({ force: true })}
              >
                Actualizar
              </Button>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground">Urgentes</p>
            </div>
            <NotificationsList
              items={groupedNotifications.urgent}
              emptyText="Sin alertas urgentes"
            />
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground">Cuota de aprendices</p>
            </div>
            <NotificationsList
              items={groupedNotifications.quota}
              emptyText="Cuota cumplida"
            />
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground">Pruebas pendientes</p>
            </div>
            <NotificationsList
              items={groupedNotifications.important}
              emptyText="Sin pruebas pendientes"
            />
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground">Datos incompletos</p>
            </div>
            <NotificationsList
              items={groupedNotifications.info}
              emptyText="Sin registros incompletos"
            />
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
export default NotificationsBell;
