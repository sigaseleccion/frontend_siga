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
import { convocatoriaService } from "@/features/Convocatorias/services/convocatoriaService";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { DataTable } from "@/shared/components/DataTable";
import Spinner from "../../../shared/components/ui/Spinner";

export default function HistoricoConvocatoriaDetailPage() {
  const { id: convocatoriaId } = useParams();

  const [convocatoria, setConvocatoria] = useState(null);
  const [aprendices, setAprendices] = useState([]);
  const [error, setError] = useState(null);
  const { setHeaderConfig } = useHeader();
  const [loading, setLoading] = useState(true);
  const MIN_LOADER_MS = 300;

  useEffect(() => {
    setHeaderConfig({
      title: "Histórico Convocatorias",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadAprendices = async () => {
      const start = Date.now();
      try {
        setError(null);
        setLoading(true);
        const [convData, aps] = await Promise.all([
          convocatoriaService.obtenerConvocatoriaPorId(convocatoriaId),
          aprendizService.obtenerAprendicesPorConvocatoria(convocatoriaId),
        ]);
        setConvocatoria(convData);
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
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        setTimeout(() => setLoading(false), remaining);
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
              {convocatoria?.nombreConvocatoria
                ? `${convocatoria.nombreConvocatoria} (Archivada)`
                : "Detalle Convocatoria Archivada"}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary">Archivada</Badge>
              <span className="text-muted-foreground">
                {convocatoria?.idConvocatoria || convocatoriaId}
              </span>
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
              <CardTitle>Aprendices</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">
                  {error}
                </div>
              )}
              {!loading && <DataTable
                columns={[
                  { key: "nombre", header: "Nombre" },
                  { key: "tipoDocumento", header: "Tipo Doc." },
                  { key: "documento", header: "N. Documento" },
                  { key: "ciudad", header: "Ciudad" },
                  { key: "programaFormacion", header: "Programa" },
                  {
                    key: "acciones",
                    header: "Acciones",
                    render: (value, row) => (
                      <Link to={`/seleccion/historico/${convocatoriaId}/aprendiz/${row.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
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
    </div>
  );
}
