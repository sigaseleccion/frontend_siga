'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { seguimientoService } from '../services/seguimientoService';

const AprendicesIncompletosModal = ({ open, onOpenChange }) => {
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      cargarIncompletos();
    }
  }, [open]);

  const cargarIncompletos = async () => {
    setLoading(true);
    try {
      const response = await seguimientoService.obtenerIncompletos();
      setAprendices(response.data || []);
    } catch (err) {
      console.error('Error cargando aprendices incompletos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Aprendices con Datos Incompletos
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : aprendices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay aprendices con datos incompletos
            </div>
          ) : (
            <div className="space-y-4">
              {aprendices.map((aprendiz) => (
                <div
                  key={aprendiz._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {aprendiz.nombre} {aprendiz.apellido}
                      </h4>
                      <p className="text-sm text-gray-500">{aprendiz.programa}</p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Incompleto
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Campos faltantes:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {aprendiz.camposFaltantes?.map((campo) => (
                        <Badge
                          key={campo}
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          {campo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AprendicesIncompletosModal;
