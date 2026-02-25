import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckSquare, LayoutDashboard, Shield, TrendingUp, UserCog, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from '@/shared/hooks/useToast'
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

const getMonthKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const getMonthLabelWithDate = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
  } catch (e) {
    return getMonthKey(date)
  }
}

const getDotClassName = (type) => {
  if (type === 'urgent') return 'bg-red-500'
  if (type === 'urgent_warning') return 'bg-amber-500'
  if (type === 'important') return 'bg-primary'
  if (type === 'quota_ok') return 'bg-emerald-600'
  if (type === 'quota_under') return 'bg-amber-500'
  if (type === 'quota_over') return 'bg-fuchsia-600'
  return 'bg-secondary'
}

const getToastClassName = (type) => {
  if (type === 'urgent') return 'bg-red-600 text-white border-red-700'
  if (type === 'urgent_warning') return 'bg-amber-500 text-white border-amber-600'
  if (type === 'quota_ok') return 'bg-emerald-600 text-white border-emerald-700'
  if (type === 'quota_under') return 'bg-amber-500 text-white border-amber-600'
  if (type === 'quota_over') return 'bg-fuchsia-600 text-white border-fuchsia-700'
  if (type === 'important') return 'bg-blue-600 text-white border-blue-700'
  return 'bg-slate-800 text-white border-slate-900'
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
  const pollTimerRef = useRef(null)

  const previewLimit = 8

  const totalNotifications = notifications.length

  const previewNotifications = useMemo(
    () => notifications.slice(0, previewLimit),
    [notifications],
  )

  const groupedNotifications = useMemo(() => {
    const cuota = []
    const proyeccion = []
    const salientes = []

    for (const n of notifications) {
      if (String(n.id).startsWith('quota:')) cuota.push(n)
      else if (String(n.id).startsWith('proyeccion:')) proyeccion.push(n)
      else if (String(n.id).startsWith('salientes:')) salientes.push(n)
    }

    return { cuota, proyeccion, salientes }
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

  const loadNotifications = async ({ force = false, reason = 'init' } = {}) => {
    const now = Date.now()
    if (isLoading) return
    if (!force && now - lastLoadedAtRef.current < 15_000) return

    setIsLoading(true)
    setErrorMessage(null)

    const headers = getAuthHeaders()

    const [seguimientoResult, estadisticasResult] = await Promise.allSettled([
      fetchJson(`${API_URL}/api/seguimiento`, { method: 'GET', headers }),
      fetchJson(`${API_URL}/api/seguimiento/estadisticas`, { method: 'GET', headers }),
    ])

    const aprendicesSeguimiento = seguimientoResult.status === 'fulfilled' ? seguimientoResult.value : []
    const estadisticas = estadisticasResult.status === 'fulfilled' ? (estadisticasResult.value?.data || estadisticasResult.value) : null

    if (seguimientoResult.status === 'rejected' && estadisticasResult.status === 'rejected') {
      setErrorMessage('No se pudieron cargar notificaciones')
    }

    const cuotaMaximaRaw = typeof estadisticas?.cuota === 'number' ? estadisticas.cuota : null
    const cuotaMaxima = typeof cuotaMaximaRaw === 'number' && cuotaMaximaRaw > 0 ? cuotaMaximaRaw : 150
    const cuotaActual =
      typeof estadisticas?.totalActivos === 'number'
        ? estadisticas.totalActivos
        : typeof estadisticas?.totalEnSeguimiento === 'number'
          ? estadisticas.totalEnSeguimiento
          : 0
    const nowDate = new Date()
    const monthLabel = getMonthLabelWithDate(nowDate)
    const monthKey = getMonthKey()
    const dayOfMonth = nowDate.getDate()

    // Alerta 1: Cuota urgente actual (siempre visible, desde que falta 1 aprendiz)
    const cuotaNotifications = cuotaActual < cuotaMaxima
      ? [
          {
            id: `quota:${monthKey}`,
            type: 'quota_under',
            badge: 'Cuota',
            badgeVariant: 'secondary',
            badgeClassName: 'bg-amber-500 text-white hover:bg-amber-500',
            title: 'Cuota de aprendices no cumplida',
            description: `Faltan ${cuotaMaxima - cuotaActual} aprendiz(es) para completar la cuota · Actual: ${cuotaActual} / Meta: ${cuotaMaxima}`,
            href: '/seguimiento',
            priority: 1,
          },
        ]
      : []

    // Alerta 2: Proyección de cuota a fin de mes (solo días 1 al 15)
    const proyeccionNotifications = (() => {
      if (dayOfMonth < 1 || dayOfMonth > 15) return []
      if (!Array.isArray(aprendicesSeguimiento)) return []

      const terminanEsteMes = aprendicesSeguimiento.filter((a) => {
        const dias = a?.diasRestantes
        if (typeof dias !== 'number' || dias < 0) return false
        const endAt = new Date(nowDate)
        endAt.setDate(endAt.getDate() + dias)
        return getMonthKey(endAt) === monthKey
      })

      const proyeccion = cuotaActual - terminanEsteMes.length
      const cumple = proyeccion >= cuotaMaxima

      return [
        {
          id: `proyeccion:${monthKey}`,
          type: cumple ? 'quota_ok' : 'quota_under',
          badge: 'Proyección',
          badgeVariant: 'secondary',
          badgeClassName: cumple
            ? 'bg-emerald-600 text-white hover:bg-emerald-600'
            : 'bg-amber-500 text-white hover:bg-amber-500',
          title: cumple ? 'La cuota se mantendrá este mes' : 'La cuota no se cumplirá a fin de mes',
          description: cumple
            ? `${terminanEsteMes.length} aprendiz(es) terminan este mes · Proyección: ${proyeccion} / Meta: ${cuotaMaxima}`
            : `${terminanEsteMes.length} aprendiz(es) terminan contrato este mes · Proyección: ${proyeccion} / Meta: ${cuotaMaxima} · Faltan ${cuotaMaxima - proyeccion} adicionales`,
          href: '/seguimiento',
          priority: 2,
        },
      ]
    })()

    // Alerta 3: Aprendices que terminan contrato este mes (visible todo el mes)
    const salientesMesNotifications = (() => {
      if (!Array.isArray(aprendicesSeguimiento)) return []

      const terminanEsteMes = aprendicesSeguimiento
        .filter((a) => {
          const dias = a?.diasRestantes
          if (typeof dias !== 'number' || dias < 0) return false
          const endAt = new Date(nowDate)
          endAt.setDate(endAt.getDate() + dias)
          return getMonthKey(endAt) === monthKey
        })
        .sort((a, b) => (a?.diasRestantes ?? 999999) - (b?.diasRestantes ?? 999999))

      if (terminanEsteMes.length === 0) return []

      const preview = terminanEsteMes.slice(0, 5).map((a) => {
        const name = a?.nombre || 'Aprendiz'
        const dias = a?.diasRestantes
        return dias === 0 ? `${name} (hoy)` : `${name} (${dias}d)`
      })
      const remaining = terminanEsteMes.length - preview.length
      const suffix = remaining > 0 ? ` y ${remaining} más` : ''

      return [
        {
          id: `salientes:${monthKey}`,
          type: 'important',
          badge: 'Fin de contrato',
          badgeVariant: 'default',
          title: `${terminanEsteMes.length} aprendiz(es) terminan este mes`,
          description: `${monthLabel}: ${preview.join(', ')}${suffix}`,
          href: '/seguimiento',
          priority: 3,
        },
      ]
    })()

    const dismissedSet = new Set(Object.keys(dismissedMap))

    const nextNotifications = [
      ...cuotaNotifications,
      ...proyeccionNotifications,
      ...salientesMesNotifications,
    ]
      .filter((n) => !dismissedSet.has(n.id))
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return String(a.title).localeCompare(String(b.title), 'es')
      })

    // Disparar toasts solo al iniciar sesión (una vez por login)
    if (reason === 'init') {
      const justLoggedIn = sessionStorage.getItem('siga.just_logged_in') === '1'
      if (justLoggedIn) {
        sessionStorage.removeItem('siga.just_logged_in')
        const maxToasts = 3
        const toSend = nextNotifications.slice(0, maxToasts)
        toSend.forEach((n) => {
          toast({
            title: n.title,
            description: n.description,
            className: getToastClassName(n.type),
            duration: 6000,
          })
        })
        if (nextNotifications.length > maxToasts) {
          toast({
            title: 'Notificaciones',
            description: `Y ${nextNotifications.length - maxToasts} más`,
            className: getToastClassName('important'),
            duration: 6000,
          })
        }
      }
    }

    setNotifications(nextNotifications)
    lastLoadedAtRef.current = now
    setIsLoading(false)
  }

  useEffect(() => {
    loadNotifications({ force: true, reason: 'init' })
  }, [])

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
    pollTimerRef.current = setInterval(() => {
      loadNotifications({ force: false, reason: 'poll' })
    }, 15_000)
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
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
    loadNotifications({ force: true, reason: 'ui' })
  }, [open])

  useEffect(() => {
    if (!allOpen) return
    loadNotifications({ force: true, reason: 'ui' })
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
              <p className="text-xs font-semibold text-muted-foreground">Cuota actual</p>
            </div>
            <NotificationsList
              items={groupedNotifications.cuota}
              emptyText="Cuota de aprendices cumplida"
            />
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground">Proyección este mes</p>
            </div>
            <NotificationsList
              items={groupedNotifications.proyeccion}
              emptyText="Sin proyección disponible (solo días 1–15)"
            />
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground">Fin de contrato este mes</p>
            </div>
            <NotificationsList
              items={groupedNotifications.salientes}
              emptyText="Sin contratos finalizando este mes"
            />
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
export default NotificationsBell;
