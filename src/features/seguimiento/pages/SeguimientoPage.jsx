import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Search,
  BookOpen,
  Briefcase,
  Users,
  Edit2,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  PenBoxIcon,
} from "lucide-react";
import { useSeguimiento } from "../hooks/useSeguimiento";
import {
  EditCuotaModal,
  AprendicesIncompletosModal,
  AprendizDetailModal,
  EditAprendizModal,
} from "../componentes";
import Spinner from "@/shared/components/ui/Spinner";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { tienePermiso } from "../../../shared/utils/auth/permissions";
import { useAuth } from "../../../shared/contexts/auth/AuthContext";
import { DataTable } from "../../../shared/components/DataTable";

const SeguimientoPage = () => {
  const navigate = useNavigate();
  const {
    aprendices,
    estadisticas,
    loading,
    filtros,
    actualizarFiltros,
    refetch,
    refetchEstadisticas,
  } = useSeguimiento();

  const [searchTerm, setSearchTerm] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("todas");
  const [isEditCuotaOpen, setIsEditCuotaOpen] = useState(false);
  const [isIncompletosOpen, setIsIncompletosOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAprendiz, setSelectedAprendiz] = useState(null);
  const { setHeaderConfig } = useHeader();
  const { auth } = useAuth();

  // La cuota solo se puede editar en los primeros 15 días del mes
  const esPeriodoEdicionCuota = new Date().getDate() <= 15;

  useEffect(() => {
    setHeaderConfig({
      title: "Seguimiento",
      icon: TrendingUp,
      iconBg: "from-blue-600 to-blue-400",
    });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    actualizarFiltros({ busqueda: value });
  };

  const handleEtapaChange = (value) => {
    setEtapaFilter(value);
    actualizarFiltros({ etapa: value === "todas" ? "" : value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    // Extraer solo la parte de fecha sin conversión de timezone
    const datePart = dateString.split("T")[0]; // "2026-02-20"
    const [year, month, day] = datePart.split("-");

    // Formatear manualmente en formato español dd/mm/yyyy
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return "-";
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diferencia = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const getEtapaBadgeStyle = (etapa) => {
    switch (etapa) {
      case "lectiva":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "productiva":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "finalizado":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const getEtapaIcon = (etapa) => {
    switch (etapa) {
      case "lectiva":
        return <BookOpen size={12} className="mr-1" />;
      case "productiva":
        return <Briefcase size={12} className="mr-1" />;
      default:
        return null;
    }
  };

  const handleVerAprendiz = (aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setIsDetailOpen(true);
  };

  const handleEditarAprendiz = (aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          {/* Search and Filter */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            {/* Buscador */}
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar aprendiz..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Select value={etapaFilter} onValueChange={handleEtapaChange}>
                <SelectTrigger className="w-50 bg-white">
                  <SelectValue placeholder="Todas las etapas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las etapas</SelectItem>
                  <SelectItem value="lectiva">Etapa Lectiva</SelectItem>
                  <SelectItem value="productiva">Etapa Productiva</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => navigate("/seguimiento/historico")}
                className="flex items-center gap-2"
              >
                <History size={18} />
                Histórico
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* En Etapa Lectiva */}
            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      En Etapa Lectiva
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {estadisticas.enEtapaLectiva}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* En Etapa Productiva */}
            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      En Etapa Productiva
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {estadisticas.enEtapaProductiva}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cuota de Aprendices */}
            <Card variant="colorful" showTopLine>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Cuota de Aprendices
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas.cuota === null
                        ? "Aprendices"
                        : `Aprendices ${estadisticas.cuota.actual}/${estadisticas.cuota.maximo}`}
                    </p>
                    {/* Estado de la cuota */}
                    {estadisticas.cuota !== null &&
                      (() => {
                        const actual = estadisticas.cuota.actual;
                        const maximo = estadisticas.cuota.maximo;
                        const diferencia = maximo - actual;

                        if (actual < maximo) {
                          // Cuota NO cumplida
                          return (
                            <div className="flex items-center gap-1.5 text-amber-600 text-sm mt-2">
                              <AlertTriangle size={14} />
                              <span>
                                Faltan {diferencia} aprendices para cumplir la
                                cuota
                              </span>
                            </div>
                          );
                        } else if (actual === maximo) {
                          // Cuota CUMPLIDA
                          return (
                            <div className="flex items-center gap-1.5 text-green-600 text-sm mt-2">
                              <CheckCircle size={14} />
                              <span>Cuota cumplida</span>
                            </div>
                          );
                        } else {
                          // Cuota EXCEDIDA
                          const exceso = actual - maximo;
                          return (
                            <div className="flex items-center gap-1.5 text-red-600 text-sm mt-2">
                              <TrendingUp size={14} />
                              <span>Cuota excedida (+{exceso})</span>
                            </div>
                          );
                        }
                      })()}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Users className="text-purple-600" size={24} />
                    </div>
                    {tienePermiso(auth, "seguimiento", "editar") &&
                      (esPeriodoEdicionCuota ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditCuotaOpen(true)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <PenBoxIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          title="La cuota solo puede editarse durante los primeros 15 días del mes"
                          className="text-gray-600 cursor-not-allowed"
                        >
                          <PenBoxIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aprendices Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Listado de Aprendices
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
                      key: "nombreCompleto",
                      header: "Nombre",
                      render: (_, row) => (
                        <span className="font-medium text-gray-900">
                          {row.nombre} {row.apellido}
                        </span>
                      ),
                    },
                    {
                      key: "etapaActual",
                      header: "Etapa",
                      render: (value) => (
                        <Badge
                          className={`${getEtapaBadgeStyle(
                            value,
                          )} rounded-full px-3 py-1 text-xs font-medium flex items-center w-fit`}
                        >
                          {getEtapaIcon(value)}
                          {value === "lectiva"
                            ? "Lectiva"
                            : value === "productiva"
                              ? "Productiva"
                              : "Finalizado"}
                        </Badge>
                      ),
                    },
                    {
                      key: "programaFormacion",
                      header: "Programa",
                      render: (value, row) => value || row.programa || "-",
                    },
                    {
                      key: "ciudad",
                      header: "Ciudad",
                      render: (value) => value || "-",
                    },
                    {
                      key: "fechaInicioContrato",
                      header: "Inicio Contrato",
                      render: (value) => formatDate(value),
                    },
                    {
                      key: "fechaInicioProductiva",
                      header: "Inicio Productiva",
                      render: (value) => formatDate(value),
                    },
                    {
                      key: "fechaFinContrato",
                      header: "Fin Contrato",
                      render: (value) => formatDate(value),
                    },
                    {
                      key: "reemplazoId",
                      header: "Reemplazo",
                      render: (value) =>
                        value ? (
                          <span className="inline-flex items-center rounded-full text-blue-700 px-3 py-1 text-xs font-medium">
                            {value.nombre} {value.documento || ""}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        ),
                    },
                    {
                      key: "diasRestantes",
                      header: "Días Restantes",
                      render: (_, row) => {
                        const fechaReferencia =
                          row.etapaActual === "lectiva"
                            ? row.fechaInicioProductiva
                            : row.fechaFinContrato;

                        const diasRestantes =
                          calcularDiasRestantes(fechaReferencia);

                        return (
                          <span
                            className={
                              diasRestantes < 0
                                ? "text-red-600"
                                : diasRestantes <= 30
                                  ? "text-amber-600"
                                  : "text-gray-600"
                            }
                          >
                            {diasRestantes !== "-"
                              ? `${diasRestantes} dias`
                              : "-"}
                          </span>
                        );
                      },
                    },
                    {
                      key: "_id",
                      header: "Acciones",
                      render: (_, row) => (
                        <div className="flex items-center gap-1">
                          {tienePermiso(auth, "seguimiento", "ver") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerAprendiz(row)}
                              className="h-9 w-9 rounded-xl text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-200"
                            >
                              <Eye size={20} />
                            </Button>
                          )}
                          {tienePermiso(auth, "seguimiento", "editar") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarAprendiz(row)}
                              className="h-9 w-9 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            >
                              <PenBoxIcon size={16} />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={aprendices}
                  pageSize={5}
                  emptyMessage="No hay aprendices en seguimiento"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <EditCuotaModal
        open={isEditCuotaOpen}
        onOpenChange={setIsEditCuotaOpen}
        cuotaActual={estadisticas.cuota}
        onSuccess={refetchEstadisticas}
      />

      <AprendicesIncompletosModal
        open={isIncompletosOpen}
        onOpenChange={setIsIncompletosOpen}
      />

      <AprendizDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        aprendiz={selectedAprendiz}
      />

      <EditAprendizModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        aprendiz={selectedAprendiz}
        onSuccess={() => {
          refetch();
          refetchEstadisticas();
        }}
      />
    </>
  );
};

export default SeguimientoPage;
