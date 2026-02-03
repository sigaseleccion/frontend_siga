'use client';

import { useState, useEffect, useCallback } from 'react';
import { convocatoriaService } from '../services/convocatoriaService';

export const useConvocatorias = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConvocatorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await convocatoriaService.obtenerConvocatorias();
      setConvocatorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearConvocatoria = useCallback(async (convocatoriaData, aprendices) => {
    try {
      setError(null);
      const result = await convocatoriaService.crearConvocatoriaConAprendices(convocatoriaData, aprendices);
      await fetchConvocatorias();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchConvocatorias]);

  useEffect(() => {
    fetchConvocatorias();
  }, [fetchConvocatorias]);

  return {
    convocatorias,
    loading,
    error,
    fetchConvocatorias,
    crearConvocatoria,
  };
};
