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
import { successAlert, errorAlert } from '../../../shared/components/ui/SweetAlert';

const programaOptions = [
  { value: 'TECNICO EN PROGRAMACION DE SOFTWARE', label: 'Técnico en Programación de Software' },
  { value: 'TECNOLOGO EN ANALISIS Y DESARROLLO DE SOFTWARE', label: 'Tecnólogo en Análisis y Desarrollo de Software' },
  { value: 'TNLOG. IMPLEMENTACION DE INFRAESTRUCTURA DE TIC', label: 'Tnlog. Implementación de Infraestructura de TIC' },
  { value: 'TNLOG. DESARROLLO DE SOFTWARE', label: 'Tnlog. Desarrollo de Software' },
  { value: 'ADMINISTRACION DE EMPRESAS', label: 'Administración de Empresas' },
  { value: 'Otro', label: 'Otro' },
];

export function CreateConvocatoriaModal({ open, onOpenChange, onSubmit, loading }) {
  const [programa, setPrograma] = useState('');
  const [programaOtro, setProgramaOtro] = useState('');
  const [nivelFormacion, setNivelFormacion] = useState('');
  const [aprendicesParsed, setAprendicesParsed] = useState([]);
  const [fileName, setFileName] = useState('');
  const { parseExcel, parsing, error: parseError } = useExcelParser();

  const [errors, setErrors] = useState({
    programa: '',
    programaOtro: '',
    nivelFormacion: '',
    archivo: ''
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setFileName(file.name);
        const aprendices = await parseExcel(file);
        setAprendicesParsed(aprendices);
        // Limpiar error de archivo
        if (errors.archivo) {
          setErrors(prev => ({ ...prev, archivo: '' }));
        }
      } catch (err) {
        setAprendicesParsed([]);
        setFileName('');
        console.error(err);
      }
    }
  };

  const handleProgramaChange = (value) => {
    setPrograma(value);
    // Limpiar error cuando selecciona
    if (errors.programa) {
      setErrors(prev => ({ ...prev, programa: '' }));
    }
    // Si cambia de "Otro" a otra opción, limpiar programaOtro y su error
    if (value !== 'Otro') {
      setProgramaOtro('');
      setErrors(prev => ({ ...prev, programaOtro: '' }));
    }
  };

  const handleProgramaOtroChange = (e) => {
    setProgramaOtro(e.target.value);
    if (errors.programaOtro) {
      setErrors(prev => ({ ...prev, programaOtro: '' }));
    }
  };

  const handleNivelFormacionChange = (value) => {
    setNivelFormacion(value);
    if (errors.nivelFormacion) {
      setErrors(prev => ({ ...prev, nivelFormacion: '' }));
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

  const validateForm = () => {
    const newErrors = {
      programa: '',
      programaOtro: '',
      nivelFormacion: '',
      archivo: ''
    };

    let isValid = true;

    if (!programa) {
      newErrors.programa = 'Debe seleccionar un programa';
      isValid = false;
    }

    if (programa === 'Otro' && !programaOtro.trim()) {
      newErrors.programaOtro = 'Debe ingresar el nombre del programa';
      isValid = false;
    }

    if (!nivelFormacion) {
      newErrors.nivelFormacion = 'Debe seleccionar un nivel de formación';
      isValid = false;
    }

    if (aprendicesParsed.length === 0) {
      newErrors.archivo = 'Debe adjuntar un archivo Excel con aprendices';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

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
      
      // Mostrar alerta de éxito
      setTimeout(() => {
        successAlert({
          title: 'Convocatoria creada',
          text: 'La convocatoria se ha creado exitosamente'
        });
      }, 100);
    } catch (err) {
      console.error(err);
      errorAlert({
        title: 'Error',
        text: 'Error al crear la convocatoria'
      });
    }
  };

  const handleCancel = () => {
    setPrograma('');
    setProgramaOtro('');
    setNivelFormacion('');
    setAprendicesParsed([]);
    setFileName('');
    setErrors({
      programa: '',
      programaOtro: '',
      nivelFormacion: '',
      archivo: ''
    });
    onOpenChange(false);
  };

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
            <Label htmlFor="programa">Programa <span className="text-red-500">*</span></Label>
            <Select value={programa} onValueChange={handleProgramaChange}>
              <SelectTrigger id="programa" className={errors.programa ? 'border-red-500' : ''}>
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
            {errors.programa && (
              <p className="text-sm text-red-500 mt-1">{errors.programa}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nivel-formacion">Nivel de Formación <span className="text-red-500">*</span></Label>
            <Select value={nivelFormacion} onValueChange={handleNivelFormacionChange}>
              <SelectTrigger id="nivel-formacion" className={errors.nivelFormacion ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnica">Tecnica</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="profesional">Profesional</SelectItem>
              </SelectContent>
            </Select>
            {errors.nivelFormacion && (
              <p className="text-sm text-red-500 mt-1">{errors.nivelFormacion}</p>
            )}
          </div>
        </div>

        {programa === 'Otro' && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="programa-otro">Nombre del Programa <span className="text-red-500">*</span></Label>
            <Input
              id="programa-otro"
              placeholder="Ingrese el nombre del programa"
              value={programaOtro}
              onChange={handleProgramaOtroChange}
              className={errors.programaOtro ? 'border-red-500' : ''}
            />
            {errors.programaOtro && (
              <p className="text-sm text-red-500 mt-1">{errors.programaOtro}</p>
            )}
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
                {parsing ? 'Procesando archivo...' : 'No se ha adjuntado ningún archivo aún'}
              </p>
            </>
          )}
          {errors.archivo && (
            <p className="text-sm text-red-500">{errors.archivo}</p>
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
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}