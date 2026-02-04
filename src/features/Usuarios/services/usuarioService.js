const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en usuarioService.obtenerUsuarios:', error);
    throw error;
  }
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en usuarioService.obtenerUsuarioPorId:', error);
    throw error;
  }
};

// Crear usuario
export const crearUsuario = async (usuarioData) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(usuarioData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en usuarioService.crearUsuario:', error);
    throw error;
  }
};

// Actualizar usuario
export const actualizarUsuario = async (id, usuarioData) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(usuarioData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en usuarioService.actualizarUsuario:', error);
    throw error;
  }
};

// Eliminar usuario (desactivar)
export const eliminarUsuario = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en usuarioService.eliminarUsuario:', error);
    throw error;
  }
};
