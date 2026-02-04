import { useState } from 'react';
import { roleService } from '../services/roleService';

export const useCreateRol = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearRol = async ({ nombre, descripcion, permisos }) => {
    setLoading(true);
    setError(null);

    try {
      if (!permisos || permisos.length === 0) {
        throw new Error('Debe asignar al menos un permiso');
      }

      await roleService.createRole({
        nombre,
        descripcion,
        permisos,
      });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { crearRol, loading, error };
};
