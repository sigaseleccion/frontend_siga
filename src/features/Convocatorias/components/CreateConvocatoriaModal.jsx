'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Upload, FileUp, X, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { useExcelParser } from '../hooks/useExcelParser';

const programaOptions = [
  { value: 'TECNICO EN PROGRAMACION DE SOFTWARE', label: 'Tecnico en Programacion de Software' },
  { value: 'TECNOLOGO EN ANALISIS Y DESARROLLO DE SOFTWARE', label: 'Tecnologo en Analisis y Desarrollo de Software' },
  { value: 'TNLOG. IMPLEMENTACION DE INFRAESTRUCTURA DE TIC', label: 'Tnlog. Implementacion de Infraestructura de TIC' },
  { value: 'TNLOG. DESARROLLO DE SOFTWARE', label: 'Tnlog. Desarrollo de Software' },
  { value: 'ADMINISTRACION DE EMPRESAS', label: 'Administracion de Empresas' },
  { value: 'Otro', label: 'Otro' },
];

export function CreateConvocatoriaModal({ open, onOpenChange, onSubmit, loading }) {
  const [programa, setPrograma] = useState('');
  const [programaOtro, setProgramaOtro] = useState('');
  const [nivelFormacion, setNivelFormacion] = useState('');
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
      }
    }
  };

  const generateNombreConvocatoria = (programaName) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${programaName} - ${dateStr}`;
  };

  const handleSubmit = async () => {
    const programaFinal = programa === 'Otro' ? programaOtro : programa;
    const nombreConvocatoria = generateNombreConvocatoria(programaFinal);

    const convocatoriaData = {
      nombreConvocatoria,
      programa: programaFinal,
      nivelFormacion,
    };

    try {
      await onSubmit(convocatoriaData, aprendicesParsed);
      handleCancel();
    } catch (err) {
      // Error manejado en el hook padre
    }
  };

  const handleCancel = () => {
    setPrograma('');
    setProgramaOtro('');
    setNivelFormacion('');
    setAprendicesParsed([]);
    setFileName('');
    onOpenChange(false);
  };

  const canCreate =
    programa &&
    nivelFormacion &&
    (programa !== 'Otro' || programaOtro.trim()) &&
    aprendicesParsed.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
        <DialogHeader>
          <DialogTitle>Crear Nueva Convocatoria</DialogTitle>
          <DialogDescription>
            Complete los datos y adjunte el excel con el listado de aprendices
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="programa">Programa</Label>
            <Select value={programa} onValueChange={(v) => setPrograma(v)}>
              <SelectTrigger id="programa">
                <SelectValue placeholder="Seleccionar programa" />
              </SelectTrigger>
              <SelectContent>
                {programaOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nivel-formacion">Nivel de Formacion</Label>
            <Select value={nivelFormacion} onValueChange={(v) => setNivelFormacion(v)}>
              <SelectTrigger id="nivel-formacion">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnica">Tecnica</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="profesional">Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {programa === 'Otro' && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="programa-otro">Nombre del Programa</Label>
            <Input
              id="programa-otro"
              placeholder="Ingrese el nombre del programa"
              value={programaOtro}
              onChange={(e) => setProgramaOtro(e.target.value)}
            />
          </div>
        )}

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
                {parsing ? 'Procesando archivo...' : 'No se ha adjuntado ningun archivo aun'}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <input
            type="file"
            id="excel-upload"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={parsing}
          />
          <label htmlFor="excel-upload">
            <Button
              type="button"
              variant="outline"
              asChild
              className="bg-transparent"
              disabled={parsing}
            >
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {aprendicesParsed.length > 0 ? 'Cambiar archivo' : 'Adjuntar excel'}
              </span>
            </Button>
          </label>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canCreate || loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
