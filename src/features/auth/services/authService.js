const API_URL = import.meta.env.VITE_API_URL

export const authService = {

  async solicitarCodigo(correo) {
    const res = await fetch(`${API_URL}/api/auth/solicitar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo })
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.mensaje || "Error al solicitar código")

    return data
  },

  async verificarCodigo(correo, codigo) {
    const res = await fetch(`${API_URL}/api/auth/verificar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo })
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.mensaje)

    return data
  },

  async restablecerContrasena(correo, codigo, nuevaContrasena) {
    const res = await fetch(`${API_URL}/api/auth/restablecer-contrasena`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo, nuevaContrasena })
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.mensaje)

    return data
  }

}
