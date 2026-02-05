export const tienePermiso = (auth, modulo, accion) => {
  if (!auth || !auth.usuario?.rol) return false

  const permiso = auth.usuario.rol.permisos.find(
    p => p.permiso.modulo === modulo
  )

  if (!permiso) return false

  return permiso.privilegiosAsignados.some(
    priv => priv.clave === accion
  )
}
