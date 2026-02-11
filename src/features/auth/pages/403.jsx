import { useState, useEffect } from "react";

export default function Error403() {
 

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden relative">
      {/* Decorative gradient circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
      ></div>

      <div
        className={`max-w-2xl w-full text-center transition-all duration-1000`}
      >
        {/* Lock icon */}
        <div className="mb-8 flex justify-center">
          <svg
            className="w-32 h-32 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Error code */}
        <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          403
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Acceso Prohibido
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          No tienes permiso para acceder a esta página. Si crees que esto es un
          error, contacta al administrador.
        </p>

        {/* Additional info cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Protegido</h3>
            <p className="text-sm text-muted-foreground">
              Este recurso está protegido
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 hover:border-secondary transition-colors">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Autenticación
            </h3>
            <p className="text-sm text-muted-foreground">
              Credenciales requeridas
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-primary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Ir al Inicio
          </button>
        </div>

        {/* Error code detail */}
        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            Código de error:{" "}
            <span className="font-mono text-foreground">403 FORBIDDEN</span>
          </p>
        </div>
      </div>
    </div>
  );
}
