"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Eye, Edit, FileText, CheckSquare } from "lucide-react";
import { convocatoriaService } from "@/features/Convocatorias/services/convocatoriaService";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { pruebaSeleccionService } from "@/features/Convocatorias/services/pruebaSeleccionService";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { getNivelFormacionLabel } from "@/shared/utils/nivelFormacion";
import { DataTable } from "@/shared/components/DataTable";
import Spinner from "../../../shared/components/ui/Spinner";

export default function SeleccionConvocatoriaPage() {
  const { id: convocatoriaId } = useParams();

  const [convocatoriaInfo, setConvocatoriaInfo] = useState({
    id: convocatoriaId,
    idConvocatoria: "",
    nombreConvocatoria: "",
    nivelFormacion: "",
  });

  const [aprendices, setAprendices] = useState([]);
  const [error, setError] = useState(null);
  const { setHeaderConfig } = useHeader();
  const [loading, setLoading] = useState(true);
  const MIN_LOADER_MS = 300;

  useEffect(() => {
    setHeaderConfig({
      title: "Selección",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const start = Date.now();
      try {
        setError(null);
        setLoading(true);
        const conv =
          await convocatoriaService.obtenerConvocatoriaPorId(convocatoriaId);
        setConvocatoriaInfo({
          id: convocatoriaId,
          idConvocatoria: conv.idConvocatoria || "",
          nombreConvocatoria: conv.nombreConvocatoria,
          nivelFormacion: conv.nivelFormacion,
        });
        const aps =
          await aprendizService.obtenerAprendicesPorConvocatoria(
            convocatoriaId,
          );
        const filtrados = aps.filter((a) =>
          ["seleccion2", "lectiva", "productiva", "finalizado"].includes(
            a.etapaActual,
          ),
        );
        const enriched = await Promise.all(
          filtrados.map(async (a) => {
            let pruebas = {
              psicologica: "pendiente",
              tecnica: "pendiente",
              medica: "pendiente",
            };
            if (a.pruebaSeleccionId) {
              try {
                const ps = await pruebaSeleccionService.obtenerPorId(
                  a.pruebaSeleccionId,
                );
                pruebas = {
                  psicologica: ps.pruebaPsicologica || "pendiente",
                  tecnica: ps.pruebaTecnica || "pendiente",
                  medica: ps.examenesMedicos || "pendiente",
                };
              } catch (e) {
                console.error(e);
              }
            }
            return { ...a, pruebas };
          }),
        );
        setAprendices(enriched);
      } catch (e) {
        setError(e.message);
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    };
    loadData();
  }, [convocatoriaId]);

  const getDotClass = (aprendiz) => {
    const p = aprendiz.pruebas || {};
    const vals = [p.psicologica, p.tecnica, p.medica];
    const approved = vals.filter((v) => v === "aprobado").length;
    const pending = vals.filter((v) => v === "pendiente").length;
    const notApproved = vals.filter((v) => v === "no aprobado").length;
    const hasContract = Boolean(aprendiz.fechaInicioContrato);
    if (approved === 3 && hasContract) return "bg-green-500";
    if (approved === 3 && !hasContract) return "bg-yellow-400";
    if (notApproved >= 1) return "bg-blue-400";
    if (pending >= 1) return "bg-yellow-400";
    return "bg-muted-foreground/30";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES");
    } catch {
      return dateStr;
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
          <div className="flex items-center gap-2 mb-6 justify-between">
            <Link to="/seleccion">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Selección
              </Button>
            </Link>
            <Link to={`/seleccion/${convocatoriaId}/reporte-tecnico`}>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Reporte Técnico
              </Button>
            </Link>
          </div>

          <div className="mb-8 flex ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {convocatoriaInfo.nombreConvocatoria}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge>
                  {getNivelFormacionLabel(convocatoriaInfo.nivelFormacion)}
                </Badge>
                <span className="text-muted-foreground">
                  {convocatoriaInfo.idConvocatoria || convocatoriaId}
                </span>
              </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Aprendices en Seleccion</CardTitle>
            </CardHeader>
            <CardContent>
              {!loading && <DataTable
                columns={[
                  {
                    key: "nombre",
                    header: "Nombre",
                    render: (value, row) => (
                      <div className="flex items-center">
                        <span
                          className={`inline-block h-3 w-3 rounded-full mr-2 ${getDotClass(row)}`}
                        />
                        <span className="font-medium">{row.nombre}</span>
                      </div>
                    ),
                  },
                  { key: "tipoDocumento", header: "Tipo Doc." },
                  { key: "documento", header: "N. Documento" },
                  { key: "ciudad", header: "Ciudad" },
                  { key: "programaFormacion", header: "Programa" },
                  {
                    key: "fechaInicioLectiva",
                    header: "Inicio Lectiva",
                    render: (value) => <span>{formatDate(value)}</span>,
                  },
                  {
                    key: "fechaFinLectiva",
                    header: "Fin Lectiva",
                    render: (value) => <span>{formatDate(value)}</span>,
                  },
                  {
                    key: "fechaInicioProductiva",
                    header: "Inicio Productiva",
                    render: (value) => <span>{formatDate(value)}</span>,
                  },
                  {
                    key: "fechaFinProductiva",
                    header: "Fin Productiva",
                    render: (value) => <span>{formatDate(value)}</span>,
                  },
                  {
                    key: "acciones",
                    header: "Acciones",
                    render: (value, row) => (
                      <div className="flex gap-2">
                        <Link to={`/seleccion/${convocatoriaId}/aprendiz/${row._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Link to={`/seleccion/${convocatoriaId}/aprendiz/${row._id}/editar`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </Link>
                      </div>
                    ),
                  },
                ]}
                data={aprendices}
                pageSize={5}
                pageSizeOptions={[5, 10, 20]}
              />}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
