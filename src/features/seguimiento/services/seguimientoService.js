// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token');
//   return {
//     'Content-Type': 'application/json',
//     ...(token && { Authorization: `Bearer ${token}` }),
//   };
// };

// export const seguimientoService = {
//   // Obtener aprendices en seguimiento con filtros
//   async obtenerAprendices(filtros = {}) {
//     const params = new URLSearchParams();
//     if (filtros.etapa) params.append('etapa', filtros.etapa);
//     if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

//     const queryString = params.toString();
//     const url = `${API_URL}/api/seguimiento${queryString ? `?${queryString}` : ''}`;

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al obtener aprendices');
//     }
//     return response.json();
//   },

//   // Obtener estadisticas del dashboard
//   async obtenerEstadisticas() {
//     const response = await fetch(`${API_URL}/api/seguimiento/estadisticas`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al obtener estadisticas');
//     }
//     return response.json();
//   },

//   // Obtener aprendices incompletos
//   async obtenerIncompletos() {
//     const response = await fetch(`${API_URL}/api/seguimiento/incompletos`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al obtener aprendices incompletos');
//     }
//     return response.json();
//   },

//   // Obtener detalle de un aprendiz
//   async obtenerAprendiz(id) {
//     const response = await fetch(`${API_URL}/api/seguimiento/${id}`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al obtener aprendiz');
//     }
//     return response.json();
//   },

//   // Cambiar etapa de un aprendiz
//   async cambiarEtapa(id, nuevaEtapa) {
//     const response = await fetch(`${API_URL}/api/seguimiento/${id}/etapa`, {
//       method: 'PUT',
//       headers: getAuthHeaders(),
//       body: JSON.stringify({ nuevaEtapa }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al cambiar etapa');
//     }
//     return response.json();
//   },

//   // Asignar reemplazo a un aprendiz
//   async asignarReemplazo(id, reemplazoId) {
//     const response = await fetch(`${API_URL}/api/seguimiento/${id}/reemplazo`, {
//       method: 'PUT',
//       headers: getAuthHeaders(),
//       body: JSON.stringify({ reemplazoId }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al asignar reemplazo');
//     }
//     return response.json();
//   },

//   // Obtener aprendices recomendados para reemplazo
//   async obtenerRecomendadosReemplazo(fechaFinContrato) {
//     const params = new URLSearchParams({ fechaFinContrato });
//     const response = await fetch(`${API_URL}/api/seguimiento/recomendados-reemplazo?${params}`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al obtener recomendados');
//     }
//     return response.json();
//   },

//   // Actualizar fechas de aprendiz
//   async actualizarFechas(id, fechas) {
//     const response = await fetch(`${API_URL}/api/seguimiento/${id}/fechas`, {
//       method: 'PUT',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(fechas),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al actualizar fechas');
//     }
//     return response.json();
//   },

//   // Actualizar etapas automáticamente según fechaInicioProductiva
//   async actualizarEtapasAutomaticas() {
//     const response = await fetch(`${API_URL}/api/seguimiento/actualizar-etapas-automaticas`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Error al actualizar etapas automáticamente');
//     }
//     return response.json();
//   },
// };


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const seguimientoService = {
  // Obtener aprendices en seguimiento con filtros
  async obtenerAprendices(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.etapa) params.append('etapa', filtros.etapa);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

    const queryString = params.toString();
    const url = `${API_URL}/api/seguimiento${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener aprendices');
    }
    return response.json();
  },

  // Obtener estadisticas del dashboard
  async obtenerEstadisticas() {
    const response = await fetch(`${API_URL}/api/seguimiento/estadisticas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener estadisticas');
    }
    return response.json();
  },

  // Obtener aprendices incompletos
  async obtenerIncompletos() {
    const response = await fetch(`${API_URL}/api/seguimiento/incompletos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener aprendices incompletos');
    }
    return response.json();
  },

  // Obtener detalle de un aprendiz
  async obtenerAprendiz(id) {
    const response = await fetch(`${API_URL}/api/seguimiento/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener aprendiz');
    }
    return response.json();
  },

  // Cambiar etapa de un aprendiz
  async cambiarEtapa(id, nuevaEtapa) {
    const response = await fetch(`${API_URL}/api/seguimiento/${id}/etapa`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nuevaEtapa }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cambiar etapa');
    }
    return response.json();
  },

  // Asignar reemplazo a un aprendiz
  async asignarReemplazo(id, reemplazoId) {
    const response = await fetch(`${API_URL}/api/seguimiento/${id}/reemplazo`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reemplazoId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al asignar reemplazo');
    }
    return response.json();
  },

  // Obtener aprendices recomendados para reemplazo
  async obtenerRecomendadosReemplazo(fechaFinContrato) {
    const params = new URLSearchParams({ fechaFinContrato });
    const response = await fetch(`${API_URL}/api/seguimiento/recomendados-reemplazo?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener recomendados');
    }
    return response.json();
  },

  // Actualizar fechas de aprendiz
  async actualizarFechas(id, fechas) {
    const response = await fetch(`${API_URL}/api/seguimiento/${id}/fechas`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(fechas),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar fechas');
    }
    return response.json();
  },

  // Actualizar etapas automáticamente según fechaInicioProductiva
  async actualizarEtapasAutomaticas() {
    const response = await fetch(`${API_URL}/api/seguimiento/actualizar-etapas-automaticas`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar etapas automáticamente');
    }
    return response.json();
  },

  // Obtener aprendices del histórico (finalizados)
  async obtenerHistorico(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

    const queryString = params.toString();
    const url = `${API_URL}/api/seguimiento/historico${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener histórico');
    }
    return response.json();
  },
};
