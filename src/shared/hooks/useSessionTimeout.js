import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/auth/AuthContext";
import { toast } from "sonner";

export const useSessionTimeout = () => {
  const { auth, logout } = useAuth();
  const warningTimeout = useRef(null);
  const logoutTimeout = useRef(null);

  useEffect(() => {
    if (!auth?.token) return;

    const payload = JSON.parse(atob(auth.token.split(".")[1]));
    const now = Date.now();
    const expTime = payload.exp * 1000;
    const timeLeft = expTime - now;

    if (timeLeft <= 0) {
      logout();
      return;
    }

    // 🧹 Limpieza
    clearTimeout(warningTimeout.current);
    clearTimeout(logoutTimeout.current);

    const warningShown = sessionStorage.getItem("session-warning-shown");

    if (!warningShown) {
      warningTimeout.current = setTimeout(() => {
        toast.warning("Tu sesión expirará en 1 minuto. Guarda tu trabajo.", {
          duration: 60_000,
        });

        // ✅ marcar como mostrado
        sessionStorage.setItem("session-warning-shown", "true");
      }, timeLeft - 60_000);
    }

    // 🚪 Logout automático al expirar
    logoutTimeout.current = setTimeout(() => {
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Tu sesión ha expirado. Inicia sesión nuevamente.",
        confirmButtonText: "Iniciar sesión",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        backdrop: true,
        returnFocus: false,

        didOpen: () => {
          // 🔥 re-habilita SOLO SweetAlert
          const popup = Swal.getPopup();
          popup.style.pointerEvents = "auto";
          Swal.getConfirmButton()?.focus();
        },
      }).then(() => logout());
    }, timeLeft);

    return () => {
      clearTimeout(warningTimeout.current);
      clearTimeout(logoutTimeout.current);
    };
  }, [auth?.token, logout]);
};
