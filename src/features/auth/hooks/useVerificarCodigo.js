import { useState } from "react"
import { authService } from "../services/authService"

export const useVerificarCodigo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const verificar = async (correo, codigo) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authService.verificarCodigo(correo, codigo)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { verificar, loading, error }
}
