// import React from "react";

// const HistoricoAprendicesPage = () => {
//   return (
//     <h1>Historico de aprendices</h1>
//   );
// };

// export default HistoricoAprendicesPage;

'use client';

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { ArrowLeft, Search, Eye } from 'lucide-react';
import { useHistorico } from '../hooks/useHistorico';
import { AprendizDetailModal } from '../componentes';
import { useHeader } from "../../../shared/contexts/HeaderContext";

const HistoricoAprendicesPage = () => {
  const navigate = useNavigate();
  const {
    aprendices,
    loading,
    filtros,
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
              variant="ghost"
              onClick={() => navigate("/seguimiento")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={18} />
              Volver a Seguimiento
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Aprendices</h1>
            <p className="text-sm text-gray-600 mt-1">
              Registro de aprendices que culminaron su proceso productivo
            </p>
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
                    <p className="text-gray-600">
                      No hay aprendices finalizados
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tipo Doc.
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          N. Documento
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ciudad
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Programa
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Inicio Contrato
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Inicio Productiva
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Fin Contrato
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aprendices.map((aprendiz) => (
                        <tr
                          key={aprendiz._id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {aprendiz.nombre}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {aprendiz.tipoDocumento || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {aprendiz.documento || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {aprendiz.ciudad || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {aprendiz.programaFormacion || aprendiz.programa || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(aprendiz.fechaInicioContrato)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(aprendiz.fechaInicioProductiva)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(aprendiz.fechaFinContrato)}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerAprendiz(aprendiz)}
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2"
                            >
                              <Eye size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
