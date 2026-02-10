'use client';

import { useState, useEffect, useCallback } from 'react';
import { seguimientoService } from '../services/seguimientoService';

export const useHistorico = (filtrosIniciales = {}) => {
    const [aprendices, setAprendices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState(filtrosIniciales);

    const cargarAprendices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await seguimientoService.obtenerHistorico(filtros);
            const data = Array.isArray(response) ? response : (response.data || []);
            setAprendices(data);
        } catch (err) {
            setError(err.message);
            console.error('Error cargando histórico:', err);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    const actualizarFiltros = (nuevosFiltros) => {
        setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    };

    const refetch = useCallback(() => {
        cargarAprendices();
    }, [cargarAprendices]);

    useEffect(() => {
        cargarAprendices();
    }, [cargarAprendices]);

    return {
        aprendices,
        loading,
        error,
        filtros,
        actualizarFiltros,
        refetch,
    };
};
