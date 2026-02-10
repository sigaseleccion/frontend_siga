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
import { ArrowLeft, CheckSquare, Eye } from "lucide-react";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { useHeader } from "../../../shared/contexts/HeaderContext";

export default function HistoricoConvocatoriaDetailPage() {
  const { id: convocatoriaId } = useParams();

  const [aprendices, setAprendices] = useState([]);
  const [error, setError] = useState(null);
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Histórico Convocatorias",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadAprendices = async () => {
      try {
        setError(null);
        const aps =
          await aprendizService.obtenerAprendicesPorConvocatoria(
            convocatoriaId,
          );
        setAprendices(
          aps
            .filter((a) =>
              ["seleccion2", "lectiva", "productiva", "finalizado"].includes(
                a.etapaActual,
              ),
            )
            .map((a) => ({
              id: a._id,
              nombre: a.nombre,
              tipoDocumento: a.tipoDocumento,
              documento: a.documento,
              ciudad: a.ciudad,
              programaFormacion: a.programaFormacion,
              fechaInicioLectiva: a.fechaInicioLectiva,
              fechaFinLectiva: a.fechaFinLectiva,
            })),
        );
      } catch (e) {
        setError(e.message);
      }
    };
    if (convocatoriaId) loadAprendices();
  }, [convocatoriaId]);

  return (
    <div>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="mb-6">
            <Link to="/seleccion/historico">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Historico
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Detalle Convocatoria Archivada
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary">Archivada</Badge>
              <span className="text-muted-foreground">{convocatoriaId}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aprendices</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">
                  {error}
                </div>
              )}
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
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aprendices.map((aprendiz) => (
                      <tr
                        key={aprendiz.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
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
                        <td className="py-3 px-4">
                          <Link
                            to={`/seleccion/${convocatoriaId}/aprendiz/${aprendiz.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
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
    </div>
  );
}
