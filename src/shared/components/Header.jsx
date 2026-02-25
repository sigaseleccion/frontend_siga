"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "../contexts/auth/AuthContext";
import { confirmAlert } from "./ui/SweetAlert";
import NotificationsBell from "./NotificationsBell";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

export const Header = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-white",
  iconBg = "from-blue-600 to-violet-600",
  iconSize = "h-5 w-5",
  actions,
  breadcrumbs = [],
  backTo,
  onToggleMenu,
}) => {
  const { auth, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const result = await confirmAlert({
      title: "¿Cerrar sesión?",
      text: "¿Estas seguro de que deseas cerrar sesión?",
      confirmText: "Si, cerrar sesión",
      cancelText: "Cancelar",
    });
    if (result.isConfirmed) logout();
  };

  return (
    <div className="relative z-50">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2 bg-white border-b border-slate-100">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <a href={crumb.href} className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-xs text-slate-800 font-semibold">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header bar — fondo blanco limpio */}
      <div className="bg-white border-b border-slate-200 flex items-center justify-between h-16 px-5 gap-3">

        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onToggleMenu && (
            <button
              onClick={onToggleMenu}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {backTo && (
            <button
              onClick={() => backTo === "back" ? navigate(-1) : navigate(backTo)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          )}

          {Icon && (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon className={`${iconSize} ${iconColor}`} />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}

          <NotificationsBell onNavigate={(href) => navigate(href)} />

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1.5 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {auth?.usuario?.nombre}
              </span>
            </button>

            {/* Dropdown */}
            <div
              className={cn(
                "absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 overflow-hidden transition-all duration-200",
                open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}
            >
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">{auth?.usuario?.nombre}</p>
                <p className="text-xs text-slate-400 mt-0.5">Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;