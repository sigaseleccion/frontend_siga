const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const aprendizService = {
  // Obtener todos los aprendices
  async obtenerAprendices() {
    const response = await fetch(`${API_URL}/api/aprendices`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener aprendices');
    }
    return response.json();
  },

  // Obtener aprendices por convocatoria
  async obtenerAprendicesPorConvocatoria(convocatoriaId) {
    const response = await fetch(`${API_URL}/api/aprendices/convocatoria/${convocatoriaId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener aprendices de la convocatoria');
    }
    return response.json();
  },

  // Obtener aprendiz por ID
  async obtenerAprendizPorId(id) {
    const response = await fetch(`${API_URL}/api/aprendices/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener aprendiz');
    }
    return response.json();
  },

  // Actualizar aprendiz
  async actualizarAprendiz(id, data) {
    const response = await fetch(`${API_URL}/api/aprendices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar aprendiz');
    }
    return response.json();
  },

  // Actualizar estado de aprendiz en convocatoria
  async actualizarEstadoConvocatoria(id, estadoConvocatoria) {
    const response = await fetch(`${API_URL}/api/aprendices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estadoConvocatoria }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar estado del aprendiz');
    }
    return response.json();
  },
};
