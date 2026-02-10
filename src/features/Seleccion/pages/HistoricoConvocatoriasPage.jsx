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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ArrowLeft, Archive, Eye, CheckSquare } from "lucide-react";
import { convocatoriaService } from "@/features/Convocatorias/services/convocatoriaService";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { aprendizService } from '@/features/Convocatorias/services/aprendizService'

export default function HistoricoConvocatoriasPage() {
  const [archivedConvocatorias, setArchivedConvocatorias] = useState([]);
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

  const getNivelFormacionLabel = (nivel) => {
    const labels = {
      tecnica: "Tecnica",
      tecnologia: "Tecnologia",
      profesional: "Profesional",
    };
    return labels[nivel];
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
            <Link to="/seleccion">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Volver a Seleccion
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Convocatorias Archivadas</CardTitle>
            </CardHeader>
            <CardContent>
              {archivedConvocatorias.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Convocatoria</TableHead>
                      <TableHead>Nombre Convocatoria</TableHead>
                      <TableHead>Programa</TableHead>
                      <TableHead>Nivel Formacion</TableHead>
                      <TableHead className="text-center">
                        Total Aprendices
                      </TableHead>
                      <TableHead>Fecha Archivado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedConvocatorias.map((convocatoria) => (
                      <TableRow key={convocatoria.id}>
                        <TableCell className="font-medium">
                          {convocatoria.idConvocatoria || convocatoria.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {convocatoria.nombreConvocatoria}
                        </TableCell>
                        <TableCell>{convocatoria.programa}</TableCell>
                        <TableCell>
                          {getNivelFormacionLabel(convocatoria.nivelFormacion)}
                        </TableCell>
                        <TableCell className="text-center">
                          {convocatoria.totalAprendices}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            convocatoria.fechaArchivado,
                          ).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell>
                          <Link to={`/seleccion/historico/${convocatoria.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No hay convocatorias archivadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
