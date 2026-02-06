'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useExcelParser } from '../hooks/useExcelParser';
import { successAlert, errorAlert } from '../../../shared/components/ui/SweetAlert';

export function ExcelUploadModal({ open, onOpenChange, onSubmit, loading }) {
  const [aprendicesParsed, setAprendicesParsed] = useState([]);
  const [fileName, setFileName] = useState('');
  const { parseExcel, parsing, error: parseError } = useExcelParser();
  const [errors, setErrors] = useState({ archivo: '' });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setFileName(file.name);
        const aprendices = await parseExcel(file);
        setAprendicesParsed(aprendices);
        // Limpiar error
        if (errors.archivo) {
          setErrors({ archivo: '' });
        }
      } catch (err) {
        setAprendicesParsed([]);
        setFileName('');
        console.error(err);
      }
    }
  };

  const validateForm = () => {
    if (aprendicesParsed.length === 0) {
      setErrors({ archivo: 'Debe seleccionar un archivo Excel con aprendices' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(aprendicesParsed);
      handleCancel();
      
      // Mostrar alerta de éxito
      setTimeout(() => {
        successAlert({
          title: 'Aprendices cargados',
          text: 'Los aprendices se han agregado exitosamente'
        });
      }, 100);
    } catch (err) {
      console.error(err);
      errorAlert({
        title: 'Error',
        text: 'Error al cargar los aprendices'
      });
    }
  };

  const handleCancel = () => {
    setAprendicesParsed([]);
    setFileName('');
    setErrors({ archivo: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Cargar Excel Adicional</DialogTitle>
          <DialogDescription className="text-gray-500">
            Adjunte un archivo Excel con aprendices adicionales para agregar a esta convocatoria.
            Los aprendices duplicados (mismo numero de documento) serán ignorados.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {aprendicesParsed.length > 0 ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-6 mx-auto w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-green-600 font-medium mt-4">{fileName}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {aprendicesParsed.length} aprendices encontrados
              </p>
            </div>
          ) : parseError ? (
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-6 mx-auto w-fit">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mt-4">{parseError}</p>
            </div>
          ) : (
            <>
              <div className="rounded-full bg-blue-100 p-6">
                <FileUp className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-muted-foreground text-center text-sm">
                {parsing ? 'Procesando archivo...' : 'Seleccione un archivo Excel'}
              </p>
            </>
          )}
          {errors.archivo && (
            <p className="text-sm text-red-500">{errors.archivo}</p>
          )}
          <input
            type="file"
            id="excel-upload-additional"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={parsing}
          />
          <label htmlFor="excel-upload-additional">
            <Button
              type="button"
              variant="outline"
              asChild
              className="bg-transparent border-gray-200"
              disabled={parsing}
            >
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {aprendicesParsed.length > 0 ? 'Cambiar archivo' : 'Seleccionar archivo Excel'}
              </span>
            </Button>
          </label>
        </div>
        <DialogFooter className="justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel} className="text-gray-600" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cargar aprendices'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}