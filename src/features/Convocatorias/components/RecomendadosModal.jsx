'use client';

import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function RecomendadosModal({ open, onOpenChange, aprendices }) {
  if (!aprendices) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Aprendices Recomendados para Reemplazo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {aprendices.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay aprendices recomendados
            </p>
          ) : (
            aprendices.map((aprendiz, index) => (
              <div key={aprendiz._id || aprendiz.id || index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    {index + 1}
                  </Badge>
                  <span className="font-medium text-gray-900">{aprendiz.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Tipo Documento</p>
                    <p className="font-medium text-gray-900">{aprendiz.tipoDocumento}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Documento</p>
                    <p className="font-medium text-gray-900">{aprendiz.documento}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Etapa Actual</p>
                    <p className="font-medium text-gray-900">{aprendiz.etapaActual || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha Inicio Productiva</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(aprendiz.fechaInicioProductiva)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-gray-200"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
