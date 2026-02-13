import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSolicitarCodigo } from "../hooks/useSolicitarCodigo";
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
import { Mail, ArrowLeft, Send, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { solicitar, loading, error } = useSolicitarCodigo();
  const [correo, setCorreo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await solicitar(correo);
      
      // Reset timer in localStorage for the new code
      const endTime = Date.now() + 600000; // 10 minutes
      localStorage.setItem(`verify-timer-${correo}`, JSON.stringify({ endTime }));
      localStorage.removeItem(`resend-cooldown-${correo}`);
      localStorage.removeItem(`verify-attempts-${correo}`); // Reset attempts counter
      
      navigate(`/login/verificar-codigo?correo=${correo}`);
    } catch {}
  };

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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary via-accent to-primary flex items-center justify-center shadow-lg">
                <KeyRound className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full border-4 border-background" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Ingresa tu correo electrónico y te enviaremos un código de verificación
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  className="h-12 pl-11 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
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

            {/* Info Message */}
            <div className="bg-accent/10 border border-accent/20 text-accent-foreground text-sm p-4 rounded-lg flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Recibirás un código de 6 dígitos válido por 10 minutos en tu correo electrónico
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
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
                  Enviando código...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Enviar código de verificación
                </span>
              )}
            </Button>

            {/* Back to Login */}
            <Link to="/login">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-border hover:bg-muted transition-all"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </form>

          {/* Footer */}
          <div className="pt-6 border-t border-border">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                ¿Necesitas ayuda? Contacta al administrador del sistema
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}