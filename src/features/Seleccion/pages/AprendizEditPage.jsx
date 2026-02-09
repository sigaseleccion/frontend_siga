"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/useToast";
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

export default function AprendizEditPage() {
  const { id: convocatoriaId, aprendizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showAprobarDialog, setShowAprobarDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [error, setError] = useState(null);

  const [aprendiz, setAprendiz] = useState(null);
  const [pruebaSeleccionId, setPruebaSeleccionId] = useState(null);
  const [pruebaTecnica, setPruebaTecnica] = useState("pendiente");

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
      try {
        setError(null);
        const a = await aprendizService.obtenerAprendizPorId(aprendizId);
        setAprendiz(a);
        setPruebaSeleccionId(a.pruebaSeleccionId || null);
        const inicioC = a.fechaInicioContrato
          ? new Date(a.fechaInicioContrato).toISOString().slice(0, 10)
          : "";
        const finC = a.fechaFinContrato
          ? new Date(a.fechaFinContrato).toISOString().slice(0, 10)
          : "";
        setInitialState((prev) => ({
          ...prev,
          fechaInicioContrato: inicioC,
          fechaFinContrato: finC,
        }));
        setFechaInicioContrato(inicioC);
        setFechaFinContrato(finC);
        if (a.pruebaSeleccionId) {
          try {
            const ps = await pruebaSeleccionService.obtenerPorId(
              a.pruebaSeleccionId,
            );
            setPruebas({
              psicologica: ps.pruebaPsicologica || "pendiente",
              medica: ps.examenesMedicos || "pendiente",
            });
            setPruebaTecnica(ps.pruebaTecnica || "pendiente");
          } catch (e) {
            setError(e.message);
          }
        }
      } catch (e) {
        setError(e.message);
      }
    };
    if (aprendizId) loadData();
  }, [aprendizId]);

  const todasPruebasAprobadas =
    pruebas.psicologica === "aprobado" &&
    pruebaTecnica === "aprobado" &&
    pruebas.medica === "aprobado";

  const puedeAprobar =
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "" &&
    aprendiz?.etapaActual === "seleccion2";

  const disablePorEtapa =
    aprendiz?.etapaActual !== "seleccion2" &&
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "";

  const mostrarAprobadoUI =
    todasPruebasAprobadas &&
    fechaInicioContrato !== "" &&
    fechaFinContrato !== "" &&
    aprendiz?.etapaActual !== "lectiva2";

  useEffect(() => {
    const autoSaveIfNeeded = async () => {
      if (disablePorEtapa && hasUnsavedChanges) {
        try {
          await aprendizService.actualizarAprendiz(aprendizId, {
            fechaInicioContrato: fechaInicioContrato || null,
            fechaFinContrato: fechaFinContrato || null,
          });
          setInitialState({
            pruebas,
            fechaInicioContrato,
            fechaFinContrato,
          });
        } catch (e) {
          setError(e.message);
        }
      }
    };
    autoSaveIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disablePorEtapa, hasUnsavedChanges]);

  const handlePruebaChange = async (prueba, estado) => {
    setPruebas((prev) => ({ ...prev, [prueba]: estado }));
    if (pruebaSeleccionId) {
      try {
        if (prueba === "psicologica") {
          await pruebaSeleccionService.actualizarPrueba(pruebaSeleccionId, {
            pruebaPsicologica: estado,
          });
        } else if (prueba === "medica") {
          await pruebaSeleccionService.actualizarPrueba(pruebaSeleccionId, {
            examenesMedicos: estado,
          });
        }
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const handleGuardar = async () => {
    try {
      await aprendizService.actualizarAprendiz(aprendizId, {
        fechaInicioContrato: fechaInicioContrato || null,
        fechaFinContrato: fechaFinContrato || null,
      });
      setInitialState({
        pruebas,
        fechaInicioContrato,
        fechaFinContrato,
      });
      toast({
        title: "Cambios Guardados",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAprobar = () => {
    if (!puedeAprobar) return;
    setShowAprobarDialog(true);
  };

  const confirmarAprobar = async () => {
    setShowAprobarDialog(false);
    try {
      await aprendizService.actualizarAprendiz(aprendizId, {
        etapaActual: "lectiva",
        fechaInicioContrato: fechaInicioContrato || null,
        fechaFinContrato: fechaFinContrato || null,
      });
      navigate(
        `/seleccion/${convocatoriaId}?aprobado=true&nombre=${encodeURIComponent(aprendiz?.nombre || "")}`,
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const handleBack = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setShowUnsavedDialog(true);
    }
  };

  const confirmarSalir = () => {
    setShowUnsavedDialog(false);
    navigate(`/seleccion/${convocatoriaId}`);
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
              {(mostrarAprobadoUI || !puedeAprobar) && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex-1 min-w-[250px]">
                  <p className="text-sm text-yellow-800">
                    {mostrarAprobadoUI
                      ? "Aprendiz aprobado"
                      : "Complete las fechas de inicio y fin de contrato para habilitar la aprobacion"}
                  </p>
                </div>
              )}

              <Button
                onClick={handleAprobar}
                disabled={!puedeAprobar}
                className="bg-green-600 hover:bg-green-700 text-primary-foreground shadow-md disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {mostrarAprobadoUI ? "Aprendiz Aprobado" : "Aprobar Aprendiz"}
              </Button>

              {hasUnsavedChanges && (
                <Button
                  onClick={handleGuardar}
                  disabled={disablePorEtapa}
                  className="bg-primary hover:bg-primary/90 shadow-md disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Informacion del Aprendiz
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
                      Telefono
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
                  Fechas de Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="fecha-inicio"
                    className="text-sm font-semibold"
                  >
                    Fecha Inicio Contrato
                  </Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicioContrato}
                    onChange={(e) => setFechaInicioContrato(e.target.value)}
                    disabled={!todasPruebasAprobadas || disablePorEtapa}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="fecha-fin" className="text-sm font-semibold">
                    Fecha Fin Contrato
                  </Label>
                  <Input
                    id="fecha-fin"
                    type="date"
                    value={fechaFinContrato}
                    onChange={(e) => setFechaFinContrato(e.target.value)}
                    disabled={!todasPruebasAprobadas || disablePorEtapa}
                    className="mt-2"
                  />
                </div>
                {!todasPruebasAprobadas && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      Las fechas se habilitaran cuando todas las pruebas esten
                      aprobadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Pruebas de Seleccion
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
                        Prueba Psicologica
                      </h4>
                      <div className="flex gap-3 items-center flex-wrap">
                        <Select
                          value={pruebas.psicologica}
                          onValueChange={(value) =>
                            !disablePorEtapa &&
                            handlePruebaChange("psicologica", value)
                          }
                        >
                          <SelectTrigger
                            className="w-[180px]"
                            disabled={disablePorEtapa}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="aprobado">Aprobado</SelectItem>
                            <SelectItem value="no aprobado">
                              No Aprobado
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
                          Prueba Tecnica
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
                          Este campo se modifica desde Reporte Tecnico
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
                        Examenes Medicos
                      </h4>
                      <div className="flex gap-3 items-center flex-wrap">
                        <Select
                          value={pruebas.medica}
                          onValueChange={(value) =>
                            !disablePorEtapa &&
                            handlePruebaChange("medica", value)
                          }
                        >
                          <SelectTrigger
                            className="w-[180px]"
                            disabled={disablePorEtapa}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="aprobado">Aprobado</SelectItem>
                            <SelectItem value="no aprobado">
                              No Aprobado
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

          <Dialog open={showAprobarDialog} onOpenChange={setShowAprobarDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Aprobacion</DialogTitle>
                <DialogDescription>
                  Estas seguro de que deseas que el aprendiz{" "}
                  <strong>{aprendiz?.nombre || ""}</strong>, pase a estado "en
                  seguimiento"?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAprobarDialog(false)}
                  className="bg-transparent"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarAprobar}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambios sin Guardar</DialogTitle>
                <DialogDescription>
                  Desea salir sin guardar los cambios realizados? Los cambios se
                  perderan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowUnsavedDialog(false)}
                  className="bg-transparent"
                >
                  Cancelar
                </Button>
                <Button onClick={confirmarSalir} variant="destructive">
                  Salir sin Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
