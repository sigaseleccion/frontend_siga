import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useVerificarCodigo } from "../hooks/useVerificarCodigo";
import { useSolicitarCodigo } from "../hooks/useSolicitarCodigo";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ArrowLeft, CheckCircle, ShieldCheck, RefreshCw, Clock } from "lucide-react";

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const correo = params.get("correo");

  const { verificar, error } = useVerificarCodigo();
  const { solicitar } = useSolicitarCodigo();

  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showMaxAttemptsModal, setShowMaxAttemptsModal] = useState(false);

  const inputRefs = useRef([]);

  // Initialize timer from localStorage or set to 600
  const getStorageKey = () => `verify-timer-${correo}`;
  const getResendKey = () => `resend-cooldown-${correo}`;
  const getAttemptsKey = () => `verify-attempts-${correo}`;

  const initializeTimer = () => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const { endTime } = JSON.parse(stored);
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      return remaining > 0 ? remaining : 0;
    }
    // Initialize with 600 seconds and save to localStorage
    const endTime = Date.now() + 600000; // 600 seconds = 10 minutes
    localStorage.setItem(getStorageKey(), JSON.stringify({ endTime }));
    return 600;
  };

  const [tiempo, setTiempo] = useState(initializeTimer);
  const [intentosFallidos, setIntentosFallidos] = useState(() => {
    const stored = localStorage.getItem(getAttemptsKey());
    return stored ? parseInt(stored, 10) : 0;
  });

  // Initialize resend cooldown from localStorage
  useEffect(() => {
    const storedCooldown = localStorage.getItem(getResendKey());
    if (storedCooldown) {
      const { endTime } = JSON.parse(storedCooldown);
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      if (remaining > 0) {
        setResendCooldown(remaining);
      }
    }
  }, [correo]);

  // Timer countdown with localStorage persistence
  useEffect(() => {
    if (tiempo <= 0) {
      localStorage.removeItem(getStorageKey());
      return;
    }

    const interval = setInterval(() => {
      setTiempo((prev) => {
        const newTime = prev - 1;
        
        // Update localStorage
        if (newTime > 0) {
          const endTime = Date.now() + newTime * 1000;
          localStorage.setItem(getStorageKey(), JSON.stringify({ endTime }));
        } else {
          localStorage.removeItem(getStorageKey());
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempo, correo]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) {
      localStorage.removeItem(getResendKey());
      return;
    }

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        const newTime = prev - 1;
        
        if (newTime > 0) {
          const endTime = Date.now() + newTime * 1000;
          localStorage.setItem(getResendKey(), JSON.stringify({ endTime }));
        } else {
          localStorage.removeItem(getResendKey());
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown, correo]);

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCodigo = [...codigo];
    newCodigo[index] = value.slice(-1); // Only take last digit
    setCodigo(newCodigo);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCodigo = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCodigo(newCodigo);

    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Verify code
  const verificarCodigo = async () => {
    const codigoCompleto = codigo.join("");
    if (codigoCompleto.length !== 6) return;

    setIsVerifying(true);
    try {
      await verificar(correo, codigoCompleto);
      
      // Success - clean up all localStorage
      localStorage.removeItem(getStorageKey());
      localStorage.removeItem(getResendKey());
      localStorage.removeItem(getAttemptsKey());
      
      navigate(`/login/restablecer-contrasena?correo=${correo}&codigo=${codigoCompleto}`);
    } catch (err) {
      // Increment failed attempts
      const newAttempts = intentosFallidos + 1;
      setIntentosFallidos(newAttempts);
      localStorage.setItem(getAttemptsKey(), newAttempts.toString());

      // Check if max attempts reached
      if (newAttempts >= 3) {
        setShowMaxAttemptsModal(true);
      }
      
      // Clear code inputs on error
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle max attempts - redirect to start over
  const handleMaxAttempts = () => {
    // Clean up all localStorage for this email
    localStorage.removeItem(getStorageKey());
    localStorage.removeItem(getResendKey());
    localStorage.removeItem(getAttemptsKey());
    
    navigate("/login/recuperar");
  };

  // Resend code
  const reenviar = async () => {
    setResendCooldown(10); // 10 seconds cooldown
    const endTime = Date.now() + 10000;
    localStorage.setItem(getResendKey(), JSON.stringify({ endTime }));
    
    await solicitar(correo);
    
    // Reset main timer to 600 seconds
    setTiempo(600);
    const newEndTime = Date.now() + 600000;
    localStorage.setItem(getStorageKey(), JSON.stringify({ endTime: newEndTime }));
    
    // Reset failed attempts counter
    setIntentosFallidos(0);
    localStorage.removeItem(getAttemptsKey());
    
    setCodigo(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-primary to-secondary flex items-center justify-center shadow-lg">
                <ShieldCheck className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-4 border-background" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Verificar código
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Ingresa el código de 6 dígitos enviado a<br />
              <span className="font-semibold text-foreground">{correo}</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
            <Clock className={`h-5 w-5 ${tiempo <= 60 ? 'text-destructive' : 'text-accent'}`} />
            <span className={`font-mono text-lg font-semibold ${tiempo <= 60 ? 'text-destructive' : 'text-foreground'}`}>
              {formatTime(tiempo)}
            </span>
            <span className="text-sm text-muted-foreground">restantes</span>
          </div>

          {/* Code Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground text-center block">
              Código de verificación
            </Label>
            <div className="flex gap-2 justify-center">
              {codigo.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold bg-background border-2 border-border rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                  disabled={tiempo <= 0}
                />
              ))}
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

          {/* Verify Button */}
          <Button
            onClick={verificarCodigo}
            className="w-full h-12 bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
            disabled={codigo.join("").length !== 6 || tiempo <= 0 || isVerifying}
          >
            {isVerifying ? (
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
                Verificando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verificar código
              </span>
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              ¿No recibiste el código?
            </p>
            <Button
              onClick={reenviar}
              variant="outline"
              className="w-full h-12 border-2 border-border hover:bg-muted transition-all"
              disabled={resendCooldown > 0 || tiempo > 590}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : 'Reenviar código'}
            </Button>
            {tiempo > 590 && resendCooldown === 0 && (
              <p className="text-xs text-muted-foreground">
                Podrás reenviar el código en {600 - tiempo} segundos
              </p>
            )}
          </div>

          {/* Back to forgot password */}
          <Link to="/login/recuperar">
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 hover:bg-muted transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Cambiar correo electrónico
            </Button>
          </Link>

          {/* Footer */}
          <div className="pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                El código expirará en {formatTime(tiempo)}. Por seguridad, no compartas este código.
              </p>
              {intentosFallidos > 0 && intentosFallidos < 3 && (
                <p className="text-xs text-destructive mt-2">
                  Intentos fallidos: {intentosFallidos}/3
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Max Attempts Modal */}
      {showMaxAttemptsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl border-destructive/20">
            <CardContent className="pt-12 pb-8 text-center space-y-6">
              {/* Warning Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Demasiados intentos fallidos
                </h3>
                <p className="text-muted-foreground">
                  Has ingresado un código incorrecto 3 veces. Por seguridad, debes reiniciar el proceso de recuperación de contraseña.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-left space-y-2">
                <p className="text-sm text-foreground font-medium">¿Por qué sucede esto?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Protección contra accesos no autorizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Seguridad de tu cuenta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Prevención de ataques automatizados</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleMaxAttempts}
                className="w-full h-12 bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive/80 text-destructive-foreground font-semibold shadow-lg transition-all"
              >
                Reiniciar proceso de recuperación
              </Button>

              <p className="text-xs text-muted-foreground">
                Serás redirigido para solicitar un nuevo código de verificación
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}