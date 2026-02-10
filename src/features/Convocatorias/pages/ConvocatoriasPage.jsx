"use client";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../../shared/components/ui/SweetAlert";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Upload, PenBoxIcon, Search, Loader2, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useConvocatorias } from "../hooks/useConvocatorias";
import { CreateConvocatoriaModal } from "../components/CreateConvocatoriaModal";
import Header from "../../../shared/components/Header";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import Spinner from "../../../shared/components/ui/Spinner";

export default function ConvocatoriasPage() {
  const { convocatorias, loading, error, crearConvocatoria } =
    useConvocatorias();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [searchNombre, setSearchNombre] = useState("");
  const [filterNivel, setFilterNivel] = useState("todas");
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Convocatorias",
      icon: Users,
      iconBg: "from-blue-600 to-blue-400",
    });
  }, []);

  const handleCreateConvocatoria = async (convocatoriaData, aprendices) => {
    setCreating(true);
    try {
      await crearConvocatoria(convocatoriaData, aprendices);
      setIsModalOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const getNivelFormacionLabel = (nivel) => {
    const labels = {
      tecnica: "Tecnica",
      tecnologia: "Tecnologia",
      profesional: "Profesional",
    };
    return labels[nivel] || nivel;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES");
    } catch {
      return dateStr;
    }
  };

  const filteredConvocatorias = convocatorias.filter((conv) => {
    const matchesNombre = conv.nombreConvocatoria
      .toLowerCase()
      .includes(searchNombre.toLowerCase());
    const matchesNivel =
      filterNivel === "todas" || conv.nivelFormacion === filterNivel;
    return matchesNombre && matchesNivel;
  });

  return (
    <div>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            {/* Buscador */}
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de convocatoria..."
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
                className="pl-10 bg-white border-gray-200 w-full"
              />
            </div>

            {/* Grupo: filtro + botón */}
            <div className="flex items-center gap-3 ml-auto">
              <Select
                value={filterNivel}
                onValueChange={(v) => setFilterNivel(v)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Nivel de formación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los niveles</SelectItem>
                  <SelectItem value="tecnica">Técnica</SelectItem>
                  <SelectItem value="tecnologia">Tecnología</SelectItem>
                  <SelectItem value="profesional">Profesional</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setIsModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Crear convocatoria
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Listado de Convocatorias
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
                    <Spinner />
                    <span className="text-gray-700 font-medium">
                      Cargando...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          ID Convocatoria
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Nombre Convocatoria
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Programa
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Nivel Formacion
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Fecha Creacion
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Total Aprendices
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConvocatorias.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-gray-500"
                          >
                            No hay convocatorias registradas
                          </td>
                        </tr>
                      ) : (
                        filteredConvocatorias.map((conv) => (
                          <tr
                            key={conv._id || conv.idConvocatoria}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4 text-sm font-medium text-gray-900">
                              {conv.idConvocatoria}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {conv.nombreConvocatoria}
                            </td>
                            <td
                              className="py-4 px-4 text-sm text-gray-600 max-w-[200px] truncate"
                              title={conv.programa}
                            >
                              {conv.programa}
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                variant="outline"
                                className="border-gray-300 bg-transparent text-gray-700 hover:bg-transparent rounded-full px-3 py-1 text-xs font-medium"
                              >
                                {getNivelFormacionLabel(conv.nivelFormacion)}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {formatDate(conv.fechaCreacion)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {conv.totalAprendices}
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  conv.estado === "en proceso"
                                    ? "bg-blue-600 text-white hover:bg-blue-600"
                                    : "bg-pink-500 text-white hover:bg-pink-500"
                                }`}
                              >
                                {conv.estado}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Link to={`/convocatorias/${conv._id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                  <PenBoxIcon className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <CreateConvocatoriaModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSubmit={handleCreateConvocatoria}
            loading={creating}
          />
        </div>
      </main>
    </div>
  );
}
