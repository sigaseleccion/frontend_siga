'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DataTable - Componente reutilizable de tabla con paginación
 * @param {Object} props
 * @param {Array} props.columns - Array de objetos con la estructura: { key: string, header: string, render?: function }
 * @param {Array} props.data - Array de datos a mostrar
 * @param {number} props.pageSize - Elementos por página (default: 5)
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {function} props.rowClassName - Función para aplicar clases dinámicas a las filas
 */
export function DataTable({
  columns = [],
  data = [],
  pageSize = 5,
  emptyMessage = "No hay datos disponibles",
  rowClassName,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular datos paginados
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  // Navegación
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Resetear página cuando cambia el total de páginas
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((row, index) => {
                const rowClass = rowClassName
                  ? rowClassName(row, index)
                  : "border-b border-gray-100 last:border-0 hover:bg-gray-50";
                return (
                  <tr key={row._id || row.id || index} className={rowClass}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="py-4 px-4 text-sm text-gray-600"
                      >
                        {column.render
                          ? column.render(row[column.key], row, index)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, data.length)} de {data.length} registros
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Mostrar solo algunas páginas
                  if (
                    totalPages <= 7 ||
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 py-1 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                },
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
