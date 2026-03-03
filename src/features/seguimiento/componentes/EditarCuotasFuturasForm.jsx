'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Calendar, Edit2, Save, X, Trash2 } from 'lucide-react';
import Spinner from '@/shared/components/ui/Spinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const EditarCuotasFuturasForm = ({ onSuccess }) => {
  const [cuotasFuturas, setCuotasFuturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaCuota, setNuevaCuota] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCuotasFuturas();
  }, []);

  const cargarCuotasFuturas = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = JSON.parse(localStorage.getItem('auth'))?.token;

      const response = await fetch(`${API_URL}/api/cuota-aprendices/futuras`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar cuotas futuras');
      }

      const data = await response.json();
      setCuotasFuturas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    // Usar UTC para evitar desfase de timezone (mostrar el día exacto guardado)
    return date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'UTC' 
    });
  };

  const iniciarEdicion = (cuota) => {
    setEditandoId(cuota._id);
    setNuevaCuota(cuota.cuota);
    setError(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevaCuota('');
    setError(null);
  };

  const guardarCambios = async (id) => {
    try {
      setGuardando(true);
      setError(null);

      if (!nuevaCuota || nuevaCuota <= 0) {
        throw new Error('La cuota debe ser mayor a 0');
      }

      const token = JSON.parse(localStorage.getItem('auth'))?.token;

      const response = await fetch(`${API_URL}/api/cuota-aprendices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ cuota: Number(nuevaCuota) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar cuota');
      }

      // Recargar cuotas
      await cargarCuotasFuturas();
      cancelarEdicion();
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCuota = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cuota futura?')) {
      return;
    }

    try {
      setError(null);
      const token = JSON.parse(localStorage.getItem('auth'))?.token;

      const response = await fetch(`${API_URL}/api/cuota-aprendices/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar cuota');
      }

      await cargarCuotasFuturas();
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (cuotasFuturas.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-sm">
          No hay cuotas futuras creadas
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Usa la pestaña "Crear Nueva Cuota" para agregar una
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
        {cuotasFuturas.map((cuota) => (
          <Card key={cuota._id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="font-medium text-sm text-gray-700">
                      {formatearFecha(cuota.fechaInicial)} - {formatearFecha(cuota.fechaFinal)}
                    </span>
                  </div>

                  {editandoId === cuota._id ? (
                    <div className="flex items-end gap-2 mt-3">
                      <div className="flex-1">
                        <Label htmlFor={`cuota-${cuota._id}`} className="text-xs">
                          Nueva cuota
                        </Label>
                        <Input
                          id={`cuota-${cuota._id}`}
                          type="number"
                          min="1"
                          value={nuevaCuota}
                          onChange={(e) => setNuevaCuota(e.target.value)}
                          className="mt-1"
                          autoFocus
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => guardarCambios(cuota._id)}
                        disabled={guardando}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save size={14} className="mr-1" />
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelarEdicion}
                        disabled={guardando}
                      >
                        <X size={14} className="mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Cuota requerida:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {cuota.cuota}
                      </span>
                      <span className="text-xs text-gray-500">aprendices</span>
                    </div>
                  )}
                </div>

                {editandoId !== cuota._id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => iniciarEdicion(cuota)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => eliminarCuota(cuota._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Nota:</strong> Las fechas del período no se pueden modificar. 
          Solo puedes editar el número de cuota requerida para cada período.
        </p>
      </div>
    </div>
  );
};

export default EditarCuotasFuturasForm;
