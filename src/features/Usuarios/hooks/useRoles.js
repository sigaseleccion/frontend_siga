'use client';

import { useState, useEffect } from 'react';
import { obtenerRoles } from '../services/rolService.js';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await obtenerRoles();
        setRoles(data);
      } catch (err) {
        setError(err.message);
        console.error('Error cargando roles:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarRoles();
  }, []);

  return {
    roles,
    loading,
    error
  };
};
