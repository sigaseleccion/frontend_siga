'use client';

import React, { useEffect } from 'react';
import { confirmAlert, successAlert, errorAlert } from '../../../shared/components/ui/SweetAlert';
import { eliminarUsuario } from '../services/usuarioService.js';

export const DeleteUsuarioDialog = ({ open, onOpenChange, usuario, onSuccess }) => {
  
  // Ejecutar la confirmación cuando se abre
  useEffect(() => {
    if (open && usuario) {
      handleDelete();
    }
  }, [open, usuario]);

  const handleDelete = async () => {
    // Mostrar confirmación con SweetAlert
    const result = await confirmAlert({
      title: '¿Está seguro?',
      text: `¿Desea eliminar permanentemente a ${usuario?.nombre}? Esta acción NO se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      icon: 'warning'
    });

    // Cerrar el "modal" (que ya no existe visualmente)
    onOpenChange(false);

    if (!result.isConfirmed) return;

    try {
      await eliminarUsuario(usuario._id);
      onSuccess();
      
      // Mostrar alerta de éxito
      successAlert({
        title: 'Eliminado',
        text: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      errorAlert({
        title: 'Error',
        text: 'Error al eliminar usuario: ' + error.message
      });
    }
  };

  // No renderizar nada, solo SweetAlert
  return null;
};