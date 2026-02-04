import { useState } from 'react';
import { roleService } from '../services/roleService';

export const useDeleteRol = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarRol = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await roleService.deleteRole(id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { eliminarRol, loading, error };
};
