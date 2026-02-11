"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ArrowLeft, Archive, Eye, CheckSquare } from "lucide-react";
import { convocatoriaService } from "@/features/Convocatorias/services/convocatoriaService";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { aprendizService } from '@/features/Convocatorias/services/aprendizService'
import { getNivelFormacionLabel } from "@/shared/utils/nivelFormacion";
import { DataTable } from "@/shared/components/DataTable";

export default function HistoricoConvocatoriasPage() {
  const [archivedConvocatorias, setArchivedConvocatorias] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Histórico Convocatorias",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadArchived = async () => {
      try {
        setError(null)
        const data = await convocatoriaService.obtenerConvocatoriasArchivadas()
        const enriched = await Promise.all(
          data.map(async (c) => {
            try {
              const aprendices = await aprendizService.obtenerAprendicesPorConvocatoria(c._id)
              const validStates = ['seleccion2', 'lectiva', 'productiva', 'finalizado']
              const filtered = aprendices.filter((a) => validStates.includes(a.etapaActual))
              return {
                id: c._id,
                idConvocatoria: c.idConvocatoria,
                nombreConvocatoria: c.nombreConvocatoria,
                programa: c.programa,
                nivelFormacion: c.nivelFormacion,
                totalAprendices: filtered.length,
                fechaArchivado: c.fechaArchivado,
              }
            } catch {
              return {
                id: c._id,
                idConvocatoria: c.idConvocatoria,
                nombreConvocatoria: c.nombreConvocatoria,
                programa: c.programa,
                nivelFormacion: c.nivelFormacion,
                totalAprendices: c.totalAprendices || 0,
                fechaArchivado: c.fechaArchivado,
              }
            }
          })
        )
        setArchivedConvocatorias(enriched)
      } catch (e) {
        setError(e.message);
      }
    };
    loadArchived();
  }, []);

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
            <Link to="/seleccion">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Volver a Seleccion
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Input
                placeholder="Buscar por ID, nombre, programa o nivel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
              <ArrowLeft className="hidden" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Convocatorias Archivadas</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const term = searchTerm.toLowerCase().trim();
                const filtered = term
                  ? archivedConvocatorias.filter((c) => {
                      const idStr = String(c.idConvocatoria || c.id || "").toLowerCase();
                      const nombre = String(c.nombreConvocatoria || "").toLowerCase();
                      const programa = String(c.programa || "").toLowerCase();
                      const nivel = String(getNivelFormacionLabel(c.nivelFormacion) || "").toLowerCase();
                      return (
                        idStr.includes(term) ||
                        nombre.includes(term) ||
                        programa.includes(term) ||
                        nivel.includes(term)
                      );
                    })
                  : archivedConvocatorias;

                return filtered.length > 0 ? (
                  <DataTable
                    columns={[
                      {
                        key: "idConvocatoria",
                        header: "ID Convocatoria",
                        render: (value, row) => (
                          <span className="font-medium">
                            {row.idConvocatoria || row.id}
                          </span>
                        ),
                      },
                      { key: "nombreConvocatoria", header: "Nombre Convocatoria" },
                      { key: "programa", header: "Programa" },
                      {
                        key: "nivelFormacion",
                        header: "Nivel Formacion",
                        render: (value) => getNivelFormacionLabel(value),
                      },
                      { key: "totalAprendices", header: "Total Aprendices" },
                      {
                        key: "fechaArchivado",
                        header: "Fecha Archivado",
                        render: (value) =>
                          new Date(value).toLocaleDateString("es-ES"),
                      },
                      {
                        key: "acciones",
                        header: "Acciones",
                        render: (value, row) => (
                          <Link to={`/seleccion/historico/${row.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Button>
                          </Link>
                        ),
                      },
                    ]}
                    data={filtered}
                    pageSize={5}
                    emptyMessage="No hay convocatorias archivadas"
                  />
                ) : (
                  <div className="py-12 text-center">
                    <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No hay convocatorias archivadas
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
