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

  useEffect(() => {
    setHeaderConfig({
      title: "Selección",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
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

          <Card>
            <CardHeader>
              <CardTitle>Aprendices en Seleccion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Tipo Doc.
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        N. Documento
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Ciudad
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Programa
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Inicio Lectiva
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Fin Lectiva
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Inicio Productiva
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Fin Productiva
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aprendices.map((aprendiz) => (
                      <tr
                        key={aprendiz._id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          <span
                            className={`inline-block h-3 w-3 rounded-full mr-2 ${getDotClass(aprendiz)}`}
                          />
                          {aprendiz.nombre}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.tipoDocumento}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.documento}
                        </td>
                        <td className="py-3 px-4 text-sm">{aprendiz.ciudad}</td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.programaFormacion}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.fechaInicioLectiva
                            ? new Date(
                                aprendiz.fechaInicioLectiva,
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.fechaFinLectiva
                            ? new Date(
                                aprendiz.fechaFinLectiva,
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.fechaInicioProductiva
                            ? new Date(
                                aprendiz.fechaInicioProductiva,
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {aprendiz.fechaFinProductiva
                            ? new Date(
                                aprendiz.fechaFinProductiva,
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link
                              to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz._id}`}
                            >
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </Link>
                            <Link
                              to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz._id}/editar`}
                            >
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
