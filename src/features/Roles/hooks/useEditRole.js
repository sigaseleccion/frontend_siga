import { useState } from 'react';
import { roleService } from '../services/roleService';

export const useEditRol = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editarRol = async (id, data) => {
    setLoading(true);
    setError(null);

    try {
      if (data.permisos && data.permisos.length === 0) {
        throw new Error('El rol debe tener al menos un permiso');
      }

      await roleService.updateRole(id, data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editarRol, loading, error };
};
