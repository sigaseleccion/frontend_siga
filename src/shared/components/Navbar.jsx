import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { LayoutDashboard, Users, CheckSquare, TrendingUp, Shield, UserCog } from 'lucide-react'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Convocatorias', href: '/convocatorias', icon: Users },
  { title: 'Selección', href: '/seleccion', icon: CheckSquare },
  { title: 'Seguimiento', href: '/seguimiento', icon: TrendingUp },
  { title: 'Roles', href: '/roles', icon: Shield },
  { title: 'Usuarios', href: '/usuarios', icon: UserCog },
]

export function Navbar({ collapsed = false }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className={`fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-border/50 shadow-sm z-50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Header */}
      <div className="flex h-15 items-center justify-between border-b border-border/50 flex-shrink-0 px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1100ff] to-[#d300ff] flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">GB</span>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-foreground">SIGA</h2>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1100ff] to-[#d300ff] flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">GB</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.title : ''}
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all duration-200",
                collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                "text-[16px] font-medium",
                isActive
                  ? "bg-gradient-to-r from-[#1100ff] to-[#1100ff]/90 text-white shadow-md shadow-[#1100ff]/20"
                  : "text-muted-foreground hover:bg-[#1100ff]/5 hover:text-[#1100ff]",
              )}
            >
              <Icon className="h-5 w-6 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border/50 flex-shrink-0">
      </div>
    </div>
  )
}
