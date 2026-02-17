'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { seguimientoService } from '../services/seguimientoService';
import { useToast } from '@/shared/hooks/useToast';
import { Loader2, AlertCircle } from 'lucide-react';

export const EditAprendizModal = ({ open, onOpenChange, aprendiz, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fechaInicioProductiva: '',
        fechaFinContrato: '',
    });

    const [errors, setErrors] = useState({
        fechaInicioProductiva: '',
        fechaFinContrato: '',
    });

    useEffect(() => {
        if (aprendiz) {
            setFormData({
                fechaInicioProductiva: aprendiz.fechaInicioProductiva
                    ? aprendiz.fechaInicioProductiva.split('T')[0]
                    : '',
                fechaFinContrato: aprendiz.fechaFinContrato
                    ? aprendiz.fechaFinContrato.split('T')[0]
                    : '',
            });
            // Limpiar errores al cambiar de aprendiz
            setErrors({ fechaInicioProductiva: '', fechaFinContrato: '' });
        }
    }, [aprendiz]);

    // Función de validación
    const validateFechas = useCallback(() => {
        if (!aprendiz) return true;

        const newErrors = { fechaInicioProductiva: '', fechaFinContrato: '' };
        let isValid = true;

        // Validar fechaInicioProductiva
        if (formData.fechaInicioProductiva) {
            const inicioProductiva = new Date(formData.fechaInicioProductiva);

            // Debe ser >= fechaInicioContrato
            if (aprendiz.fechaInicioContrato) {
                const inicioContrato = new Date(aprendiz.fechaInicioContrato);
                if (inicioProductiva < inicioContrato) {
                    newErrors.fechaInicioProductiva = 'Debe ser igual o posterior al inicio del contrato';
                    isValid = false;
                }
            }

            // Debe ser < fechaFinContrato
            if (formData.fechaFinContrato) {
                const finContrato = new Date(formData.fechaFinContrato);
                if (inicioProductiva >= finContrato) {
                    newErrors.fechaInicioProductiva = 'Debe ser anterior a la fecha de fin del contrato';
                    isValid = false;
                }
            }

            // No puede ser más de 2 años en el futuro
            const dosAniosFuturo = new Date();
            dosAniosFuturo.setFullYear(dosAniosFuturo.getFullYear() + 2);
            if (inicioProductiva > dosAniosFuturo) {
                newErrors.fechaInicioProductiva = 'No puede ser más de 2 años en el futuro';
                isValid = false;
            }
        }

        // Validar fechaFinContrato
        if (formData.fechaFinContrato) {
            const finContrato = new Date(formData.fechaFinContrato);

            // Debe ser > fechaInicioProductiva
            if (formData.fechaInicioProductiva) {
                const inicioProductiva = new Date(formData.fechaInicioProductiva);
                if (finContrato <= inicioProductiva) {
                    newErrors.fechaFinContrato = 'Debe ser posterior a la fecha de inicio productiva';
                    isValid = false;
                }
            }

            // Duración máxima (1 año desde inicio productiva)
            if (formData.fechaInicioProductiva) {
                const inicioProductiva = new Date(formData.fechaInicioProductiva);
                const diffMeses = (finContrato - inicioProductiva) / (1000 * 60 * 60 * 24 * 30);
                if (diffMeses > 12) {
                    newErrors.fechaFinContrato = 'La etapa productiva no puede durar más de 1 año';
                    isValid = false;
                }
            }

            // Si está en productiva, fin debe ser hoy o futuro (no puede ser pasado)
            if (aprendiz.etapaActual === 'productiva') {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                // Crear fecha desde el string del input en hora local
                const [year, month, day] = formData.fechaFinContrato.split('-');
                const finContratoLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

                if (finContratoLocal < hoy) {
                    newErrors.fechaFinContrato = 'No puede estar en el pasado para aprendices activos';
                    isValid = false;
                }
            }
        }

        setErrors(newErrors);
        return isValid;
    }, [formData, aprendiz]);

    // Validar en tiempo real
    useEffect(() => {
        if (open && (formData.fechaInicioProductiva || formData.fechaFinContrato)) {
            validateFechas();
        }
    }, [formData.fechaInicioProductiva, formData.fechaFinContrato, open, validateFechas]);



    const handleSubmit = async () => {
        // Validar antes de enviar
        if (!validateFechas()) {
            toast({
                title: 'Error de validación',
                description: 'Por favor corrige los errores antes de guardar',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            // Actualizar fechas
            const response = await seguimientoService.actualizarFechas(aprendiz._id, {
                fechaInicioProductiva: formData.fechaInicioProductiva || null,
                fechaFinContrato: formData.fechaFinContrato || null,
            });

            // Mostrar toast según si hubo cambio de etapa
            if (response.etapaCambiada) {
                toast({
                    title: 'Aprendiz actualizado',
                    description: `Cambio de etapa: ${response.etapaAnterior} → ${response.etapaNueva}`,
                    className: 'bg-blue-600 text-white',
                });
            } else {
                toast({
                    title: 'Aprendiz actualizado',
                    description: 'Los datos se han guardado correctamente',
                    className: 'bg-green-600 text-white',
                });
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!aprendiz) return null;

    // Calcular restricciones min/max dinámicas
    const minFechaInicioProductiva = aprendiz.fechaInicioContrato
        ? aprendiz.fechaInicioContrato.split('T')[0]
        : undefined;

    const maxFechaInicioProductiva = formData.fechaFinContrato
        ? new Date(new Date(formData.fechaFinContrato).getTime() - 86400000).toISOString().split('T')[0]
        : undefined;

    const minFechaFinContrato = formData.fechaInicioProductiva
        ? new Date(new Date(formData.fechaInicioProductiva).getTime() + 86400000).toISOString().split('T')[0]
        : aprendiz.fechaInicioContrato
            ? new Date(new Date(aprendiz.fechaInicioContrato).getTime() + 86400000).toISOString().split('T')[0]
            : undefined;

    const maxFechaFinContrato = formData.fechaInicioProductiva
        ? new Date(new Date(formData.fechaInicioProductiva).getTime() + (365 * 86400000)).toISOString().split('T')[0]
        : undefined;

    const hasErrors = !!errors.fechaInicioProductiva || !!errors.fechaFinContrato;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Fechas del Aprendiz</DialogTitle>
                    <DialogDescription>
                        Editando: {aprendiz.nombre} {aprendiz.apellido || ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Inicio Productiva */}
                    <div className="space-y-2">
                        <Label htmlFor="fechaInicioProductiva">Inicio Productiva</Label>
                        <Input
                            id="fechaInicioProductiva"
                            type="date"
                            value={formData.fechaInicioProductiva}
                            onChange={(e) => setFormData({ ...formData, fechaInicioProductiva: e.target.value })}
                            min={minFechaInicioProductiva}
                            max={maxFechaInicioProductiva}
                            className={errors.fechaInicioProductiva ? 'border-red-500 focus:ring-red-500' : ''}
                        />
                        {errors.fechaInicioProductiva && (
                            <div className="flex items-start gap-1.5 text-xs text-red-600">
                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                <span>{errors.fechaInicioProductiva}</span>
                            </div>
                        )}
                        {aprendiz.fechaInicioContrato && !errors.fechaInicioProductiva && (
                            <p className="text-xs text-gray-500">
                                Inicio de contrato: {new Date(aprendiz.fechaInicioContrato).toLocaleDateString('es-ES')}
                            </p>
                        )}
                    </div>

                    {/* Fin Contrato */}
                    <div className="space-y-2">
                        <Label htmlFor="fechaFinContrato">Fin Contrato</Label>
                        <Input
                            id="fechaFinContrato"
                            type="date"
                            value={formData.fechaFinContrato}
                            onChange={(e) => setFormData({ ...formData, fechaFinContrato: e.target.value })}
                            min={minFechaFinContrato}
                            max={maxFechaFinContrato}
                            className={errors.fechaFinContrato ? 'border-red-500 focus:ring-red-500' : ''}
                        />
                        {errors.fechaFinContrato && (
                            <div className="flex items-start gap-1.5 text-xs text-red-600">
                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                <span>{errors.fechaFinContrato}</span>
                            </div>
                        )}
                        {formData.fechaInicioProductiva && formData.fechaFinContrato && !errors.fechaFinContrato && (
                            <p className="text-xs text-gray-500">
                                Duración etapa productiva: {Math.round((new Date(formData.fechaFinContrato) - new Date(formData.fechaInicioProductiva)) / (1000 * 60 * 60 * 24 * 30))} meses
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || hasErrors}
                        className={hasErrors ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
