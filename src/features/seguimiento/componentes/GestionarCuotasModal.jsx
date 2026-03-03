'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { PlusCircle, Edit3 } from 'lucide-react';
import CrearCuotaForm from './CrearCuotaForm';
import EditarCuotasFuturasForm from './EditarCuotasFuturasForm';

const GestionarCuotasModal = ({ open, onOpenChange, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('crear');

  const handleClose = () => {
    setActiveTab('crear');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Gestionar Cuotas de Aprendices
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crear" className="flex items-center gap-2">
              <PlusCircle size={16} />
              Crear Nueva Cuota
            </TabsTrigger>
            <TabsTrigger value="editar" className="flex items-center gap-2">
              <Edit3 size={16} />
              Editar Cuotas Futuras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crear" className="mt-6">
            <CrearCuotaForm onSuccess={() => {
              onSuccess?.();
              handleClose();
            }} />
          </TabsContent>

          <TabsContent value="editar" className="mt-6">
            <EditarCuotasFuturasForm onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GestionarCuotasModal;
