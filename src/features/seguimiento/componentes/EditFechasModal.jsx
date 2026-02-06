'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { seguimientoService } from '../services/seguimientoService';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate() + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EditFechasModal = ({ open, onOpenChange, aprendiz, onSuccess }) => {
  const [fechaInicioProductiva, setFechaInicioProductiva] = useState('');
  const [fechaFinContrato, setFechaFinContrato] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (aprendiz && open) {
      setFechaInicioProductiva(formatDateForInput(aprendiz.fechaInicioProductiva));
      setFechaFinContrato(formatDateForInput(aprendiz.fechaFinContrato));
      setError(null);
    }
  }, [aprendiz, open]);

  const handleGuardar = async () => {
    try {
      setSaving(true);
      setError(null);
      await seguimientoService.actualizarFechas(aprendiz._id, {
        fechaInicioProductiva: fechaInicioProductiva || null,
        fechaFinContrato: fechaFinContrato || null,
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!aprendiz) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Editar Fechas del Aprendiz
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Editando: {aprendiz.nombre}
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="fechaInicioProductiva" className="text-sm font-medium text-gray-700">
              Inicio Productiva
            </Label>
            <Input
              id="fechaInicioProductiva"
              type="date"
              value={fechaInicioProductiva}
              onChange={(e) => setFechaInicioProductiva(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFinContrato" className="text-sm font-medium text-gray-700">
              Fin Contrato
            </Label>
            <Input
              id="fechaFinContrato"
              type="date"
              value={fechaFinContrato}
              onChange={(e) => setFechaFinContrato(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFechasModal;
