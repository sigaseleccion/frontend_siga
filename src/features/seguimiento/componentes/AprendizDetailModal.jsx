'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { BookOpen, Briefcase, User, GraduationCap, Calendar, FileText } from 'lucide-react';

const AprendizDetailModal = ({ open, onOpenChange, aprendiz }) => {
  if (!aprendiz) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin registrar';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const getEtapaBadge = (etapa) => {
    switch (etapa) {
      case 'lectiva':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full px-3 py-1 text-xs font-medium flex items-center w-fit">
            <BookOpen size={12} className="mr-1" />
            Lectiva
          </Badge>
        );
      case 'productiva':
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full px-3 py-1 text-xs font-medium flex items-center w-fit">
            <Briefcase size={12} className="mr-1" />
            Productiva
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 rounded-full px-3 py-1 text-xs font-medium w-fit">
            Finalizado
          </Badge>
        );
    }
  };

  const InfoField = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'Sin registrar'}</p>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
        <Icon size={14} className="text-gray-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Detalle del Aprendiz
            </DialogTitle>
            {getEtapaBadge(aprendiz.etapaActual)}
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Informacion Personal */}
          <section>
            <SectionHeader icon={User} title="Informacion Personal" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoField label="Nombre" value={aprendiz.nombre} />
              <InfoField label="Tipo Documento" value={aprendiz.tipoDocumento} />
              <InfoField label="Documento" value={aprendiz.documento} />
              <InfoField label="Ciudad" value={aprendiz.ciudad} />
              <InfoField label="Direccion" value={aprendiz.direccion} />
              <InfoField label="Telefono" value={aprendiz.telefono} />
              <InfoField label="Correo" value={aprendiz.correo} />
            </div>
          </section>

          {/* Informacion del Programa */}
          <section>
            <SectionHeader icon={GraduationCap} title="Informacion del Programa" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoField
                label="Programa de Formacion"
                value={aprendiz.programaFormacion || aprendiz.programa}
              />
            </div>
          </section>

          {/* Etapa Lectiva */}
          <section>
            <SectionHeader icon={BookOpen} title="Etapa Lectiva" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoField label="Fecha Inicio Lectiva" value={formatDate(aprendiz.fechaInicioLectiva)} />
              <InfoField label="Fecha Fin Lectiva" value={formatDate(aprendiz.fechaFinLectiva)} />
            </div>
          </section>

          {/* Etapa Productiva */}
          <section>
            <SectionHeader icon={Briefcase} title="Etapa Productiva" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoField label="Fecha Inicio Productiva" value={formatDate(aprendiz.fechaInicioProductiva)} />
              <InfoField label="Fecha Fin Productiva" value={formatDate(aprendiz.fechaFinProductiva)} />
            </div>
          </section>

          {/* Contrato */}
          <section>
            <SectionHeader icon={FileText} title="Contrato" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoField label="Fecha Inicio Contrato" value={formatDate(aprendiz.fechaInicioContrato)} />
              <InfoField label="Fecha Fin Contrato" value={formatDate(aprendiz.fechaFinContrato)} />
            </div>
          </section>

          {/* Reemplazo */}
          {aprendiz.reemplazoId && (
            <section>
              <SectionHeader icon={Calendar} title="Reemplazo Asignado" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <InfoField
                  label="Nombre del Reemplazo"
                  value={
                    typeof aprendiz.reemplazoId === 'object'
                      ? aprendiz.reemplazoId.nombre
                      : aprendiz.reemplazoId
                  }
                />
                {typeof aprendiz.reemplazoId === 'object' && aprendiz.reemplazoId.documento && (
                  <InfoField label="Documento del Reemplazo" value={aprendiz.reemplazoId.documento} />
                )}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AprendizDetailModal;
