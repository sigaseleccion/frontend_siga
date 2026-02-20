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
const SENT_SLOTS_KEY = 'siga.notifications.sentSlots'
const DISMISSED_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const DISMISSED_MAX_ITEMS = 500
const SENT_MAX_ITEMS = 1000
const CHANGE_TOAST_MIN_INTERVAL_MS = 30_000

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

const readSentSlotsMap = () => {
  try {
    const raw = localStorage.getItem(SENT_SLOTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed
  } catch (e) {
    return {}
  }
}

const pruneSentSlotsMap = (map) => {
  const entries = Object.entries(map)
    .filter(([, slotKey]) => typeof slotKey === 'string' && slotKey.length <= 32)
    .slice(-SENT_MAX_ITEMS)
  return Object.fromEntries(entries)
}

const writeSentSlotsMap = (map) => {
  try {
    localStorage.setItem(SENT_SLOTS_KEY, JSON.stringify(map))
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

const isWithinSendWindow = (now = new Date()) => {
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  const start = new Date(y, m, d, 8, 0, 0, 0)
  const end = new Date(y, m, d, 16, 0, 0, 0)
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime()
}

const getNextSendTrigger = (now = new Date()) => {
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  const todayAt8 = new Date(y, m, d, 8, 0, 0, 0)
  const todayAt16 = new Date(y, m, d, 16, 0, 0, 0)

  if (now.getTime() < todayAt8.getTime()) return { at: todayAt8, slot: '08' }
  if (now.getTime() < todayAt16.getTime()) return { at: todayAt16, slot: '16' }
  return { at: new Date(y, m, d + 1, 8, 0, 0, 0), slot: '08' }
}

const formatMonthLabel = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
  } catch (e) {
    return getMonthKey(date)
  }
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

const getNotificationSignature = (notification) => {
  return [
    notification?.type,
    notification?.badge,
    notification?.title,
    notification?.description,
    notification?.href,
  ].join('|')
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
  const sendTimerRef = useRef(null)
  const pollTimerRef = useRef(null)
  const hasLoadedOnceRef = useRef(false)
  const knownSignaturesRef = useRef(new Map())
  const lastChangeToastAtRef = useRef(new Map())

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
      if (String(n.type).startsWith('urgent')) urgent.push(n)
      else if (n.type === 'important') important.push(n)
      else if (String(n.type).startsWith('quota_')) quota.push(n)
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

  const loadNotifications = async ({ force = false, reason = 'poll', slot = null } = {}) => {
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

    const shouldNotifyReplacement = cuotaActual < cuotaMaxima

    const urgentNotifications = Array.isArray(aprendicesSeguimiento)
      ? aprendicesSeguimiento
          .filter((a) => {
            const dias = a?.diasRestantes
            if (typeof dias !== 'number') return false

            const etapa = String(a?.etapaActual || '').toLowerCase()
            const isLectiva = etapa.includes('lectiva')

            if (isLectiva) {
              if (!shouldNotifyReplacement) return false
              if (dias === -1) return true
              return dias >= 0 && dias <= 62
            }

            if (dias < 0) return false
            return dias <= 7
          })
          .sort((a, b) => {
            const da = a?.diasRestantes
            const db = b?.diasRestantes
            const na = da === -1 ? -9999 : (da ?? 999999)
            const nb = db === -1 ? -9999 : (db ?? 999999)
            return na - nb
          })
          .map((a) => {
            const dias = a?.diasRestantes
            const etapa = String(a?.etapaActual || '').toLowerCase()
            const isLectiva = etapa.includes('lectiva')

            const isReplacement = isLectiva && (dias === -1 || (typeof dias === 'number' && dias >= 0 && dias <= 62))
            const isRed = isReplacement ? (dias === -1 || dias <= 30) : (dias <= 7)

            const type = isRed ? 'urgent' : 'urgent_warning'
            const badgeVariant = isRed ? 'destructive' : 'secondary'
            const badgeClassName = isRed ? null : 'bg-amber-500 text-white hover:bg-amber-500'

            const description = isReplacement
              ? dias === -1
                ? 'Sin reemplazo para prácticas · Buscar reemplazo'
                : dias === 0
                  ? 'Inicia prácticas hoy · Buscar reemplazo'
                  : `Inicia prácticas en ${dias} días · Buscar reemplazo`
              : dias === 0
                ? 'El contrato vence hoy'
                : `El contrato vence en ${dias} días`

            return {
              id: isReplacement ? `urgent_replacement:${a._id}` : `urgent_contract:${a._id}`,
              type,
              badge: 'Urgente',
              badgeVariant,
              ...(badgeClassName ? { badgeClassName } : {}),
              title: `${a?.nombre || 'Aprendiz'}${a?.documento ? ` (${a.documento})` : ''}`,
              description,
              href: '/seguimiento',
              priority: 1,
            }
          })
      : []

    const quotaNotifications =
      [
        {
          id: `quota:${monthKey}`,
          type:
            cuotaActual === cuotaMaxima
              ? 'quota_ok'
              : cuotaActual < cuotaMaxima
                ? 'quota_under'
                : 'quota_over',
          badge: 'Cuota',
          badgeVariant: 'secondary',
          badgeClassName:
            cuotaActual === cuotaMaxima
              ? 'bg-emerald-600 text-white hover:bg-emerald-600'
              : cuotaActual < cuotaMaxima
                ? 'bg-amber-500 text-white hover:bg-amber-500'
                : 'bg-fuchsia-600 text-white hover:bg-fuchsia-600',
          title:
            cuotaActual === cuotaMaxima
              ? 'Cuota de aprendices cumplida'
              : cuotaActual < cuotaMaxima
                ? 'Cuota de aprendices no cumplida'
                : 'Cuota de aprendices excedida',
          description:
            cuotaActual === cuotaMaxima
              ? `Mes: ${monthLabel} · Actual: ${cuotaActual} / Meta: ${cuotaMaxima} · ¡Excelente!`
              : cuotaActual < cuotaMaxima
                ? `Mes: ${monthLabel} · Actual: ${cuotaActual} / Meta: ${cuotaMaxima}`
                : `Mes: ${monthLabel} · Actual: ${cuotaActual} / Meta: ${cuotaMaxima} · Excedida (+${cuotaActual - cuotaMaxima})`,
          href: '/seguimiento',
          priority: 2,
        },
      ]

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

    const contractEndNotifications = (() => {
      if (!Array.isArray(aprendicesSeguimiento)) return []
      const dayOfMonth = nowDate.getDate()
      if (dayOfMonth < 1 || dayOfMonth > 15) return []

      const endingThisMonth = aprendicesSeguimiento
        .filter((a) => {
          const dias = a?.diasRestantes
          if (typeof dias !== 'number' || dias < 0) return false
          const endAt = new Date(nowDate)
          endAt.setDate(endAt.getDate() + dias)
          return getMonthKey(endAt) === monthKey
        })
        .sort((a, b) => (a?.diasRestantes ?? 999999) - (b?.diasRestantes ?? 999999))

      if (endingThisMonth.length === 0) return []

      const preview = endingThisMonth.slice(0, 5).map((a) => {
        const name = a?.nombre || 'Aprendiz'
        const dias = typeof a?.diasRestantes === 'number' ? a.diasRestantes : null
        return dias === null ? name : `${name} (${dias}d)`
      })
      const remaining = endingThisMonth.length - preview.length
      const suffix = remaining > 0 ? ` y ${remaining} más` : ''

      return [
        {
          id: `contract_end:${monthKey}`,
          type: 'important',
          badge: 'Importante',
          badgeVariant: 'default',
          title: `Fin de contrato (${monthLabel})`,
          description: `${endingThisMonth.length} aprendiz(es) finalizan contrato este mes: ${preview.join(', ')}${suffix}`,
          href: '/seguimiento',
          priority: 2,
        },
      ]
    })()

    const dismissedSet = new Set(Object.keys(dismissedMap))

    const nextNotifications = [...urgentNotifications, ...quotaNotifications, ...contractEndNotifications, ...importantNotifications, ...infoNotifications]
      .filter((n) => !dismissedSet.has(n.id))
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return String(a.title).localeCompare(String(b.title), 'es')
      })

    const withinWindow = isWithinSendWindow(nowDate)
    const previousSignatures = knownSignaturesRef.current
    const nextSignatures = new Map()

    const newItems = []
    const changedItems = []

    for (const n of nextNotifications) {
      const signature = getNotificationSignature(n)
      nextSignatures.set(n.id, signature)

      const prevSignature = previousSignatures.get(n.id)
      if (!prevSignature) newItems.push(n)
      else if (prevSignature !== signature) changedItems.push(n)
    }

    const sendScheduled = reason === 'schedule' && (slot === '08' || slot === '16')
    if (sendScheduled) {
      const slotKey = `${getDateKey(nowDate)}:${slot}`
      const sentMap = pruneSentSlotsMap(readSentSlotsMap())
      let sentCount = 0
      const maxToasts = 3
      for (const n of nextNotifications) {
        if (sentCount >= maxToasts) break
        if (sentMap[n.id] === slotKey) continue
        toast({
          title: n.title,
          description: n.description,
          className: getToastClassName(n.type),
          duration: 5000,
        })
        sentMap[n.id] = slotKey
        sentCount += 1
      }
      if (nextNotifications.length - sentCount > 0) {
        toast({
          title: 'Notificaciones',
          description: `Y ${nextNotifications.length - sentCount} más`,
          className: getToastClassName('important'),
          duration: 5000,
        })
      }
      writeSentSlotsMap(sentMap)
    } else if (hasLoadedOnceRef.current && withinWindow && (newItems.length > 0 || changedItems.length > 0)) {
      const candidates = changedItems.length > 0 ? changedItems : newItems
      const main = candidates[0]
      const total = candidates.length

      const lastToastAt = lastChangeToastAtRef.current.get(main.id) || 0
      if (Date.now() - lastToastAt >= CHANGE_TOAST_MIN_INTERVAL_MS) {
        toast({
          title: total > 1 ? `${total} notificaciones actualizadas` : main.title,
          description: main.description,
          className: getToastClassName(main.type),
          duration: 5000,
        })
        lastChangeToastAtRef.current.set(main.id, Date.now())
      }
    }

    knownSignaturesRef.current = nextSignatures
    hasLoadedOnceRef.current = true
    setNotifications(nextNotifications)

    lastLoadedAtRef.current = now
    setIsLoading(false)

    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current)
      sendTimerRef.current = null
    }

    const nextTrigger = getNextSendTrigger(new Date())
    const delayMs = Math.max(1_000, nextTrigger.at.getTime() - Date.now() + 1_000)
    sendTimerRef.current = setTimeout(() => {
      loadNotifications({ force: true, reason: 'schedule', slot: nextTrigger.slot })
    }, delayMs)
  }

  useEffect(() => {
    loadNotifications({ force: true, reason: 'init' })
  }, [])

  useEffect(() => {
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current)
        sendTimerRef.current = null
      }
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
