'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const CrearCuotaForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fechaInicial: '',
    fechaFinal: '',
    cuota: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cuota' ? Number(value) : value
    }));
  };

  const validarFechas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(formData.fechaInicial);
    const fechaFin = new Date(formData.fechaFinal);

    // Validar que las fechas sean futuras
    if (fechaInicio <= hoy) {
      return 'La fecha inicial debe ser futura. No se pueden crear cuotas para períodos actuales o pasados.';
    }

    // Validar que fechaFinal > fechaInicial
    if (fechaFin <= fechaInicio) {
      return 'La fecha final debe ser posterior a la fecha inicial.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar fechas en el frontend
      const errorValidacion = validarFechas();
      if (errorValidacion) {
        throw new Error(errorValidacion);
      }

      const token = JSON.parse(localStorage.getItem('auth'))?.token;

      const response = await fetch(`${API_URL}/api/cuota-aprendices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear cuota');
      }

      // Reset form
      setFormData({
        fechaInicial: '',
        fechaFinal: '',
        cuota: '',
      });
      
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fechaInicial">Fecha Inicial</Label>
          <Input
            id="fechaInicial"
            name="fechaInicial"
            type="date"
            required
            value={formData.fechaInicial}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="fechaFinal">Fecha Final</Label>
          <Input
            id="fechaFinal"
            name="fechaFinal"
            type="date"
            required
            value={formData.fechaFinal}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cuota">Cuota Requerida</Label>
        <Input
          id="cuota"
          name="cuota"
          type="number"
          min="1"
          required
          value={formData.cuota}
          onChange={handleChange}
          className="mt-1"
          placeholder="Ej: 50"
        />
      </div>

      {/* Información sobre períodos futuros */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <div className="flex items-start gap-2">
          <span className="text-sm text-blue-900 font-medium">
            ℹ️ Información importante:
          </span>
        </div>
        <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Solo se pueden crear cuotas para períodos futuros</li>
          <li>No se puede crear una cuota con fechas que ya existen</li>
          <li>La cantidad de aprendices se calculará automáticamente cuando llegue el período</li>
        </ul>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Creando...' : 'Crear Cuota'}
        </Button>
      </div>
    </form>
  );
};

export default CrearCuotaForm;
