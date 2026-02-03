'use client';

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

// Mapeo de columnas del Excel
const COLUMN_MAPPING = [
  { column: 'A', field: 'nombre' },
  { column: 'B', field: 'tipoDocumento' },
  { column: 'C', field: 'documento' },
  { column: 'D', field: 'ciudad' },
  { column: 'E', field: 'direccion' },
  { column: 'F', field: 'telefono' },
  { column: 'G', field: 'correo' },
  { column: 'H', field: 'fechaInicioLectiva' },
  { column: 'I', field: 'fechaFinLectiva' },
  { column: 'J', field: 'fechaInicioProductiva' },
  { column: 'K', field: 'fechaFinProductiva' },
];

// Limite de aprendices
const MAX_APRENDICES = 30;
const START_ROW = 2; // Fila donde inician los datos (después del encabezado)
const END_ROW = 31; // Última fila permitida

// Función para parsear fecha de Excel
const parseExcelDate = (value) => {
  if (!value) return null;
  
  // Si es un número (formato de fecha de Excel)
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
    }
  }
  
  // Si es string, intentar parsear
  if (typeof value === 'string') {
    const dateStr = value.trim();
    // Formato DD/MM/YYYY
    const dmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
    // Formato YYYY-MM-DD
    const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      return dateStr;
    }
  }
  
  return null;
};

// Función para validar tipo de documento
const validarTipoDocumento = (value) => {
  const tiposValidos = ['CC', 'CE', 'TI', 'PPT', 'PEP'];
  const valorUpper = String(value || '').toUpperCase().trim();
  return tiposValidos.includes(valorUpper) ? valorUpper : 'CC';
};

export const useExcelParser = () => {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);

  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      setParsing(true);
      setError(null);

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          // Obtener la primera hoja
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const aprendices = [];

          // Procesar filas desde START_ROW hasta END_ROW (máximo 30 aprendices)
          for (let row = START_ROW; row <= END_ROW && aprendices.length < MAX_APRENDICES; row++) {
            const aprendiz = {};
            let hasData = false;

            // Procesar cada columna según el mapeo
            COLUMN_MAPPING.forEach(({ column, field }) => {
              const cellAddress = `${column}${row}`;
              const cell = worksheet[cellAddress];
              let value = cell ? cell.v : null;

              // Procesar según el tipo de campo
              if (field === 'tipoDocumento') {
                value = validarTipoDocumento(value);
              } else if (field.includes('fecha')) {
                value = parseExcelDate(value);
              } else if (value !== null && value !== undefined) {
                value = String(value).trim();
              }

              if (value !== null && value !== undefined && value !== '') {
                hasData = true;
              }

              aprendiz[field] = value;
            });

            // Solo agregar si tiene al menos nombre y documento
            if (hasData && aprendiz.nombre && aprendiz.documento) {
              aprendices.push(aprendiz);
            }
          }

          setParsing(false);
          resolve(aprendices);
        } catch (err) {
          setParsing(false);
          const errorMsg = 'Error al procesar el archivo Excel';
          setError(errorMsg);
          reject(new Error(errorMsg));
        }
      };

      reader.onerror = () => {
        setParsing(false);
        const errorMsg = 'Error al leer el archivo';
        setError(errorMsg);
        reject(new Error(errorMsg));
      };

      reader.readAsArrayBuffer(file);
    });
  }, []);

  return { parseExcel, parsing, error };
};
