import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { ArrowLeft, Search, Eye } from 'lucide-react';
import { useHistorico } from '../hooks/useHistorico';
import { AprendizDetailModal } from '../componentes';
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { DataTable } from "@/shared/components/DataTable";

const HistoricoAprendicesPage = () => {
  const navigate = useNavigate();
  const {
    aprendices,
    loading,
    actualizarFiltros,
  } = useHistorico();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAprendiz, setSelectedAprendiz] = useState(null);
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Histórico de Aprendices",
      icon: null,
      iconBg: "from-gray-600 to-gray-400",
    });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    actualizarFiltros({ busqueda: value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const handleVerAprendiz = (aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setIsDetailOpen(true);
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          {/* Header con botón de retorno */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/seguimiento")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={18} />
              Volver a Seguimiento
            </Button>
            
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, documento, ciudad o programa..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
          </div>

          {/* Tabla de Aprendices Finalizados */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Registro de Aprendices Finalizados
              </h2>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando histórico...</p>
                  </div>
                ) : aprendices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No hay aprendices finalizados</p>
                  </div>
                ) : (
                  <DataTable
                    columns={[
                      { key: "nombre", header: "Nombre" },
                      { key: "tipoDocumento", header: "Tipo Doc." },
                      { key: "documento", header: "N. Documento" },
                      { key: "ciudad", header: "Ciudad" },
                      {
                        key: "programaFormacion",
                        header: "Programa",
                        render: (value, row) => (
                          <span className="text-sm text-gray-600">
                            {row.programaFormacion || row.programa || "-"}
                          </span>
                        ),
                      },
                      {
                        key: "fechaInicioContrato",
                        header: "Inicio Contrato",
                        render: (value) => <span>{formatDate(value)}</span>,
                      },
                      {
                        key: "fechaInicioProductiva",
                        header: "Inicio Productiva",
                        render: (value) => <span>{formatDate(value)}</span>,
                      },
                      {
                        key: "fechaFinContrato",
                        header: "Fin Contrato",
                        render: (value) => <span>{formatDate(value)}</span>,
                      },
                      {
                        key: "acciones",
                        header: "Acciones",
                        render: (value, row) => (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerAprendiz(row)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2"
                          >
                            <Eye size={16} />
                          </Button>
                        ),
                      },
                    ]}
                    data={aprendices}
                    pageSize={5}
                    pageSizeOptions={[5, 10, 20]}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Detalle (Solo lectura) */}
      <AprendizDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        aprendiz={selectedAprendiz}
      />
    </>
  );
};

export default HistoricoAprendicesPage;
