import { useState } from "react"
import { authService } from "../services/authService"

export const useRestablecerContrasena = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const restablecer = async (correo, codigo, nuevaContrasena) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authService.restablecerContrasena(
        correo,
        codigo,
        nuevaContrasena
      )
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { restablecer, loading, error }
}
