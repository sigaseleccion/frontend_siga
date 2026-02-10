"use client";

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  confirmAlert,
  errorAlert,
  successAlert,
} from "../../../shared/components/ui/SweetAlert";
import {
  Eye,
  Search,
  Users,
  Archive,
  History,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/shared/hooks/useToast";
import { convocatoriaService } from "@/features/Convocatorias/services/convocatoriaService";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { pruebaSeleccionService } from "@/features/Convocatorias/services/pruebaSeleccionService";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import Spinner from "../../../shared/components/ui/Spinner";

export default function SeleccionPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  // Eliminado diálogo local; se usa SweetAlert para confirmación de archivado

  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Selección",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  // Duración mínima del loader en milisegundos. Aumenta este valor para más segundos.
  const MIN_LOADER_MS = 300;
  useEffect(() => {
    if (searchParams.get("aprobado") === "true") {
      const nombre = searchParams.get("nombre") || "el aprendiz";
      toast({
        title: "Aprendiz aprobado con exito",
        description: `${nombre} ha pasado a estado "en seguimiento"`,
        className: "bg-green-600 text-white border-green-700",
        duration: 5000,
      });
      window.history.replaceState({}, "", "/seleccion");
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const loadData = async () => {
      const start = Date.now();
      try {
        setLoading(true);
        setError(null);
        const convs = await convocatoriaService.obtenerConvocatorias();
        const enriched = await Promise.all(
          convs.map(async (conv) => {
            const aprendices =
              await aprendizService.obtenerAprendicesPorConvocatoria(conv._id);
            const seleccionados = aprendices.filter((a) =>
              ["seleccion2", "lectiva", "productiva", "finalizado"].includes(
                a.etapaActual,
              ),
            );
            let aprobadas = 0;
            let totalPruebasPendientes = 0;
            for (const a of seleccionados) {
              if (a.pruebaSeleccionId) {
                try {
                  const pruebas =
                    await pruebaSeleccionService.obtenerPorAprendiz(a._id);
                  const ps = Array.isArray(pruebas) ? pruebas[0] : null;
                  if (ps) {
                    totalPruebasPendientes += [
                      "pruebaPsicologica",
                      "pruebaTecnica",
                      "examenesMedicos",
                    ].filter((k) => ps[k] === "pendiente").length;
                    aprobadas += [
                      "pruebaPsicologica",
                      "pruebaTecnica",
                      "examenesMedicos",
                    ].filter((k) => ps[k] === "aprobado").length;
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
            return {
              id: conv._id,
              idConvocatoria: conv.idConvocatoria,
              nombreConvocatoria: conv.nombreConvocatoria,
              programa: conv.programa,
              nivelFormacion: conv.nivelFormacion,
              fechaCreacion: conv.fechaCreacion,
              totalAprendices: seleccionados.length,
              aprendicesConPruebasCompletas: aprobadas,
              totalPruebasPendientes,
            };
          }),
        );
        setConvocatorias(enriched);
      } catch (e) {
        setError(e.message);
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    };
    loadData();
  }, []);

  const getNivelFormacionLabel = (nivel) => {
    const labels = {
      tecnica: "Tecnica",
      tecnologia: "Tecnologia",
      profesional: "Profesional",
    };
    return labels[nivel];
  };

  const filteredConvocatorias = convocatorias.filter((conv) =>
    conv.nombreConvocatoria.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleArchiveClick = async (convocatoria) => {
    const result = await confirmAlert({
      title: "Archivar Convocatoria",
      text:
        `¿Desea archivar la convocatoria "${convocatoria.nombreConvocatoria}"? Este proceso es irreversible.`,
      confirmText: "Sí, archivar",
      cancelText: "Cancelar",
      icon: "warning",
    });
    if (!result.isConfirmed) return;
    try {
      await convocatoriaService.archivarConvocatoria(convocatoria.id);
      setConvocatorias(
        convocatorias.filter((c) => c.id !== convocatoria.id),
      );
      await successAlert({
        title: "Convocatoria archivada",
        text: "La convocatoria se ha archivado correctamente.",
      });
    } catch (e) {
      setError(e.message);
      await errorAlert({
        title: "Error al archivar",
        text: "No se pudo archivar la convocatoria.",
      });
    }
  };

  // Mantener función vacía por compatibilidad antigua eliminada

  const isPruebasCompletas = (conv) => {
    return conv.aprendicesConPruebasCompletas > 0 && conv.totalAprendices > 0;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar convocatoria por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 w-full"
            />
          </div>
          <Link to="/seleccion/historico">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              Historico
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="mb-8 flex items-center justify-center py-10">
            <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
              <Spinner />
              <span className="text-gray-700 font-medium">Cargando...</span>
            </div>
          </div>
        )}
        {error && (
          <Card className="mb-4">
            <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredConvocatorias.map((convocatoria) => (
              <Card
                key={convocatoria.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge>
                      {getNivelFormacionLabel(convocatoria.nivelFormacion)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {convocatoria.idConvocatoria || convocatoria.id}
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    {convocatoria.nombreConvocatoria}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {convocatoria.totalAprendices} aprendices asociados
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {convocatoria.aprendicesConPruebasCompletas}/
                        {convocatoria.totalAprendices * 3 || 0} pruebas
                        aprobadas
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creada:{" "}
                      {new Date(convocatoria.fechaCreacion).toLocaleDateString(
                        "es-ES",
                      )}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link to={`/seleccion/${convocatoria.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Aprendices
                    </Button>
                  </Link>
                  {isPruebasCompletas(convocatoria) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => handleArchiveClick(convocatoria)}
                      title="Archivar convocatoria"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredConvocatorias.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No se encontraron convocatorias con ese nombre
              </p>
            </CardContent>
          </Card>
        )}

        
      </div>
    </main>
  );
}
