import { useEffect, useState, useCallback } from 'react';
import { roleService } from '../services/roleService';

export const useListRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await roleService.getRoles();
      setRoles(data);

    } catch (err) {
      setError(err.message);

      // 🔐 Manejo de 401 (token inválido o expirado)
      if (err.message.toLowerCase().includes('401')) {
        localStorage.removeItem('token');
        // aquí puedes redirigir si usas router
        // navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarRoles();
  }, [cargarRoles]);

  return {
    roles,
    loading,
    error,
    recargar: cargarRoles,
  };
};
