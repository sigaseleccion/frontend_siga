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
import { DataTable } from "../../../shared/components/DataTable";
import { tienePermiso } from "../../../shared/utils/auth/permissions";
import { useAuth } from "../../../shared/contexts/auth/AuthContext";

export default function ConvocatoriasPage() {
  const { convocatorias, loading, error, crearConvocatoria } =
    useConvocatorias();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [searchNombre, setSearchNombre] = useState("");
  const [filterNivel, setFilterNivel] = useState("todas");
  const { setHeaderConfig } = useHeader();
  const { auth } = useAuth();

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
              {tienePermiso(auth, "convocatorias", "crear") && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Crear convocatoria
                </Button>
              )}
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
                <DataTable
                  columns={[
                    {
                      key: "idConvocatoria",
                      header: "ID Convocatoria",
                      render: (value) => (
                        <span className="font-medium text-gray-900">
                          {value}
                        </span>
                      ),
                    },
                    {
                      key: "nombreConvocatoria",
                      header: "Nombre Convocatoria",
                    },
                    {
                      key: "programa",
                      header: "Programa",
                      render: (value) => (
                        <span
                          className="max-w-[200px] truncate block"
                          title={value}
                        >
                          {value}
                        </span>
                      ),
                    },
                    {
                      key: "nivelFormacion",
                      header: "Nivel Formacion",
                      render: (value) => (
                        <Badge
                          variant="outline"
                          className="border-gray-300 bg-transparent text-gray-700 hover:bg-transparent rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {getNivelFormacionLabel(value)}
                        </Badge>
                      ),
                    },
                    {
                      key: "fechaCreacion",
                      header: "Fecha Creacion",
                      render: (value) => formatDate(value),
                    },
                    {
                      key: "totalAprendices",
                      header: "Total Aprendices",
                    },
                    {
                      key: "estado",
                      header: "Estado",
                      render: (value) => (
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            value === "en proceso"
                              ? "bg-blue-600 text-white hover:bg-blue-600"
                              : "bg-pink-500 text-white hover:bg-pink-500"
                          }`}
                        >
                          {value}
                        </Badge>
                      ),
                    },
                    {
                      key: "_id",
                      header: "Acciones",
                      render: (value) => (
                        <Link to={`/convocatorias/${value}`}>
                          {tienePermiso(auth, "convocatorias", "editar") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <PenBoxIcon className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
                        </Link>
                      ),
                    },
                  ]}
                  data={filteredConvocatorias}
                  pageSize={5}
                  emptyMessage="No hay convocatorias registradas"
                />
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
