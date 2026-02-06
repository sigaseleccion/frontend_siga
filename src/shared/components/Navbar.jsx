'use client';

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { LayoutDashboard, Users, CheckSquare, TrendingUp, Shield, UserCog, LogOut, Bell } from 'lucide-react'
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

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Convocatorias', href: '/convocatorias', icon: Users },
  { title: 'Selección', href: '/seleccion', icon: CheckSquare },
  { title: 'Seguimiento', href: '/seguimiento', icon: TrendingUp },
  { title: 'Roles', href: '/roles', icon: Shield },
  { title: 'Usuarios', href: '/usuarios', icon: UserCog },
]

function NotificationsBell({ onNavigate }) {
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

  const previewLimit = 8

  const totalNotifications = notifications.length

  const previewNotifications = useMemo(
    () => notifications.slice(0, previewLimit),
    [notifications],
  )

  const groupedNotifications = useMemo(() => {
    const urgent = []
    const important = []
    const info = []

    for (const n of notifications) {
      if (n.type === 'urgent') urgent.push(n)
      else if (n.type === 'important') important.push(n)
      else info.push(n)
    }

    return { urgent, important, info }
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
    onNavigate(notification.href)
  }

  const loadNotifications = async ({ force = false } = {}) => {
    const now = Date.now()
    if (isLoading) return
    if (!force && now - lastLoadedAtRef.current < 15_000) return

    setIsLoading(true)
    setErrorMessage(null)

    const headers = getAuthHeaders()

    const [seguimientoResult, incompletosResult, pruebasResult] = await Promise.allSettled([
      fetchJson(`${API_URL}/api/seguimiento`, { method: 'GET', headers }),
      fetchJson(`${API_URL}/api/seguimiento/incompletos`, { method: 'GET', headers }),
      fetchJson(`${API_URL}/api/pruebas-seleccion`, { method: 'GET', headers }),
    ])

    const aprendicesSeguimiento = seguimientoResult.status === 'fulfilled' ? seguimientoResult.value : []
    const incompletos = incompletosResult.status === 'fulfilled' ? incompletosResult.value : []
    const pruebas = pruebasResult.status === 'fulfilled' ? pruebasResult.value : []

    if (
      seguimientoResult.status === 'rejected' &&
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
      [...urgentNotifications, ...importantNotifications, ...infoNotifications]
        .filter((n) => !dismissedSet.has(n.id))
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority
          return String(a.title).localeCompare(String(b.title), 'es')
        }),
    )

    lastLoadedAtRef.current = now
    setIsLoading(false)
  }

  useEffect(() => {
    loadNotifications()
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
                  className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${notification.type === 'urgent'
                      ? 'bg-red-500'
                      : notification.type === 'important'
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={notification.badgeVariant} className="text-xs">
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
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="p-4 border-b">
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
                        className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${notification.type === 'urgent'
                            ? 'bg-red-500'
                            : notification.type === 'important'
                              ? 'bg-primary'
                              : 'bg-secondary'
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={notification.badgeVariant} className="text-xs">
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
        <div className="p-3 border-t bg-muted/30">
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
          <div className="p-6 border-b">
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

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-72 flex flex-col bg-white border-r border-border/50 shadow-sm z-50">
      {/* Header */}
      <div className="flex h-20 items-center justify-between px-8 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1100ff] to-[#d300ff] flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">MV</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">MVM Selección</h2>
            <p className="text-xs text-muted-foreground">Sistema de Aprendices</p>
          </div>
        </div>
        <NotificationsBell onNavigate={(href) => navigate(href)} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#1100ff] to-[#1100ff]/90 text-white shadow-md shadow-[#1100ff]/20"
                  : "text-muted-foreground hover:bg-[#1100ff]/5 hover:text-[#1100ff]",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-border/50 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
