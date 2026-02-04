const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const permissionService = {
  // 🔹 Obtener todos los permisos (con sus privilegios disponibles)
  async getPermissions() {
    const response = await fetch(`${API_URL}/api/permisos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener los permisos');
    }

    return response.json();
  }
};
