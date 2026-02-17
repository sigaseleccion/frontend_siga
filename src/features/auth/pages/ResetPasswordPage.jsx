import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRestablecerContrasena } from "../hooks/useRestablecerContrasena";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Eye, EyeOff, Lock, CheckCircle2, Key, Check, X } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const correo = params.get("correo");
  const codigo = params.get("codigo");

  const { restablecer, error } = useRestablecerContrasena();

  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [exito, setExito] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const validaciones = {
    longitud: nueva.length >= 8,
    mayuscula: /[A-Z]/.test(nueva),
    minuscula: /[a-z]/.test(nueva),
    numero: /[0-9]/.test(nueva),
  };

  const esValida = Object.values(validaciones).every((v) => v);
  const coinciden = nueva === confirmar && confirmar.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!esValida || !coinciden) return;

    setIsLoading(true);
    try {
      await restablecer(correo, codigo, nueva);
      setExito(true);
    } catch {
      setIsLoading(false);
    }
  };

  // Success state
  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 backdrop-blur-sm">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-muted-foreground text-base">
                Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>

            {/* Success Info */}
            <div className="bg-accent/10 border border-accent/20 text-accent-foreground p-4 rounded-lg">
              <p className="text-sm">
                Por seguridad, te recomendamos cerrar todas las sesiones activas y volver a iniciar sesión.
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold shadow-lg shadow-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02]"
            >
              Ir a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative gradient circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 backdrop-blur-sm">
        <CardHeader className="space-y-6 pb-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg">
                <Key className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-4 border-background" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Crea una contraseña segura para tu cuenta
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="nueva" className="text-sm font-medium text-foreground">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="nueva"
                  type={showNueva ? "text" : "password"}
                  placeholder="Ingresa tu nueva contraseña"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  className="h-12 pl-11 pr-11 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNueva(!showNueva)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNueva ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
              <p className="text-sm font-medium text-foreground mb-3">La contraseña debe contener:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 text-sm ${validaciones.longitud ? 'text-accent' : 'text-muted-foreground'}`}>
                  {validaciones.longitud ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${validaciones.mayuscula ? 'text-accent' : 'text-muted-foreground'}`}>
                  {validaciones.mayuscula ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>Una mayúscula</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${validaciones.minuscula ? 'text-accent' : 'text-muted-foreground'}`}>
                  {validaciones.minuscula ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>Una minúscula</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${validaciones.numero ? 'text-accent' : 'text-muted-foreground'}`}>
                  {validaciones.numero ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>Un número</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmar" className="text-sm font-medium text-foreground">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmar"
                  type={showConfirmar ? "text" : "password"}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className={`h-12 pl-11 pr-11 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all ${
                    confirmar && !coinciden ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmar ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmar && !coinciden && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <X className="h-4 w-4" />
                  Las contraseñas no coinciden
                </p>
              )}
              {coinciden && (
                <p className="text-sm text-accent flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Las contraseñas coinciden
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
              disabled={!esValida || !coinciden || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Actualizando contraseña...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Restablecer contraseña
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Asegúrate de usar una contraseña única que no uses en otros sitios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}