const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const roleService = {
  // Obtener todos los roles
  async getRoles() {
    const response = await fetch(`${API_URL}/api/roles`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener los roles");
    }
    return response.json();
  },

  // Obtener rol por ID
  async getRolId(id) {
    const response = await fetch(`${API_URL}/api/roles/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener el rol");
    }
    return response.json();
  },

  // Crear rol
  async createRole(data) {
    const response = await fetch(`${API_URL}/api/roles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || "Error al crear el rol");
    }

    return response.json();
  },

  // Actualizar rol
  async updateRole(id, data) {
    const response = await fetch(`${API_URL}/api/roles/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || "Error al actualizar el rol");
    }

    return response.json();
  },

  // Eliminar (desactivar) rol
  async deleteRole(id) {
    const response = await fetch(`${API_URL}/api/roles/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.mensaje || "Error al eliminar rol");
      error.status = response.status;
      throw error;
    }

    return data;
  },
};
