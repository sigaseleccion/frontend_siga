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

export function ExcelUploadModal({ open, onOpenChange, onSubmit, loading }) {
  const [aprendicesParsed, setAprendicesParsed] = useState([]);
  const [fileName, setFileName] = useState('');
  const { parseExcel, parsing, error: parseError } = useExcelParser();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setFileName(file.name);
        const aprendices = await parseExcel(file);
        setAprendicesParsed(aprendices);
      } catch (err) {
        setAprendicesParsed([]);
        setFileName('');
        console.error(err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(aprendicesParsed);
      handleCancel();
    } catch (err) {
        console.error(err);
    }
  };

  const handleCancel = () => {
    setAprendicesParsed([]);
    setFileName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Cargar Excel Adicional</DialogTitle>
          <DialogDescription className="text-gray-500">
            Adjunte un archivo Excel con aprendices adicionales para agregar a esta convocatoria.
            Los aprendices duplicados (mismo numero de documento) seran ignorados.
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
            disabled={aprendicesParsed.length === 0 || loading}
          >
            {loading ? 'Cargando...' : 'Cargar aprendices'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
