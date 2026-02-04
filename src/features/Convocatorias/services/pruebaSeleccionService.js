const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const pruebaSeleccionService = {
  async crearSiNoExiste({ aprendizId, convocatoriaId }) {
    const response = await fetch(`${API_URL}/api/pruebas-seleccion`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        aprendizId,
        convocatoriaId,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear prueba de selección');
    }
    return response.json();
  },
  async obtenerPorAprendiz(aprendizId) {
    const response = await fetch(`${API_URL}/api/pruebas-seleccion/aprendiz/${aprendizId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener pruebas del aprendiz');
    }
    return response.json();
  },
  async obtenerPorId(id) {
    const response = await fetch(`${API_URL}/api/pruebas-seleccion/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener prueba de selección');
    }
    return response.json();
  },
  async actualizarPrueba(id, data) {
    const response = await fetch(`${API_URL}/api/pruebas-seleccion/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar prueba de selección');
    }
    return response.json();
  },
};
