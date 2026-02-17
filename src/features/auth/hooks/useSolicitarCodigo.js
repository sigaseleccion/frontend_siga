import { useState } from "react"
import { authService } from "../services/authService"

export const useSolicitarCodigo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const solicitar = async (correo) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authService.solicitarCodigo(correo)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { solicitar, loading, error }
}
