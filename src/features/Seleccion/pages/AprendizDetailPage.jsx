"use client";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  CheckSquare,
} from "lucide-react";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { pruebaSeleccionService } from "@/features/Convocatorias/services/pruebaSeleccionService";
import { useHeader } from "../../../shared/contexts/HeaderContext";

export default function AprendizDetailPage() {
  const { id: convocatoriaId, aprendizId } = useParams();

  const [error, setError] = useState(null);
  const [aprendiz, setAprendiz] = useState(null);
  const [pruebas, setPruebas] = useState({
    psicologica: "pendiente",
    medica: "pendiente",
  });
  const [pruebaTecnica, setPruebaTecnica] = useState("pendiente");
  const [fechaInicioContrato, setFechaInicioContrato] = useState("");
  const [fechaFinContrato, setFechaFinContrato] = useState("");
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Detalle del Aprendiz",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const a = await aprendizService.obtenerAprendizPorId(aprendizId);
        setAprendiz(a);
        const inicioC = a.fechaInicioContrato
          ? new Date(a.fechaInicioContrato).toISOString().slice(0, 10)
          : "";
        const finC = a.fechaFinContrato
          ? new Date(a.fechaFinContrato).toISOString().slice(0, 10)
          : "";
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

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "aprobado":
        return <CheckCircle className="h-4 w-4 text-primary-foreground" />;
      case "no aprobado":
        return <XCircle className="h-4 w-4 text-primary-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-primary-foreground" />;
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

          <div className="mb-4">
            <Link to={`/seleccion/${convocatoriaId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Convocatoria
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informacion Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nombre
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.nombre || "-"}
                    </p>
                  </div>
                  <div className="break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Documento
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.tipoDocumento || "-"}{" "}
                      {aprendiz?.documento || ""}
                    </p>
                  </div>
                  <div className="break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pais
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.pais || "-"}
                    </p>
                  </div>
                  <div className="break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Ciudad
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.ciudad || "-"}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Direccion
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.direccion || "-"}
                    </p>
                  </div>
                  <div className="break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Telefono
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.telefono || "-"}
                    </p>
                  </div>
                  <div className="break-words overflow-hidden">
                    <p className="text-sm font-medium text-muted-foreground">
                      Correo
                    </p>
                    <p className="text-sm break-all">
                      {aprendiz?.correo || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informacion del Programa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="break-words">
                    <p className="text-sm font-medium text-muted-foreground">
                      Programa de Formacion
                    </p>
                    <p className="text-sm break-words">
                      {aprendiz?.programaFormacion || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Inicio Lectiva
                      </p>
                      <p className="text-sm">
                        {aprendiz?.fechaInicioLectiva
                          ? new Date(
                              aprendiz.fechaInicioLectiva,
                            ).toLocaleDateString("es-ES")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Fin Lectiva
                      </p>
                      <p className="text-sm">
                        {aprendiz?.fechaFinLectiva
                          ? new Date(
                              aprendiz.fechaFinLectiva,
                            ).toLocaleDateString("es-ES")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Inicio Productiva
                      </p>
                      <p className="text-sm">
                        {aprendiz?.fechaInicioProductiva
                          ? new Date(
                              aprendiz.fechaInicioProductiva,
                            ).toLocaleDateString("es-ES")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Fin Productiva
                      </p>
                      <p className="text-sm">
                        {aprendiz?.fechaFinProductiva
                          ? new Date(
                              aprendiz.fechaFinProductiva,
                            ).toLocaleDateString("es-ES")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fechas de Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha Inicio Contrato
                  </p>
                  <p className="text-sm">{fechaInicioContrato || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha Fin Contrato
                  </p>
                  <p className="text-sm">{fechaFinContrato || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pruebas de Seleccion</CardTitle>
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
                        <h4 className="font-semibold">Prueba Psicologica</h4>
                        <Badge
                          variant={
                            pruebas.psicologica === "aprobado"
                              ? "default"
                              : pruebas.psicologica === "no aprobado"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {pruebas.psicologica}
                        </Badge>
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
                          <h4 className="font-semibold">Prueba Tecnica</h4>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Badge
                          variant={
                            pruebaTecnica === "aprobado"
                              ? "default"
                              : pruebaTecnica === "no aprobado"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {pruebaTecnica}
                        </Badge>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-4 pl-10">
                      <div
                        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${getEstadoColor(pruebas.medica)}`}
                      >
                        {getEstadoIcon(pruebas.medica)}
                      </div>
                      <div className="flex-1 space-y-3 min-w-0">
                        <h4 className="font-semibold">Examenes Medicos</h4>
                        <Badge
                          variant={
                            pruebas.medica === "aprobado"
                              ? "default"
                              : pruebas.medica === "no aprobado"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {pruebas.medica}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
