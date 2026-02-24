"use client";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../../shared/components/ui/SweetAlert";
import { useEffect, useState } from "react";
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
import {
  ArrowLeft,
  Lock,
  Unlock,
  Upload,
  Loader2,
  AlignEndHorizontal,
  PenBoxIcon,
} from "lucide-react";

import { useConvocatoriaDetail } from "../hooks/useConvocatoriaDetail";
import { RecomendadosModal } from "../components/RecomendadosModal";
import { CloseConvocatoriaDialog } from "../components/CloseConvocatoriaDialog";
import { ExcelUploadModal } from "../components/ExcelUploadModal";
import Header from "../../../shared/components/Header";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import Spinner from "../../../shared/components/ui/Spinner";
import { DataTable } from "../../../shared/components/DataTable";
import { aprendizService } from "../services/aprendizService";
import { tienePermiso } from "../../../shared/utils/auth/permissions";
import { useAuth } from "../../../shared/contexts/auth/AuthContext";

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
  const [loadingRecomendados, setLoadingRecomendados] = useState(false);
  const { setHeaderConfig } = useHeader();
    const { auth } = useAuth();

  // Función para cargar los datos completos de aprendices recomendados
  const handleVerRecomendados = async (recomendadosIds) => {
    console.log("[v0] Cargando aprendices recomendados:", recomendadosIds);
    setLoadingRecomendados(true);
    try {
      const aprendicesCompletos =
        await aprendizService.obtenerAprendicesPorIds(recomendadosIds);
      console.log("[v0] Aprendices completos obtenidos:", aprendicesCompletos);
      setSelectedRecomendados(aprendicesCompletos);
    } catch (error) {
      console.error("[v0] Error al cargar aprendices recomendados:", error);
      errorAlert({
        title: "Error",
        text: "No se pudieron cargar los aprendices recomendados",
      });
      setSelectedRecomendados([]);
    } finally {
      setLoadingRecomendados(false);
    }
  };

  useEffect(() => {
    setHeaderConfig({
      title: "Editar Convocatoria",
      icon: PenBoxIcon,
      iconBg: "from-blue-600 to-blue-400",
      accions: (
        <Link to="/convocatorias">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Convocatorias
          </Button>
        </Link>
      ),
    });
  }, []);

  const handleEstadoChange = async (
    aprendizId,
    nuevoEstado,
    nombreAprendiz = "",
  ) => {
    if (nuevoEstado === "seleccionado") {
      const result = await confirmAlert({
        title: "Confirmar selección",
        text: `Al marcar al aprendiz ${nombreAprendiz || "seleccionado"} como seleccionado se registrará su estado. El cambio a etapa "seleccion2" se aplicará al finalizar la convocatoria.`,
        confirmText: "Sí, confirmar",
        cancelText: "Cancelar",
        icon: "question",
      });

      if (!result.isConfirmed) return;

      setActionLoading(true);
      try {
        await actualizarEstadoAprendiz(aprendizId, "seleccionado");
        successAlert({
          title: "Aprendiz seleccionado",
          text: "El aprendiz ha sido marcado como seleccionado exitosamente",
        });
      } catch (err) {
        errorAlert({
          title: "Error",
          text: "Error al actualizar el estado del aprendiz",
        });
      } finally {
        setActionLoading(false);
      }
      return;
    }

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
        title: "Convocatoria reabierta",
        text: "La convocatoria ha sido reabierta para edición",
      });
    } catch (err) {
      errorAlert({
        title: "Error",
        text: "Error al reabrir la convocatoria",
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
      const iso =
        typeof dateStr === "string" ? dateStr : new Date(dateStr).toISOString();
      const [y, m, d] = iso.slice(0, 10).split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return "-";
    }
  };

  // Determinar si un aprendiz puede ser editado
  const canEditAprendiz = (aprendiz) => {
    if (!convocatoria) return false;
    // Si la convocatoria está finalizada, no se puede editar ninguno
    if (convocatoria.estado === "finalizado") return false;
    // Si el aprendiz está en etapa avanzada, no se puede editar
    if (
      ["seleccion2", "lectiva", "productiva", "finalizado"].includes(
        aprendiz.etapaActual,
      )
    )
      return false;
    return true;
  };

  if (loading) {
    return (
      <div>
        <main className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
            <Spinner />
            <span className="text-gray-700 font-medium">Cargando...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <main className="min-h-screen bg-gray-50 p-4">
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
        <main className="min-h-screen bg-gray-50 p-4">
          <div className="p-4">
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
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link to="/convocatorias">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Convocatorias
                </Button>
              </Link>
            </div>
            <div className="flex gap-2">
              {convocatoria.estado === "en proceso" &&
                tienePermiso(auth, "convocatorias", "cargarExcelAdicional") && (
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
                <Button
                  onClick={handleEditConvocatoria}
                  disabled={actionLoading}
                >
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
              <DataTable
                columns={[
                  {
                    key: "ranking",
                    header: "Ranking",
                    render: (value) => (
                      <span className="font-medium text-gray-900">{value}</span>
                    ),
                  },
                  {
                    key: "nombre",
                    header: "Nombre",
                  },
                  {
                    key: "tipoDocumento",
                    header: "Tipo Doc.",
                  },
                  {
                    key: "documento",
                    header: "N. Documento",
                  },
                  {
                    key: "ciudad",
                    header: "Ciudad",
                  },
                  {
                    key: "programaFormacion",
                    header: "Programa",
                  },
                  {
                    key: "fechaInicioLectiva",
                    header: "Inicio Lectiva",
                    render: (value) => formatDate(value),
                  },
                  {
                    key: "fechaFinLectiva",
                    header: "Fin Lectiva",
                    render: (value) => formatDate(value),
                  },
                  {
                    key: "fechaInicioProductiva",
                    header: "Inicio Productiva",
                    render: (value) => formatDate(value),
                  },
                  {
                    key: "fechaFinProductiva",
                    header: "Fin Productiva",
                    render: (value) => formatDate(value),
                  },
                  {
                    key: "aprendicesRecomendados",
                    header: "Recomendados",
                    render: (value, row) =>
                      value && value.length > 0 ? (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-600 hover:underline"
                          onClick={() => handleVerRecomendados(value)}
                          disabled={loadingRecomendados}
                        >
                          {loadingRecomendados
                            ? "Cargando..."
                            : `Ver ${value.length} recomendado(s)`}
                        </Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      ),
                  },
                  {
                    key: "estadoConvocatoria",
                    header: "Estado",
                    render: (value, row) =>
                      [
                        "seleccion2",
                        "lectiva",
                        "productiva",
                        "finalizado",
                      ].includes(row.etapaActual) ? (
                        <Badge
                          variant="outline"
                          className="border-gray-300 bg-gray-200 text-gray-600"
                        >
                          seleccionado
                        </Badge>
                      ) : (
                        <Select
                          value={value}
                          onValueChange={(newValue) =>
                            handleEstadoChange(row._id, newValue, row.nombre)
                          }
                          disabled={!canEditAprendiz(row)}
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
                      ),
                  },
                ]}
                data={aprendices}
                pageSize={5}
                emptyMessage="No hay aprendices registrados en esta convocatoria"
                rowClassName={(row) =>
                  `border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                    row.etapaActual === "seleccion2" ? "bg-gray-100" : ""
                  }`
                }
              />
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
        </div>
      </main>
    </>
  );
}
