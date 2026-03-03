'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const EditCuotaModal = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    fechaInicial: '',
    fechaFinal: '',
    cuota: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Siempre resetear el formulario al abrir
    if (open) {
      setFormData({
        fechaInicial: '',
        fechaFinal: '',
        cuota: '',
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cuota' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ Validar que las fechas sean futuras (no del período actual)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaInicio = new Date(formData.fechaInicial);
      
      if (fechaInicio <= hoy) {
        throw new Error('La fecha inicial debe ser futura. Solo se pueden crear cuotas para períodos futuros.');
      }

      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      
      // 🔄 Siempre crear nueva cuota (POST) - nunca editar
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
        throw new Error(data.message || 'Error al guardar cuota');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Crear Cuota para Período Futuro
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="space-y-4">
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
                />
              </div>

              {/* Mostrar información de cantidad si estamos editando */}
              {/* Información sobre períodos futuros y cálculo automático */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-blue-900 font-medium">
                    ℹ️ Información importante:
                  </span>
                </div>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Solo se pueden crear cuotas para períodos futuros</li>
                  <li>Las cuotas del período actual no se pueden modificar</li>
                  <li>La cantidad de aprendices se calculará automáticamente cuando llegue el período</li>
                </ul>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCuotaModal;
