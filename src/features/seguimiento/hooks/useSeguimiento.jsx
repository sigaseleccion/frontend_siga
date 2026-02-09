'use client';

import { useState, useEffect, useCallback } from 'react';
import { seguimientoService } from '../services/seguimientoService';

export const useSeguimiento = (filtrosIniciales = {}) => {
  const [aprendices, setAprendices] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    enEtapaLectiva: 0,
    enEtapaProductiva: 0,
    cuota: { actual: 0, maximo: 150 },
    aprendicesIncompletos: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const cargarAprendices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await seguimientoService.obtenerAprendices(filtros);
      // El backend devuelve el array directamente, no envuelto en { data: ... }
      const data = Array.isArray(response) ? response : (response.data || []);
      setAprendices(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando aprendices:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros, refreshCounter]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await seguimientoService.obtenerEstadisticas();
      // El backend devuelve: { enLectiva, enProductiva, totalEnSeguimiento, cuota (numero), aprendicesIncompletos }
      // El frontend espera: { enEtapaLectiva, enEtapaProductiva, cuota: { actual, maximo }, aprendicesIncompletos }
      const stats = response.data || response;
      setEstadisticas({
        enEtapaLectiva: stats.enLectiva ?? stats.enEtapaLectiva ?? 0,
        enEtapaProductiva: stats.enProductiva ?? stats.enEtapaProductiva ?? 0,
        cuota: typeof stats.cuota === 'number'
          ? { actual: stats.totalEnSeguimiento || 0, maximo: stats.cuota }
          : (stats.cuota || { actual: 0, maximo: 150 }),
        aprendicesIncompletos: stats.aprendicesIncompletos ?? 0,
      });
    } catch (err) {
      console.error('Error cargando estadisticas:', err);
    }
  }, [refreshCounter]);

  const cambiarEtapa = async (id, nuevaEtapa) => {
    try {
      await seguimientoService.cambiarEtapa(id, nuevaEtapa);
      setRefreshCounter(prev => prev + 1);
      return { success: true };
    } catch (err) {
      console.error('Error cambiando etapa:', err);
      return { success: false, error: err.message };
    }
  };

  const asignarReemplazo = async (id, reemplazoId) => {
    try {
      await seguimientoService.asignarReemplazo(id, reemplazoId);
      setRefreshCounter(prev => prev + 1);
      return { success: true };
    } catch (err) {
      console.error('Error asignando reemplazo:', err);
      return { success: false, error: err.message };
    }
  };

  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const refetch = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      // Primero actualizar etapas automáticamente
      try {
        await seguimientoService.actualizarEtapasAutomaticas();
      } catch (err) {
        console.log('No se pudieron actualizar etapas automáticamente:', err.message);
      }

      // Luego cargar datos
      await cargarAprendices();
      await cargarEstadisticas();
    };

    inicializar();
  }, [cargarAprendices, cargarEstadisticas]);

  return {
    aprendices,
    estadisticas,
    loading,
    error,
    filtros,
    actualizarFiltros,
    refetch,
    refetchEstadisticas: cargarEstadisticas,
    cambiarEtapa,
    asignarReemplazo,
  };
};
