"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "../contexts/auth/AuthContext";
import { confirmAlert } from "./ui/SweetAlert";
import NotificationsBell from "./NotificationsBell";
import { useNavigate } from "react-router-dom";

/**
 * Header Component - Topbar para las páginas
 *
 * @param {string} title - Título principal de la página
 * @param {string} subtitle - Subtítulo o descripción (opcional)
 * @param {React.ReactNode} icon - Icono para mostrar (componente de lucide-react)
 * @param {React.ReactNode} actions - Botones o acciones del lado derecho (opcional)
 * @param {Array} breadcrumbs - Array de objetos para el breadcrumb (opcional)
 *   Ejemplo: [{ label: 'Roles', href: '/roles' }, { label: 'Crear' }]
 * @param {function} onToggleMenu - Función para alternar el menú (colapsar/expandir)
 */

export const Header = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-white",
  iconBg = "from-[#1100ff] to-[#d300ff]",
  iconSize = "h-5 w-6",
  actions,
  breadcrumbs = [],
  backTo, // URL para el botón de volver
  onToggleMenu,
}) => {
  const { auth, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const result = await confirmAlert({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas cerrar sesión?",
      confirmText: "Sí, cerrar sesión",
      cancelText: "Cancelar",
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  return (
    <div className="relative z-50">
      {/* Breadcrumbs (opcional) */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-sm text-gray-900 font-medium">
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header principal */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between h-15">
        <div className="flex items-center gap-3 flex-1 px-4">
          {onToggleMenu && (
            <button
              onClick={onToggleMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Alternar menú"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* ⬅️ Botón volver (alineado al título) */}
          {backTo && (
            <button
              onClick={() =>
                backTo === "back" ? navigate(-1) : navigate(backTo)
              }
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          )}

          {/* Icono */}
          {Icon && (
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconBg} 
            flex items-center justify-center shadow-md`}
            >
              <Icon className={`${iconSize} ${iconColor}`} />
            </div>
          )}

          {/* Título */}
          <div className="flex flex-col">
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Acciones (botones, etc.) */}
        {/* 👉 Zona derecha SIEMPRE visible */}
        <div className="flex items-center gap-2 mr-4">
          {/* Acciones de la página (opcional) */}
          {actions}

          {/* 🔔 Notificaciones (SIEMPRE) */}
          <NotificationsBell onNavigate={(href) => navigate(href)} />

          {/* 👤 Perfil usuario (SIEMPRE) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              className="flex items-center gap-3 rounded-full px-3 py-2 transition hover:bg-gray-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>

              <span className="text-sm font-medium text-gray-800">
                {auth?.usuario?.nombre}
              </span>
            </button>

            <div
              className={`absolute right-0 mt-2 w-35 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl transition-all duration-200
        ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
            >
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex w-full items-center justify-start gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
