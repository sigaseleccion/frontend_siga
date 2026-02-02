'use client';

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

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Convocatorias', href: '/convocatorias', icon: Users },
  { title: 'Selección', href: '/seleccion', icon: CheckSquare },
  { title: 'Seguimiento', href: '/seguimiento', icon: TrendingUp },
  { title: 'Roles', href: '/roles', icon: Shield },
  { title: 'Usuarios', href: '/usuarios', icon: UserCog },
]

function NotificationsBell() {
  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'Aprendices terminan etapa en menos de 7 dias',
      description: '5 casos requieren atencion inmediata',
      count: 5,
      badge: 'Urgente',
      badgeVariant: 'destructive',
    },
    {
      id: 2,
      type: 'important',
      title: 'Pruebas de seleccion pendientes',
      description: '8 evaluaciones por completar',
      count: 8,
      badge: 'Importante',
      badgeVariant: 'default',
    },
    {
      id: 3,
      type: 'info',
      title: 'Convocatorias listas para cerrar',
      description: '3 convocatorias para revisar',
      count: 3,
      badge: 'Informacion',
      badgeVariant: 'secondary',
    },
  ]

  const totalNotifications = notifications.reduce((sum, n) => sum + n.count, 0)

  return (
    <DropdownMenu>
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
            Tienes {totalNotifications} alertas que requieren atencion
          </p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <DropdownMenuItem className="p-0 cursor-pointer hover:bg-muted focus:bg-muted">
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
                        <span className="text-xs text-muted-foreground">{notification.count} casos</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.description}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
              {index < notifications.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </div>
        <div className="p-3 border-t bg-muted/30">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary/80">
            Ver todas las notificaciones
          </Button>
        </div>
      </DropdownMenuContent>
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
        <NotificationsBell />
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