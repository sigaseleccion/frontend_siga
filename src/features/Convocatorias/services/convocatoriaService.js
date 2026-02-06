const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const convocatoriaService = {
  // Obtener todas las convocatorias
  async obtenerConvocatorias() {
    const response = await fetch(`${API_URL}/api/convocatorias`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener convocatorias');
    }
    return response.json();
  },
  async obtenerConvocatoriasArchivadas() {
    const response = await fetch(`${API_URL}/api/convocatorias/archivadas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener convocatorias archivadas');
    }
    return response.json();
  },

  // Obtener convocatoria por ID
  async obtenerConvocatoriaPorId(id) {
    const response = await fetch(`${API_URL}/api/convocatorias/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener convocatoria');
    }
    return response.json();
  },

  // Crear convocatoria con aprendices desde Excel
  async crearConvocatoriaConAprendices(convocatoriaData, aprendices) {
    const response = await fetch(`${API_URL}/api/convocatorias/crear-con-aprendices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ convocatoria: convocatoriaData, aprendices }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear convocatoria');
    }
    return response.json();
  },

  // Actualizar convocatoria
  async actualizarConvocatoria(id, data) {
    const response = await fetch(`${API_URL}/api/convocatorias/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar convocatoria');
    }
    return response.json();
  },

  // Cerrar convocatoria
  async cerrarConvocatoria(id) {
    const response = await fetch(`${API_URL}/api/convocatorias/${id}/cerrar`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cerrar convocatoria');
    }
    return response.json();
  },

  // Reabrir convocatoria
  async reabrirConvocatoria(id) {
    const response = await fetch(`${API_URL}/api/convocatorias/${id}/reabrir`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al reabrir convocatoria');
    }
    return response.json();
  },

  // Cargar Excel adicional
  async cargarExcelAdicional(convocatoriaId, aprendices) {
    const response = await fetch(`${API_URL}/api/convocatorias/${convocatoriaId}/cargar-excel-adicional`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ aprendices }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar Excel adicional');
    }
    return response.json();
  },

  // Archivar convocatoria
  async archivarConvocatoria(id) {
    const response = await fetch(`${API_URL}/api/convocatorias/${id}/archivar`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al archivar convocatoria');
    }
    return response.json();
  },
};
