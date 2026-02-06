'use client';

import { useEffect } from 'react';
import { confirmAlert, successAlert, errorAlert } from '../../../shared/components/ui/SweetAlert';

export function CloseConvocatoriaDialog({ open, onOpenChange, onConfirm, loading }) {
  
  useEffect(() => {
    if (open) {
      handleConfirmDialog();
    }
  }, [open]);

  const handleConfirmDialog = async () => {
    const result = await confirmAlert({
      title: 'Cerrar Convocatoria',
      text: '¿Está seguro de que desea cerrar esta convocatoria? Los aprendices seleccionados pasarán a la etapa de selección2 y no podrá editarlos a menos que reabra la convocatoria.',
      confirmText: 'Sí, cerrar',
      cancelText: 'Cancelar',
      icon: 'warning'
    });

    // Cerrar el "modal"
    onOpenChange(false);

    if (!result.isConfirmed) return;

    try {
      await onConfirm();
      successAlert({
        title: 'Convocatoria cerrada',
        text: 'La convocatoria se ha cerrado exitosamente'
      });
    } catch (error) {
      errorAlert({
        title: 'Error',
        text: 'Error al cerrar la convocatoria'
      });
    }
  };

  // No renderizar nada, solo SweetAlert
  return null;
}