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

const EditCuotaModal = ({ open, onOpenChange, cuotaActual, onSuccess }) => {
  const [cuotaMaxima, setCuotaMaxima] = useState(cuotaActual?.maximo || 150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cuotaActual?.maximo) {
      setCuotaMaxima(cuotaActual.maximo);
    }
  }, [cuotaActual]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cuota-aprendices`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ cuotaMaxima: Number(cuotaMaxima) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar cuota');
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Cuota de Aprendices</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cuotaMaxima">Cuota Maxima</Label>
                <Input
                  id="cuotaMaxima"
                  type="number"
                  min="1"
                  value={cuotaMaxima}
                  onChange={(e) => setCuotaMaxima(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-gray-500">
                Aprendices actuales: <span className="font-medium">{cuotaActual?.actual || 0}</span>
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
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
