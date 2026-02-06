"use client";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../../shared/components/ui/SweetAlert";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ArrowLeft, Lock, Unlock, Upload, Loader2 } from "lucide-react";

import { useConvocatoriaDetail } from "../hooks/useConvocatoriaDetail";
import { RecomendadosModal } from "../components/RecomendadosModal";
import { CloseConvocatoriaDialog } from "../components/CloseConvocatoriaDialog";
import { ExcelUploadModal } from "../components/ExcelUploadModal";
import Header from "../../../shared/components/Header";

export default function ConvocatoriaDetailPage() {
  const { id: convocatoriaId } = useParams();
  const {
    convocatoria,
    aprendices,
    loading,
    error,
    actualizarEstadoAprendiz,
    cerrarConvocatoria,
    reabrirConvocatoria,
    cargarExcelAdicional,
  } = useConvocatoriaDetail(convocatoriaId);

  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [selectedRecomendados, setSelectedRecomendados] = useState(null);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleEstadoChange = async (
    aprendizId,
    nuevoEstado,
    nombreAprendiz = "",
  ) => {
    if (nuevoEstado === "seleccionado") {
      // Mostrar confirmación con SweetAlert
      const result = await confirmAlert({
        title: 'Confirmar selección',
        text: `Al marcar al aprendiz ${nombreAprendiz || "seleccionado"} como seleccionado se actualizará su etapa a "seleccion2". ¿Desea continuar?`,
        confirmText: 'Sí, confirmar',
        cancelText: 'Cancelar',
        icon: 'question'
      });

      if (!result.isConfirmed) return;

      // Si confirma, actualizar estado
      setActionLoading(true);
      try {
        await actualizarEstadoAprendiz(aprendizId, "seleccionado", {
          setSeleccion2: true,
        });
        successAlert({
          title: 'Aprendiz seleccionado',
          text: 'El aprendiz ha sido marcado como seleccionado exitosamente'
        });
      } catch (err) {
        errorAlert({
          title: 'Error',
          text: 'Error al actualizar el estado del aprendiz'
        });
      } finally {
        setActionLoading(false);
      }
      return;
    }
    
    // Para otros estados que no sean "seleccionado"
    await actualizarEstadoAprendiz(aprendizId, nuevoEstado);
  };

  const handleCloseConvocatoria = async () => {
    setActionLoading(true);
    try {
      await cerrarConvocatoria();
      setShowCloseDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditConvocatoria = async () => {
    setActionLoading(true);
    try {
      await reabrirConvocatoria();
      successAlert({
        title: 'Convocatoria reabierta',
        text: 'La convocatoria ha sido reabierta para edición'
      });
    } catch (err) {
      errorAlert({
        title: 'Error',
        text: 'Error al reabrir la convocatoria'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExcelUpload = async (aprendicesNuevos) => {
    setActionLoading(true);
    try {
      await cargarExcelAdicional(aprendicesNuevos);
      setShowExcelModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES");
    } catch {
      return dateStr;
    }
  };

  // Determinar si un aprendiz puede ser editado
  const canEditAprendiz = (aprendiz) => {
    if (!convocatoria) return false;
    // Si la convocatoria está finalizada, no se puede editar ninguno
    if (convocatoria.estado === "finalizado") return false;
    // Si el aprendiz está en seleccion2, no se puede editar
    if (aprendiz.etapaActual === "seleccion2") return false;
    return true;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="ml-64 min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <main className="ml-64 min-h-screen bg-gray-50 p-8">
          <div className="mb-6">
            <Link to="/convocatorias">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Convocatorias
              </Button>
            </Link>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!convocatoria) {
    return (
      <div>
        <Navbar />
        <main className="ml-64 min-h-screen bg-gray-50 p-8">
          <div className="mb-6">
            <Link to="/convocatorias">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Convocatorias
              </Button>
            </Link>
          </div>
          <div className="text-center py-12 text-gray-500">
            Convocatoria no encontrada
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50 p-1">
        <Header
          title="Editar convocatoria"
          subtitle={convocatoria.nombreConvocatoria}
          actions={<></>}
        />
        <div className="mb-6">
          <Link to="/convocatorias">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Convocatorias
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
          </div>
          <div className="flex gap-2">
            {convocatoria.estado === "en proceso" && (
              <Button
                variant="outline"
                onClick={() => setShowExcelModal(true)}
                className="bg-transparent"
                disabled={actionLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar Excel adicional
              </Button>
            )}
            {convocatoria.estado === "en proceso" ? (
              <Button onClick={() => setShowCloseDialog(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Finalizar Convocatoria
              </Button>
            ) : (
              <Button onClick={handleEditConvocatoria} disabled={actionLoading}>
                <Unlock className="h-4 w-4 mr-2" />
                Editar Convocatoria
              </Button>
            )}
          </div>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Aprendices en Convocatoria
              </h2>
              <Badge
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  convocatoria.estado === "en proceso"
                    ? "bg-blue-600 text-white hover:bg-blue-600"
                    : "bg-pink-500 text-white hover:bg-pink-500"
                }`}
              >
                {convocatoria.estado}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tipo Doc.
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      N. Documento
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ciudad
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Inicio Lectiva
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fin Lectiva
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Inicio Productiva
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fin Productiva
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Recomendados
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aprendices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="py-8 text-center text-gray-500"
                      >
                        No hay aprendices registrados en esta convocatoria
                      </td>
                    </tr>
                  ) : (
                    aprendices.map((aprendiz) => (
                      <tr
                        key={aprendiz._id}
                        className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                          aprendiz.etapaActual === "seleccion2"
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {aprendiz.ranking}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {aprendiz.nombre}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {aprendiz.tipoDocumento}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {aprendiz.documento}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {aprendiz.ciudad}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {aprendiz.programaFormacion}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(aprendiz.fechaInicioLectiva)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(aprendiz.fechaFinLectiva)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(aprendiz.fechaInicioProductiva)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(aprendiz.fechaFinProductiva)}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {aprendiz.aprendicesRecomendados &&
                          aprendiz.aprendicesRecomendados.length > 0 ? (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-blue-600 hover:underline"
                              onClick={() =>
                                setSelectedRecomendados(
                                  aprendiz.aprendicesRecomendados,
                                )
                              }
                            >
                              Ver {aprendiz.aprendicesRecomendados.length}{" "}
                              recomendado(s)
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {aprendiz.etapaActual === "seleccion2" ? (
                            <Badge
                              variant="outline"
                              className="border-gray-300 bg-gray-200 text-gray-600"
                            >
                              {aprendiz.estadoConvocatoria}
                            </Badge>
                          ) : (
                            <Select
                              value={aprendiz.estadoConvocatoria}
                              onValueChange={(value) =>
                                handleEstadoChange(
                                  aprendiz._id,
                                  value,
                                  aprendiz.nombre,
                                )
                              }
                              disabled={!canEditAprendiz(aprendiz)}
                            >
                              <SelectTrigger className="w-[160px] border-gray-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no seleccionado">
                                  No Seleccionado
                                </SelectItem>
                                <SelectItem value="seleccionado">
                                  Seleccionado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ELIMINADO: Dialog de confirmación (líneas 413-445) */}

        <CloseConvocatoriaDialog
          open={showCloseDialog}
          onOpenChange={setShowCloseDialog}
          onConfirm={handleCloseConvocatoria}
          loading={actionLoading}
        />

        <RecomendadosModal
          open={!!selectedRecomendados}
          onOpenChange={() => setSelectedRecomendados(null)}
          aprendices={selectedRecomendados || []}
        />

        <ExcelUploadModal
          open={showExcelModal}
          onOpenChange={setShowExcelModal}
          onSubmit={handleExcelUpload}
          loading={actionLoading}
        />
      </main>
    </div>
  );
}