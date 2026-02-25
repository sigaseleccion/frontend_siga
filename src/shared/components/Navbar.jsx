import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  TrendingUp,
  Shield,
  UserCog,
} from "lucide-react";
import { useAuth } from "../contexts/auth/AuthContext";
import { tienePermiso } from "../utils/auth/permissions";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    modulo: "dashboard",
    accion: "ver",
  },
  {
    title: "Convocatorias",
    href: "/convocatorias",
    icon: Users,
    modulo: "convocatorias",
    accion: "ver",
  },
  {
    title: "Seleccion",
    href: "/seleccion",
    icon: CheckSquare,
    modulo: "seleccion",
    accion: "ver",
  },
  {
    title: "Seguimiento",
    href: "/seguimiento",
    icon: TrendingUp,
    modulo: "seguimiento",
    accion: "ver",
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: UserCog,
    modulo: "usuarios",
    accion: "ver",
  },
  {
    title: "Roles",
    href: "/roles",
    icon: Shield,
    modulo: "roles",
    accion: "ver",
  },
];

export function Navbar({
  collapsed = false,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}) {
  const location = useLocation();
  const { auth } = useAuth();
  const isExpanded = isMobile || !collapsed;

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300",
          "bg-gradient-to-b from-purple-600 via-indigo-600 to-blue-500",
          isMobile
            ? cn("w-72", mobileOpen ? "translate-x-0" : "-translate-x-full")
            : collapsed
              ? "w-20"
              : "w-72",
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 gap-3 flex-shrink-0 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 bg-white">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Logo SIGA"
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>
          {isExpanded && (
            <div>
              <p className="text-[16px] font-extrabold text-white leading-none tracking-tight">
                SIGA
              </p>
              <p className="text-[10px] text-white/70 font-medium tracking-widest uppercase mt-1">
                Gestión de Aprendices
              </p>
            </div>
          )}
        </div>

        {/* Section label */}
        {isExpanded && (
          <p className="px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
            Principal
          </p>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2.5 py-1 flex flex-col gap-0.5 overflow-y-auto">
          {navItems
            .filter((item) => tienePermiso(auth, item.modulo, item.accion))
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  title={!isExpanded ? item.title : ""}
                  className={cn(
                    "flex items-center gap-3 rounded-xl text-[15px] font-medium transition-all duration-150",
                    isExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                    isActive
                      ? "bg-white text-blue-700 shadow-md font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] flex-shrink-0",
                      isActive ? "text-blue-600" : "text-white/50",
                    )}
                  />
                  {isExpanded && <span>{item.title}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 pb-3 pt-2 border-t border-white/10 flex-shrink-0">
          {isExpanded ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-[11px] text-white/40 font-medium">
                Sistema activo
              </span>
              <span className="ml-auto text-[10px] text-white/20">v1.0</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
