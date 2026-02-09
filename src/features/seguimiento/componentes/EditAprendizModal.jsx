'use client';

import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

export const EditAprendizModal = ({ open, onOpenChange, aprendiz, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [recomendados, setRecomendados] = useState([]);
    const [loadingRecomendados, setLoadingRecomendados] = useState(false);

    const [formData, setFormData] = useState({
        fechaInicioProductiva: '',
        fechaFinContrato: '',
        reemplazoId: '',
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
                reemplazoId: aprendiz.reemplazoId?._id || '',
            });
        }
    }, [aprendiz]);

    // Cargar recomendados cuando cambia fechaFinContrato (solo para productiva)
    useEffect(() => {
        const cargarRecomendados = async () => {
            if (aprendiz?.etapaActual === 'productiva' && formData.fechaFinContrato) {
                setLoadingRecomendados(true);
                try {
                    const data = await seguimientoService.obtenerRecomendadosReemplazo(formData.fechaFinContrato);
                    setRecomendados(data);
                } catch (err) {
                    console.error('Error cargando recomendados:', err);
                    setRecomendados([]);
                } finally {
                    setLoadingRecomendados(false);
                }
            } else {
                setRecomendados([]);
            }
        };

        cargarRecomendados();
    }, [formData.fechaFinContrato, aprendiz?.etapaActual]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Actualizar fechas
            await seguimientoService.actualizarFechas(aprendiz._id, {
                fechaInicioProductiva: formData.fechaInicioProductiva || null,
                fechaFinContrato: formData.fechaFinContrato || null,
            });

            // 2. Actualizar reemplazo (solo si está en productiva y cambió)
            if (aprendiz.etapaActual === 'productiva' && formData.reemplazoId !== (aprendiz.reemplazoId?._id || '')) {
                await seguimientoService.asignarReemplazo(aprendiz._id, formData.reemplazoId || null);
            }

            toast({
                title: 'Aprendiz actualizado',
                description: 'Los datos se han guardado correctamente',
                className: 'bg-green-600 text-white',
            });

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

    const esProductiva = aprendiz.etapaActual === 'productiva';

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
                        />
                    </div>

                    {/* Fin Contrato */}
                    <div className="space-y-2">
                        <Label htmlFor="fechaFinContrato">Fin Contrato</Label>
                        <Input
                            id="fechaFinContrato"
                            type="date"
                            value={formData.fechaFinContrato}
                            onChange={(e) => setFormData({ ...formData, fechaFinContrato: e.target.value })}
                        />
                    </div>

                    {/* Reemplazo - SOLO si es productiva */}
                    {esProductiva && (
                        <div className="space-y-2">
                            <Label htmlFor="reemplazo">Reemplazo Recomendado</Label>
                            {loadingRecomendados ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Buscando recomendados...</span>
                                </div>
                            ) : (
                                <>
                                    <Select value={formData.reemplazoId} onValueChange={(value) => setFormData({ ...formData, reemplazoId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar reemplazo (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {recomendados.map((rec) => (
                                                <SelectItem key={rec._id} value={rec._id}>
                                                    {rec.nombre} {rec.apellido || ''} - {rec.tipoDocumento} {rec.documento}
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        (Inicio: {rec.fechaInicioProductiva ? (() => {
                                                            const [year, month, day] = rec.fechaInicioProductiva.split('T')[0].split('-');
                                                            return `${parseInt(day)}/${parseInt(month)}/${year}`;
                                                        })() : 'Sin fecha'})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.reemplazoId && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, reemplazoId: '' })}
                                            className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Quitar reemplazo
                                        </Button>
                                    )}
                                </>
                            )}
                            {recomendados.length === 0 && !loadingRecomendados && formData.fechaFinContrato && (
                                <p className="text-xs text-amber-600">
                                    No hay reemplazos recomendados para esta fecha
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
