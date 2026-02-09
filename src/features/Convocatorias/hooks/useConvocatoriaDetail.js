'use client';

import { useState, useEffect, useCallback } from 'react';
import { convocatoriaService } from '../services/convocatoriaService';
import { aprendizService } from '../services/aprendizService';
import { pruebaSeleccionService } from '../services/pruebaSeleccionService';

export const useConvocatoriaDetail = (convocatoriaId) => {
  const [convocatoria, setConvocatoria] = useState(null);
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!convocatoriaId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [convData, aprendicesData] = await Promise.all([
        convocatoriaService.obtenerConvocatoriaPorId(convocatoriaId),
        aprendizService.obtenerAprendicesPorConvocatoria(convocatoriaId),
      ]);
      
      setConvocatoria(convData);
      // Ordenar aprendices por ranking
      const aprendicesOrdenados = aprendicesData.sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
      setAprendices(aprendicesOrdenados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [convocatoriaId]);

  const actualizarEstadoAprendiz = useCallback(async (aprendizId, nuevoEstado, options = {}) => {
    try {
      const result = await aprendizService.actualizarEstadoConvocatoria(aprendizId, nuevoEstado);
      const actualizado = result.aprendiz || result;
      setAprendices((prev) =>
        prev.map((a) => (a._id === aprendizId ? { ...a, estadoConvocatoria: nuevoEstado } : a))
      );
      if (nuevoEstado === 'seleccionado' && convocatoria && convocatoria._id) {
        try {
          const r = await pruebaSeleccionService.crearSiNoExiste({
            aprendizId: aprendizId,
            convocatoriaId: convocatoria._id,
          });
          const pruebaCreada = r.prueba;
          if (pruebaCreada && pruebaCreada._id) {
            setAprendices((prev) =>
              prev.map((a) =>
                a._id === aprendizId ? { ...a, pruebaSeleccionId: pruebaCreada._id } : a
              )
            );
          }
        } catch (e) {
        }
      }
      return actualizado;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [convocatoria]);

  const cerrarConvocatoria = useCallback(async () => {
    try {
      const seleccionados = aprendices.filter(
        (a) => a.estadoConvocatoria === 'seleccionado' && a.etapaActual === 'seleccion1'
      );
      for (const a of seleccionados) {
        try {
          const r = await aprendizService.actualizarAprendiz(a._id, { etapaActual: 'seleccion2' });
          const upd = r.aprendiz || r;
          setAprendices((prev) =>
            prev.map((x) => (x._id === a._id ? { ...x, etapaActual: 'seleccion2' } : x))
          );
        } catch (e) {
        }
      }
      const result = await convocatoriaService.cerrarConvocatoria(convocatoriaId);
      setConvocatoria((prev) => ({ ...prev, estado: 'finalizado' }));
      await fetchData();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [convocatoriaId, fetchData]);

  const reabrirConvocatoria = useCallback(async () => {
    try {
      await convocatoriaService.reabrirConvocatoria(convocatoriaId);
      setConvocatoria((prev) => ({ ...prev, estado: 'en proceso' }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [convocatoriaId]);

  const cargarExcelAdicional = useCallback(async (aprendicesNuevos) => {
    try {
      const result = await convocatoriaService.cargarExcelAdicional(convocatoriaId, aprendicesNuevos);
      await fetchData();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [convocatoriaId, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    convocatoria,
    aprendices,
    loading,
    error,
    fetchData,
    actualizarEstadoAprendiz,
    cerrarConvocatoria,
    reabrirConvocatoria,
    cargarExcelAdicional,
  };
};
