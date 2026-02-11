"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ArrowLeft,
  Upload,
  FileUp,
  FileText,
  X,
  File,
  CheckSquare,
} from "lucide-react";
import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
import { convocatoriaService } from "@/features/Convocatorias/services/convocatoriaService";
import { pruebaSeleccionService } from "@/features/Convocatorias/services/pruebaSeleccionService";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../../shared/components/ui/SweetAlert";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { getNivelFormacionLabel } from "@/shared/utils/nivelFormacion";
import { DataTable } from "@/shared/components/DataTable";

export default function ReporteTecnicoPage() {
  const { id: convocatoriaId } = useParams();
  const navigate = useNavigate();

  const [reporteFile, setReporteFile] = useState(null);
  const [tab, setTab] = useState("adjuntar");
 

  const [aprendices, setAprendices] = useState([]);
  const [error, setError] = useState(null);
  const [convocatoria, setConvocatoria] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingEstados, setSavingEstados] = useState(false);
  const [originalEstados, setOriginalEstados] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const hasUnsavedChanges =
    Object.keys(pendingChanges).length > 0 || Boolean(reporteFile);
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Reporte Técnico",
      icon: CheckSquare,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const conv =
          await convocatoriaService.obtenerConvocatoriaPorId(convocatoriaId);
        setConvocatoria(conv);
        const aps =
          await aprendizService.obtenerAprendicesPorConvocatoria(
            convocatoriaId,
          );
        const seleccionados = aps.filter((a) => a.etapaActual === "seleccion2");
        const base = seleccionados.map((a) => ({
          id: a._id,
          _id: a._id,
          nombre: a.nombre,
          tipoDocumento: a.tipoDocumento,
          documento: a.documento,
          pruebaTecnica: "pendiente",
          pruebaSeleccionId: a.pruebaSeleccionId || null,
        }));
        const withEstados = await Promise.all(
          base.map(async (a) => {
            if (a.pruebaSeleccionId) {
              try {
                const ps = await pruebaSeleccionService.obtenerPorId(
                  a.pruebaSeleccionId,
                );
                return { ...a, pruebaTecnica: ps.pruebaTecnica || "pendiente" };
              } catch {
                return a;
              }
            }
            return a;
          }),
        );
        setAprendices(withEstados);
        const original = {};
        withEstados.forEach((a) => {
          original[a.id] = a.pruebaTecnica;
        });
        setOriginalEstados(original);
        setPendingChanges({});
      } catch (e) {
        setError(e.message);
      }
    };
    loadData();
  }, [convocatoriaId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/pdf",
      ];
      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".pdf")
      ) {
        const isReplacement =
          Boolean(convocatoria?.reporteTecnico) || Boolean(reporteFile);
        if (isReplacement) {
          const result = await confirmAlert({
            title: "Reemplazar archivo",
            text: "¿Desea reemplazar el archivo existente por el nuevo?",
            confirmText: "Sí, reemplazar",
            cancelText: "Cancelar",
            icon: "warning",
          });
          if (!result.isConfirmed) return;
        }
        setReporteFile(file);
      } else {
        warningAlert({
          title: "Formato inválido",
          text: "Solo se permiten archivos Excel (.xlsx, .xls) o PDF.",
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setReporteFile(null);
  };

  const handleGuardarReporte = async () => {
    if (!reporteFile) return;
    try {
      setUploading(true);
      setError(null);
      const updated = await convocatoriaService.subirReporteTecnico(
        convocatoriaId,
        reporteFile,
      );
      setConvocatoria(updated);
      setReporteFile(null);
      await successAlert({
        title: "Reporte técnico guardado",
        text: "El reporte técnico se ha guardado correctamente.",
      });
    } catch (e) {
      setError(e.message);
      await errorAlert({
        title: "Error al guardar",
        text: "No se pudo guardar el reporte técnico.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePruebaTecnicaChange = (aprendizId, estado) => {
    setAprendices((prev) =>
      prev.map((a) =>
        a.id === aprendizId ? { ...a, pruebaTecnica: estado } : a,
      ),
    );
    setPendingChanges((prev) => ({ ...prev, [aprendizId]: estado }));
  };

  const handleGuardarEstados = async () => {
    const ids = Object.keys(pendingChanges);
    if (ids.length === 0) {
      await warningAlert({
        title: "Sin cambios",
        text: "No hay cambios por guardar en estados de prueba técnica.",
      });
      return;
    }
    try {
      setSavingEstados(true);
      setError(null);
      const updates = ids.map((id) => {
        const target = aprendices.find((a) => a.id === id);
        if (target && target.pruebaSeleccionId) {
          return pruebaSeleccionService.actualizarPrueba(
            target.pruebaSeleccionId,
            {
              pruebaTecnica: pendingChanges[id],
            },
          );
        }
        return Promise.resolve();
      });
      const results = await Promise.allSettled(updates);
      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length > 0) {
        await errorAlert({
          title: "Error al guardar",
          text: "Algunos estados no se pudieron guardar.",
        });
      } else {
        await successAlert({
          title: "Estados guardados",
          text: "Los estados de prueba técnica se guardaron correctamente.",
        });
      }
      const newOriginal = { ...originalEstados };
      ids.forEach((id) => {
        newOriginal[id] = pendingChanges[id];
      });
      setOriginalEstados(newOriginal);
      setPendingChanges({});
    } catch (e) {
      setError(e.message);
      await errorAlert({
        title: "Error al guardar",
        text: "Ocurrió un error al guardar los estados.",
      });
    } finally {
      setSavingEstados(false);
    }
  };

  const getFileIcon = () => {
    if (!reporteFile) return null;
    if (reporteFile.name.endsWith(".pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-green-600" />;
  };

  const handleBack = async (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      const result = await confirmAlert({
        title: "Cambios sin guardar",
        text: "Tiene cambios sin guardar. ¿Desea salir sin guardar?",
        confirmText: "Salir sin guardar",
        cancelText: "Cancelar",
        icon: "warning",
      });
      if (result.isConfirmed) {
        navigate(`/seleccion/${convocatoriaId}`);
      }
    }
  };

  return (
    <div>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          {error && (
            <Card className="mb-4">
              <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
                {error}
              </CardContent>
            </Card>
          )}
          <div className="mb-6">
            <Link to={`/seleccion/${convocatoriaId}`} onClick={handleBack}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Convocatoria
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-3xl font-bold text-foreground">
                {convocatoria?.nombreConvocatoria || "-"}
              </h1>
              <Badge>{getNivelFormacionLabel(convocatoria?.nivelFormacion)}</Badge>
            </div>
          </div>

          <Tabs
            value={tab}
            onValueChange={(value) => {
              if (
                value === "estado" &&
                !(reporteFile || convocatoria?.reporteTecnico)
              ) {
                warningAlert({
                  title: "Acceso restringido",
                  text: "Debe adjuntar un reporte técnico antes de acceder a Estado Aprendices.",
                });
                return;
              }
              setTab(value);
            }}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="adjuntar">Adjuntar Reporte</TabsTrigger>
              <TabsTrigger value="estado">Estado Aprendices</TabsTrigger>
            </TabsList>

            <TabsContent value="adjuntar">
              <Card>
                <CardHeader>
                  <CardTitle>Adjuntar reporte técnico</CardTitle>
                </CardHeader>
                <CardContent>
                  {convocatoria?.reporteTecnico && !reporteFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            Archivo actual
                          </p>
                          <a
                            href={convocatoria.reporteTecnico.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            Ver archivo
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="reporte-replace"
                          className="hidden"
                          accept=".xlsx,.xls,.pdf"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="reporte-replace">
                          <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="bg-transparent"
                          >
                            <span className="cursor-pointer">
                              <Upload className="mr-2 h-4 w-4" />
                              Reemplazar archivo
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : reporteFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                        {getFileIcon()}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {reporteFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(reporteFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="reporte-replace"
                          className="hidden"
                          accept=".xlsx,.xls,.pdf"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="reporte-replace">
                          <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="bg-transparent"
                          >
                            <span className="cursor-pointer">
                              <Upload className="mr-2 h-4 w-4" />
                              Reemplazar archivo
                            </span>
                          </Button>
                        </label>
                        <Button
                          onClick={handleGuardarReporte}
                          disabled={uploading}
                        >
                          {uploading ? "Subiendo..." : "Guardar"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="rounded-full bg-primary/10 p-6">
                        <FileUp className="h-12 w-12 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground mb-2">
                          No se ha adjuntado ningún reporte técnico
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos permitidos: Excel (.xlsx, .xls) o PDF
                        </p>
                      </div>
                      <input
                        type="file"
                        id="reporte-upload"
                        className="hidden"
                        accept=".xlsx,.xls,.pdf"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="reporte-upload">
                        <Button
                          type="button"
                          variant="outline"
                          asChild
                          className="bg-transparent"
                        >
                          <span className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Seleccionar archivo
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estado">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de prueba técnica por aprendiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={[
                      { key: "nombre", header: "Nombre" },
                      { key: "tipoDocumento", header: "Tipo Doc." },
                      { key: "documento", header: "N. Documento" },
                      {
                        key: "pruebaTecnica",
                        header: "P. Técnica",
                        render: (value, row) => (
                          <Select
                            value={row.pruebaTecnica}
                            onValueChange={(v) =>
                              handlePruebaTecnicaChange(row.id, v)
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="aprobado">Aprobado</SelectItem>
                              <SelectItem value="no aprobado">No aprobado</SelectItem>
                            </SelectContent>
                          </Select>
                        ),
                      },
                    ]}
                    data={aprendices}
                    pageSize={5}
                    pageSizeOptions={[5, 10, 20]}
                  />
 
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleGuardarEstados} disabled={savingEstados}>
                      {savingEstados ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
