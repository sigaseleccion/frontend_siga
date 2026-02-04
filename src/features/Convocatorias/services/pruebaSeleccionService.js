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
};
