const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Obtener todos los roles
export const obtenerRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/api/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener roles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en rolService.obtenerRoles:', error);
    throw error;
  }
};

// Obtener rol por ID
export const obtenerRolPorId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/roles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener rol');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en rolService.obtenerRolPorId:', error);
    throw error;
  }
};
