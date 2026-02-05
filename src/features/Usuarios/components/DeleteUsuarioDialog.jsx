'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { eliminarUsuario } from '../services/usuarioService.js';

export const DeleteUsuarioDialog = ({ open, onOpenChange, usuario, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await eliminarUsuario(usuario._id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      alert('Error al eliminar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-red-600">
            Eliminar Usuario Permanentemente
          </DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea eliminar permanentemente a {usuario?.nombre}?
            <br />
            <span className="text-red-600 font-semibold">Esta acción NO se puede deshacer.</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
