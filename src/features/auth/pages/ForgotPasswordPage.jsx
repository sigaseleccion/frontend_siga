'use client';

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1100ff]/5 via-white to-[#d300ff]/5 p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#1100ff]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#d300ff]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#01e17f]/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d300ff] to-[#1100ff] flex items-center justify-center shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Recuperar contrasena
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSubmitted 
                ? 'Revisa tu correo electronico'
                : 'Ingresa tu correo para recibir instrucciones'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-[#01e17f]/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-[#01e17f]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-foreground font-medium">
                    Correo enviado exitosamente
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hemos enviado las instrucciones de recuperacion a <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </div>
              
              <Link to="/login" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-[#1100ff]/20 hover:bg-[#1100ff]/5 hover:border-[#1100ff]/40 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Correo electronico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white border-border focus:border-[#1100ff] focus:ring-[#1100ff]/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#d300ff] to-[#1100ff] hover:from-[#d300ff]/90 hover:to-[#1100ff]/90 text-white font-medium shadow-lg shadow-[#d300ff]/25 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar instrucciones
                  </span>
                )}
              </Button>

              <Link to="/login" className="block">
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full h-11 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesion
                </Button>
              </Link>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              Sistema de Gestion de Aprendices
            </p>
            <p className="text-center text-xs text-muted-foreground mt-1">
              MVM Seleccion
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
