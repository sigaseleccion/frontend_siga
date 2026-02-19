"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  confirmAlert,
  errorAlert,
  successAlert,
} from "../../../shared/components/ui/SweetAlert";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Save,
  Clock,
  Lock,
  CheckSquare,
} from "lucide-react";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { pruebaSeleccionService } from "@/features/Convocatorias/services/pruebaSeleccionService";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import Spinner from "../../../shared/components/ui/Spinner";
import { seguimientoService } from "../../seguimiento/services/seguimientoService";

export default function AprendizEditPage() {
  const { id: convocatoriaId, aprendizId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const toBogotaInput = (d) => {
    if (!d) return "";
    const iso = typeof d === "string" ? d : new Date(d).toISOString();
    return iso.slice(0, 10);
  };
  const toBogotaDisplay = (d) => {
    if (!d) return "-";
    const iso = typeof d === "string" ? d : new Date(d).toISOString();
    const [y, m, day] = iso.slice(0, 10).split("-");
    return `${day}/${m}/${y}`;
  };

  const [aprendiz, setAprendiz] = useState(null);
  const [pruebaSeleccionId, setPruebaSeleccionId] = useState(null);
  const [pruebaTecnica, setPruebaTecnica] = useState("pendiente");
  const [backendPruebasAprobadas, setBackendPruebasAprobadas] = useState(false);
  const [aprobadoLocal, setAprobadoLocal] = useState(false);

  const [initialState, setInitialState] = useState({
    pruebas: { psicologica: "pendiente", medica: "pendiente" },
    fechaInicioContrato: "",
    fechaFinContrato: "",
  });

  const [pruebas, setPruebas] = useState(initialState.pruebas);
  const [fechaInicioContrato, setFechaInicioContrato] = useState(
    initialState.fechaInicioContrato,
  );
  const [fechaFinContrato, setFechaFinContrato] = useState(
    initialState.fechaFinContrato,
  );
  const { setHeaderConfig } = useHeader();
  const [loading, setLoading] = useState(true);
  const MIN_LOADER_MS = 300;
  const [recomendados, setRecomendados] = useState([]);
  const [loadingRecomendados, setLoadingRecomendados] = useState(false);
  const [apReemplazar, setApReemplazar] = useState(null);
  const [infoReemplazo, setInfoReemplazo] = useState(null);
  const [apReemplazarPersistido, setApReemplazarPersistido] = useState(null);
  const [reemplazoElegido, setReemplazoElegido] = useState(true);

  useEffect(() => {
    setHeaderConfig({
      title: "Editar Aprendiz",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  const hasUnsavedChanges =
    pruebas.psicologica !== initialState.pruebas.psicologica ||
    pruebas.medica !== initialState.pruebas.medica ||
    fechaInicioContrato !== initialState.fechaInicioContrato ||
    fechaFinContrato !== initialState.fechaFinContrato;

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const loadData = async () => {
      const start = Date.now();
      try {
        setError(null);
        setLoading(true);
        const a = await aprendizService.obtenerAprendizPorId(aprendizId);
        setAprendiz(a);
        setPruebaSeleccionId(a.pruebaSeleccionId || null);
        setApReemplazar(a.apReemplazar || null);
        setApReemplazarPersistido(a.apReemplazar || null);
        if (a.apReemplazar) {
          try {
            const info = await aprendizService.obtenerAprendizPorId(a.apReemplazar);
            setInfoReemplazo(info || null);
          } catch (e) {
          }
        } else {
          setInfoReemplazo(null);
        }
        const inicioC = toBogotaInput(a.fechaInicioContrato);
        const finC = toBogotaInput(a.fechaFinContrato);
        setFechaInicioContrato(inicioC);
        setFechaFinContrato(finC);
        if (a.pruebaSeleccionId) {
          try {
            const ps = await pruebaSeleccionService.obtenerPorId(
              a.pruebaSeleccionId,
            );
            const psicologica = ps.pruebaPsicologica || "pendiente";
            const medica = ps.examenesMedicos || "pendiente";
            setPruebas({ psicologica, medica });
            setPruebaTecnica(ps.pruebaTecnica || "pendiente");
            const ok =
              psicologica === "aprobado" &&
              medica === "aprobado" &&
              (ps.pruebaTecnica || "pendiente") === "aprobado";
            setBackendPruebasAprobadas(ok);
            setInitialState({
              pruebas: { psicologica, medica },
              fechaInicioContrato: inicioC,
              fechaFinContrato: finC,
            });
          } catch (e) {
            setError(e.message);
          }
        } else {
          setInitialState({
            pruebas: { psicologica: "pendiente", medica: "pendiente" },
            fechaInicioContrato: inicioC,
            fechaFinContrato: finC,
          });
        }
      } catch (e) {
        setError(e.message);
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    };
    if (aprendizId) loadData();
  }, [aprendizId]);

  const todasPruebasAprobadas = backendPruebasAprobadas;

  const puedeAprobar =
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "" &&
    reemplazoElegido &&
    aprendiz?.etapaActual === "seleccion2" &&
    !aprobadoLocal &&
    apReemplazarPersistido === null &&
    !(aprendiz?.fechaInicioContrato && aprendiz?.fechaFinContrato);

  const lockSelectors =
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "";

  const disablePorEtapa =
    aprendiz?.etapaActual !== "seleccion2" &&
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "";

  const mostrarAprobadoUI =
    aprobadoLocal ||
    aprendiz?.etapaActual === "lectiva" ||
    apReemplazarPersistido !== null ||
    (aprendiz?.fechaInicioContrato && aprendiz?.fechaFinContrato);

  const pendienteConfirmar =
    !mostrarAprobadoUI &&
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "" &&
    reemplazoElegido;

  useEffect(() => {
  }, []);

  const handlePruebaChange = (prueba, estado) => {
    setPruebas((prev) => ({ ...prev, [prueba]: estado }));
  };

  const handleGuardar = async () => {
    try {
      if (pruebaSeleccionId) {
        await pruebaSeleccionService.actualizarPrueba(pruebaSeleccionId, {
          pruebaPsicologica: pruebas.psicologica,
          examenesMedicos: pruebas.medica,
        });
        try {
          const ps = await pruebaSeleccionService.obtenerPorId(
            pruebaSeleccionId,
          );
          const ok =
            (ps.pruebaPsicologica || "pendiente") === "aprobado" &&
            (ps.examenesMedicos || "pendiente") === "aprobado" &&
            (ps.pruebaTecnica || "pendiente") === "aprobado";
          setBackendPruebasAprobadas(ok);
          setPruebaTecnica(ps.pruebaTecnica || "pendiente");
        } catch (e) {
          setError(e.message);
        }
      }
      setInitialState((prev) => ({
        ...prev,
        pruebas,
      }));
      await successAlert({
        title: "Cambios guardados",
        text: "Se guardaron las pruebas.",
      });
    } catch (e) {
      setError(e.message);
      await errorAlert({
        title: "Error al guardar",
        text: "No se pudieron guardar los cambios.",
      });
    }
  };

  const handleAprobar = async () => {
    if (!puedeAprobar) return;
    const textoReemplazo = apReemplazar
      ? "Se asociará el reemplazo seleccionado"
      : "Se asociará sin reemplazo";
    const result = await confirmAlert({
      title: "Aprobar aprendiz",
      text: `¿Desea aprobar al aprendiz ${aprendiz?.nombre || ""}? ${textoReemplazo} y cambiará a lectiva en la fecha de contrato.`,
      confirmText: "Sí, aprobar",
      cancelText: "Cancelar",
      icon: "warning",
    });
    if (!result.isConfirmed) return;
    try {
      await aprendizService.actualizarAprendiz(aprendizId, {
        fechaInicioContrato: fechaInicioContrato || null,
        fechaFinContrato: fechaFinContrato || null,
        apReemplazar: apReemplazar || null,
      });
      if (apReemplazar) {
        try {
          await aprendizService.actualizarAprendiz(apReemplazar, {
            reemplazoId: aprendizId,
          });
        } catch (e) {
          // Ignorar fallo de enlace inverso para no bloquear la aprobación
        }
      }
      try {
        const actualizado = await aprendizService.obtenerAprendizPorId(aprendizId);
        setAprendiz(actualizado);
        setApReemplazar(actualizado.apReemplazar || null);
        setApReemplazarPersistido(actualizado.apReemplazar || null);
        setInitialState({
          pruebas,
          fechaInicioContrato,
          fechaFinContrato,
        });
        if (actualizado.apReemplazar) {
          const info = await aprendizService.obtenerAprendizPorId(actualizado.apReemplazar);
          setInfoReemplazo(info || null);
        } else {
          setInfoReemplazo(null);
        }
      } catch (e) {
        // Si falla la recarga, al menos marcamos aprobadoLocal
      }
      setAprobadoLocal(true);
      await successAlert({
        title: "Aprendiz aprobado",
        text: "El aprendiz ha sido aprobado. Cambiará a etapa lectiva en la fecha de inicio de contrato.",
      });
      window.location.reload();
    } catch (e) {
      setError(e.message);
      await errorAlert({
        title: "Error al aprobar",
        text: "No se pudo aprobar al aprendiz.",
      });
    }
  };

  // Cargar recomendados por fecha de inicio de contrato cuando haya fechas válidas y pruebas aprobadas
  useEffect(() => {
    const cargarRecomendados = async () => {
      if (!todasPruebasAprobadas || !fechaInicioContrato) {
        setRecomendados([]);
        return;
      }
      try {
        setLoadingRecomendados(true);
        const data = await seguimientoService.obtenerRecomendadosPorContrato(fechaInicioContrato);
        setRecomendados(data || []);
      } catch (e) {
        setError(e.message);
        setRecomendados([]);
      } finally {
        setLoadingRecomendados(false);
      }
    };
    cargarRecomendados();
  }, [todasPruebasAprobadas, fechaInicioContrato]);

  const handleSelectReemplazo = async (id) => {
    const seleccionado = recomendados.find((r) => r._id === id) || null;
    const nombreSel = seleccionado ? `${seleccionado.nombre} (${seleccionado.tipoDocumento} ${seleccionado.documento})` : '';
    const result = await confirmAlert({
      title: "Confirmar reemplazo",
      text: seleccionado
        ? `Se asociará como reemplazo: ${nombreSel}`
        : "Se limpiará el reemplazo seleccionado",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      icon: "info",
    });
    if (!result.isConfirmed) return;
    try {
      setApReemplazar(id || null);
      setReemplazoElegido(true);
      if (id) {
        const info = await aprendizService.obtenerAprendizPorId(id);
        setInfoReemplazo(info || null);
      } else {
        setInfoReemplazo(null);
      }
      await successAlert({
        title: "Reemplazo seleccionado",
        text: seleccionado ? `Se seleccionó ${nombreSel}` : "Se limpió el reemplazo",
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleBack = async (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      const result = await confirmAlert({
        title: "Cambios sin guardar",
        text: "Tiene cambios sin guardar. ¿Desea salir sin guardar?",
        confirmText: "Salir sin guardar",
        cancelText: "Cancelar",
        icon: "warning",
      });
      if (result.isConfirmed) {
        navigate(`/seleccion/${convocatoriaId}`);
      }
    }
  };


  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "aprobado":
        return <CheckCircle className="h-4 w-4 text-primary-foreground" />;
      case "no aprobado":
        return <XCircle className="h-4 w-4 text-primary-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "aprobado":
        return "bg-green-600";
      case "no aprobado":
        return "bg-red-600";
      default:
        return "bg-muted";
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          {error && (
            <Card className="mb-4">
              <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
                {error}
              </CardContent>
            </Card>
          )}
          <div className="mb-3 flex items-center justify-between">
            <Link to={`/seleccion/${convocatoriaId}`} onClick={handleBack}>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Convocatoria
              </Button>
            </Link>

            <div className="flex gap-4 items-center justify-end flex-wrap">
              {(mostrarAprobadoUI || pendienteConfirmar || !puedeAprobar) && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex-1 min-w-[250px]">
                  <p className="text-sm text-yellow-800">
                    {mostrarAprobadoUI
                      ? "Aprendiz aprobado"
                      : pendienteConfirmar
                        ? "Pendiente de confirmar aprobación: haga clic en 'Aprobar aprendiz' para guardar"
                        : "Complete fechas de contrato y seleccione el reemplazo para habilitar la aprobación"}
                  </p>
                </div>
              )}

              <Button
                onClick={handleAprobar}
                disabled={!puedeAprobar}
                className="bg-green-600 hover:bg-green-700 text-primary-foreground shadow-md disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {mostrarAprobadoUI ? "Aprendiz aprobado" : "Aprobar aprendiz"}
              </Button>

              {!todasPruebasAprobadas && !mostrarAprobadoUI && (
                <Button
                  onClick={handleGuardar}
                  disabled={disablePorEtapa}
                  className="bg-primary hover:bg-primary/90 shadow-md disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              )}
            </div>
          </div>

          {loading && (
            <div className="mb-8 flex items-center justify-center py-10">
              <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
                <Spinner />
                <span className="text-gray-700 font-medium">Cargando...</span>
              </div>
            </div>
          )}

          {!loading && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Información del aprendiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg break-words">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Nombre
                      </p>
                      <p className="text-sm font-medium text-foreground break-words">
                        {aprendiz?.nombre || "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg break-words">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Documento
                      </p>
                      <p className="text-sm font-medium text-foreground break-words">
                        {aprendiz?.tipoDocumento || "-"}{" "}
                        {aprendiz?.documento || ""}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg break-all overflow-hidden">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Correo
                      </p>
                      <p className="text-sm font-medium text-foreground break-all">
                        {aprendiz?.correo || "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg break-words">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Teléfono
                      </p>
                      <p className="text-sm font-medium text-foreground break-words">
                        {aprendiz?.telefono || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Fechas de contrato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="fecha-inicio"
                      className="text-sm font-semibold"
                    >
                      Fecha inicio de contrato
                    </Label>
                    <Input
                      id="fecha-inicio"
                      type="date"
                      value={fechaInicioContrato}
                      onChange={(e) => setFechaInicioContrato(e.target.value)}
                      disabled={!todasPruebasAprobadas || disablePorEtapa || mostrarAprobadoUI}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha-fin" className="text-sm font-semibold">
                      Fecha fin de contrato
                    </Label>
                    <Input
                      id="fecha-fin"
                      type="date"
                      value={fechaFinContrato}
                      onChange={(e) => setFechaFinContrato(e.target.value)}
                      disabled={!todasPruebasAprobadas || disablePorEtapa || mostrarAprobadoUI}
                      className="mt-2"
                    />
                  </div>
                  {!todasPruebasAprobadas && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        Las fechas se habilitarán cuando todas las pruebas estén
                        aprobadas.
                      </p>
                    </div>
                  )}
                  {fechaInicioContrato && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        Este aprendiz cambiará al módulo de seguimiento con estado lectiva (Contrato) en la fecha {fechaInicioContrato}.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && (
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Pruebas de selección
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      <div className="relative flex items-start gap-4 pl-10">
                        <div
                          className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(pruebas.psicologica)}`}
                        >
                          {getEstadoIcon(pruebas.psicologica)}
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                          <h4 className="font-semibold text-foreground">
                            Prueba psicológica
                          </h4>
                          <div className="flex gap-3 items-center flex-wrap">
                            <Select
                              value={pruebas.psicologica}
                              onValueChange={(value) =>
                                !(disablePorEtapa || lockSelectors) &&
                                handlePruebaChange("psicologica", value)
                              }
                            >
                              <SelectTrigger
                                className="w-[180px]"
                                disabled={disablePorEtapa || lockSelectors}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="aprobado">Aprobado</SelectItem>
                                <SelectItem value="no aprobado">
                                  No aprobado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-4 pl-10">
                        <div
                          className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(pruebaTecnica)}`}
                        >
                          {getEstadoIcon(pruebaTecnica)}
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                              Prueba técnica
                            </h4>
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex gap-3 items-center flex-wrap">
                            <div className="px-3 py-2 bg-muted/50 rounded-md border border-border">
                              <span className="text-sm capitalize">
                                {pruebaTecnica}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Este campo se modifica desde Reporte técnico
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-4 pl-10">
                        <div
                          className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(pruebas.medica)}`}
                        >
                          {getEstadoIcon(pruebas.medica)}
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                          <h4 className="font-semibold text-foreground">
                            Exámenes médicos
                          </h4>
                          <div className="flex gap-3 items-center flex-wrap">
                            <Select
                              value={pruebas.medica}
                              onValueChange={(value) =>
                                !(disablePorEtapa || lockSelectors) &&
                                handlePruebaChange("medica", value)
                              }
                            >
                              <SelectTrigger
                                className="w-[180px]"
                                disabled={disablePorEtapa || lockSelectors}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="aprobado">Aprobado</SelectItem>
                                <SelectItem value="no aprobado">
                                  No aprobado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Aprendiz a Reemplazar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select
                      value={apReemplazar ?? "none"}
                      onValueChange={(value) =>
                        handleSelectReemplazo(value === "none" ? null : value)
                      }
                      disabled={
                        !todasPruebasAprobadas ||
                        !fechaInicioContrato ||
                        apReemplazarPersistido !== null ||
                        mostrarAprobadoUI
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[320px]">
                        <SelectValue placeholder={loadingRecomendados ? "Cargando..." : "Seleccione aprendiz"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          Sin reemplazo
                        </SelectItem>
                        {recomendados.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.nombre} • {r.tipoDocumento} {r.documento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!todasPruebasAprobadas && (
                      <p className="text-xs text-muted-foreground">
                        Primero apruebe todas las pruebas para habilitar el reemplazo.
                      </p>
                    )}
                    {infoReemplazo && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm w-full sm:max-w-xl">
                        <p className="font-semibold">Reemplazo seleccionado</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <div>
                            <span className="text-muted-foreground font-semibold">Nombre</span>
                            <p>{infoReemplazo.nombre}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Documento</span>
                            <p>{infoReemplazo.tipoDocumento} {infoReemplazo.documento}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Fin lectiva</span>
                            <p>{toBogotaDisplay(infoReemplazo.fechaFinLectiva)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Inicio productiva</span>
                            <p>{toBogotaDisplay(infoReemplazo.fechaInicioProductiva)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Inicio contrato</span>
                            <p>{toBogotaDisplay(infoReemplazo.fechaInicioContrato)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Fin productiva</span>
                            <p>{toBogotaDisplay(infoReemplazo.fechaFinProductiva)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Fin contrato</span>
                            <p>{toBogotaDisplay(infoReemplazo.fechaFinContrato)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
