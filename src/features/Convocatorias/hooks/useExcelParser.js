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
  if (!value && value !== 0) return null;
  
  // Si es un número (formato de fecha de Excel)
  if (typeof value === 'number') {
    try {
      // Excel comienza a contar desde 1 de enero de 1900
      // Número 1 = 1 de enero de 1900
      // Número 44197 = 16 de diciembre de 2020
      const excelDate = value;
      const date = new Date((excelDate - 25569) * 86400 * 1000); // 25569 es el offset entre epoch de Excel y Unix
      
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (err) {
      console.warn('Error parseando fecha Excel:', err);
      return null;
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
    // Formato MM/DD/YYYY (a veces Excel lo interpreta así)
    const altDmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (altDmyMatch) {
      // Intentar determinar si es DD/MM o MM/DD
      const day = parseInt(altDmyMatch[1], 10);
      const month = parseInt(altDmyMatch[2], 10);
      if (day > 12 && month <= 12) {
        // Es DD/MM
        return `${altDmyMatch[3]}-${altDmyMatch[2].padStart(2, '0')}-${altDmyMatch[1].padStart(2, '0')}`;
      } else if (month > 12 && day <= 12) {
        // Es MM/DD
        return `${altDmyMatch[3]}-${altDmyMatch[1].padStart(2, '0')}-${altDmyMatch[2].padStart(2, '0')}`;
      }
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
          // cellDates: true preserva las fechas como números de Excel
          const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellFormula: false });
          
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

              // Si la celda tiene formato de fecha, intentar parsear
              if (field.includes('fecha') && cell && cell.t === 'd') {
                // Es una fecha (type 'd')
                value = cell.v instanceof Date ? cell.v.toISOString().split('T')[0] : parseExcelDate(cell.v);
              } else if (field.includes('fecha')) {
                // Parsear como fecha en cualquier caso
                value = parseExcelDate(value);
              } else if (field === 'tipoDocumento') {
                value = validarTipoDocumento(value);
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
          console.warn(err);
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
