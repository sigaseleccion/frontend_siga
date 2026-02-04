'use client';

import { useState, useEffect } from 'react';
import { obtenerUsuarios } from '../services/usuarioService.js';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    refetch: cargarUsuarios
  };
};
