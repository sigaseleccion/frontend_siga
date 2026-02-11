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
import { ArrowLeft, CheckCircle, XCircle, Clock, CheckSquare } from "lucide-react";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { pruebaSeleccionService } from "@/features/Convocatorias/services/pruebaSeleccionService";

export default function HistoricoAprendizDetailPage() {
  const { id: convocatoriaId, aprendizId } = useParams();
  const { setHeaderConfig } = useHeader();
  const [error, setError] = useState(null);
  const [aprendiz, setAprendiz] = useState(null);
  const [pruebas, setPruebas] = useState({
    psicologica: "pendiente",
    medica: "pendiente",
  });
  const [pruebaTecnica, setPruebaTecnica] = useState("pendiente");
  const [fechaInicioContrato, setFechaInicioContrato] = useState("");
  const [fechaFinContrato, setFechaFinContrato] = useState("");

  useEffect(() => {
    setHeaderConfig({
      title: "Histórico Convocatorias",
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

  const pruebasArray = [
    { nombre: "Prueba Psicologica", estado: pruebas.psicologica },
    { nombre: "Prueba Tecnica", estado: pruebaTecnica },
    { nombre: "Examenes Medicos", estado: pruebas.medica },
  ];

  return (
    <div>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
        <div className="mb-6">
          <Link to={`/seleccion/historico/${convocatoriaId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Convocatoria
            </Button>
          </Link>
        </div>
        {error && (
          <Card className="mb-4">
            <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Detalle del Aprendiz (Historico)
          </h1>
          <p className="text-muted-foreground mt-2">
            Informacion completa y estado de pruebas
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informacion Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nombre
                  </p>
                  <p className="text-sm">{aprendiz?.nombre || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Documento
                  </p>
                  <p className="text-sm">
                    {aprendiz?.tipoDocumento || "-"} {aprendiz?.documento || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ciudad
                  </p>
                  <p className="text-sm">{aprendiz?.ciudad || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Telefono
                  </p>
                  <p className="text-sm">{aprendiz?.telefono || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Correo
                  </p>
                  <p className="text-sm">{aprendiz?.correo || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informacion del Programa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Programa de Formacion
                </p>
                <p className="text-sm">{aprendiz?.programaFormacion || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Inicio Lectiva
                  </p>
                  <p className="text-sm">
                    {aprendiz?.fechaInicioLectiva
                      ? new Date(aprendiz.fechaInicioLectiva).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fin Lectiva
                  </p>
                  <p className="text-sm">
                    {aprendiz?.fechaFinLectiva
                      ? new Date(aprendiz.fechaFinLectiva).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </p>
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
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Estado de Pruebas de Seleccion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {pruebasArray.map((prueba, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-4 pl-10"
                  >
                    <div
                      className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${getEstadoColor(prueba.estado)}`}
                    >
                      {getEstadoIcon(prueba.estado)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{prueba.nombre}</h4>
                      <Badge
                        variant={
                          prueba.estado === "aprobado"
                            ? "default"
                            : "destructive"
                        }
                        className="mt-2"
                      >
                        {prueba.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
