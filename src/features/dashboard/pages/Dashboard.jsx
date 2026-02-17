import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Users,
  BookOpen,
  Briefcase,
  AlignEndHorizontal,
  RefreshCw,
  TrendingUp,
  ClipboardList,
  Target,
  CheckSquare,
  MapPin,
  CalendarClock,
  TestTubeDiagonal,
} from "lucide-react";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import Spinner from "@/shared/components/ui/Spinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getToken = () => {
  const direct = localStorage.getItem("token");
  if (direct) return direct;
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return typeof auth?.token === "string" ? auth.token : null;
  } catch {
    return null;
  }
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    let errorMessage = "Error al consultar el servidor";
    try {
      const error = await response.json();
      errorMessage = error?.message || errorMessage;
    } catch {
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export default function Dashboard() {
  const { setHeaderConfig } = useHeader();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bottomLoading, setBottomLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [data, setData] = useState({
    convocatoriasActivas: 0,
    convocatoriasArchivadas: 0,
    totalActivos: 0,
    enLectiva: 0,
    enProductiva: 0,
    cuota: 150,
    cuotaStatus: "ok",
    cuotaDelta: 0,
    urgentCount: 0,
    pruebasPendientes: 0,
    aprendicesIncompletos: 0,
    proximosVencimientos: [],
    ciudades: [],
    pruebas: {
      psicologica: { aprobados: 0, rechazados: 0, pendientes: 0 },
      tecnica: { aprobados: 0, rechazados: 0, pendientes: 0 },
      medica: { aprobados: 0, rechazados: 0, pendientes: 0 },
    },
  });

  useEffect(() => {
    setHeaderConfig({
      title: "Dashboard",
      icon: AlignEndHorizontal,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  const loadDashboard = async () => {
    const firstLoad = lastUpdatedAt === null;
    const startAt = Date.now();

    if (firstLoad) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMessage(null);

    const headers = getAuthHeaders();

    const [convocatoriasResult, convocatoriasArchivadasResult, estadisticasResult, seguimientoResult, pruebasResult] =
      await Promise.allSettled([
        fetchJson(`${API_URL}/api/convocatorias`, { method: "GET", headers }),
        fetchJson(`${API_URL}/api/convocatorias/archivadas`, { method: "GET", headers }),
        fetchJson(`${API_URL}/api/seguimiento/estadisticas`, { method: "GET", headers }),
        fetchJson(`${API_URL}/api/seguimiento`, { method: "GET", headers }),
        fetchJson(`${API_URL}/api/pruebas-seleccion`, { method: "GET", headers }),
      ]);

    const convocatorias =
      convocatoriasResult.status === "fulfilled" && Array.isArray(convocatoriasResult.value)
        ? convocatoriasResult.value
        : [];

    const convocatoriasArchivadas =
      convocatoriasArchivadasResult.status === "fulfilled" &&
      Array.isArray(convocatoriasArchivadasResult.value)
        ? convocatoriasArchivadasResult.value
        : [];

    const estadisticas =
      estadisticasResult.status === "fulfilled"
        ? estadisticasResult.value?.data || estadisticasResult.value
        : null;

    const aprendicesSeguimiento =
      seguimientoResult.status === "fulfilled" && Array.isArray(seguimientoResult.value?.value)
        ? seguimientoResult.value.value
        : Array.isArray(seguimientoResult.status === "fulfilled" ? seguimientoResult.value : null)
          ? seguimientoResult.value
          : [];

    const pruebas =
      pruebasResult.status === "fulfilled" && Array.isArray(pruebasResult.value)
        ? pruebasResult.value
        : [];

    if (
      convocatoriasResult.status === "rejected" &&
      convocatoriasArchivadasResult.status === "rejected" &&
      estadisticasResult.status === "rejected" &&
      seguimientoResult.status === "rejected" &&
      pruebasResult.status === "rejected"
    ) {
      setErrorMessage("No se pudieron cargar los datos del dashboard");
    }

    const convocatoriasActivas = convocatorias.length;
    const convocatoriasArchivadasCount =
      convocatoriasArchivadas.length > 0
        ? convocatoriasArchivadas.length
        : convocatorias.filter((c) => c?.archivada === true).length;

    const enLectiva = typeof estadisticas?.enLectiva === "number" ? estadisticas.enLectiva : 0;
    const enProductiva =
      typeof estadisticas?.enProductiva === "number" ? estadisticas.enProductiva : 0;
    const totalActivos =
      typeof estadisticas?.totalActivos === "number" ? estadisticas.totalActivos : enLectiva + enProductiva;

    const cuotaRaw = typeof estadisticas?.cuota === "number" ? estadisticas.cuota : null;
    const cuota = typeof cuotaRaw === "number" && cuotaRaw > 0 ? cuotaRaw : 150;
    const cuotaDelta = totalActivos - cuota;
    const cuotaStatus = cuotaDelta === 0 ? "ok" : cuotaDelta < 0 ? "under" : "over";

    const ciudadesMap = new Map();
    for (const a of aprendicesSeguimiento) {
      const ciudad = typeof a?.ciudad === "string" && a.ciudad.trim() ? a.ciudad.trim() : "Sin ciudad";
      ciudadesMap.set(ciudad, (ciudadesMap.get(ciudad) || 0) + 1);
    }
    const ciudades = Array.from(ciudadesMap.entries())
      .map(([ciudad, cantidad]) => ({ ciudad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
    const totalCiudades = ciudades.reduce((sum, c) => sum + c.cantidad, 0) || 1;
    const ciudadesWithPct = ciudades.map((c) => ({
      ...c,
      porcentaje: Math.round((c.cantidad / totalCiudades) * 100),
    }));

    const proximosVencimientos = aprendicesSeguimiento
      .filter((a) => typeof a?.diasRestantes === "number" && (a.diasRestantes >= 0 || a.diasRestantes === -1))
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 6)
      .map((a) => ({
        id: a?._id,
        nombre: a?.nombre || "Aprendiz",
        documento: a?.documento || "",
        dias: a?.diasRestantes,
        programa: a?.programaFormacion || "Sin programa",
        etapa: a?.etapaActual || "",
      }));

    const urgentCount = aprendicesSeguimiento.filter(
      (a) => typeof a?.diasRestantes === "number" && a.diasRestantes >= 0 && a.diasRestantes <= 7,
    ).length;

    const normalizeEstado = (value) => {
      if (typeof value !== "string") return "";
      return value.trim().toLowerCase();
    };

    const pruebasPendientes = pruebas.filter((p) =>
      [p?.pruebaPsicologica, p?.pruebaTecnica, p?.examenesMedicos].some(
        (v) => normalizeEstado(v) === "pendiente",
      ),
    ).length;

    const aprendicesIncompletos =
      typeof estadisticas?.aprendicesIncompletos === "number" ? estadisticas.aprendicesIncompletos : 0;

    const agg = {
      psicologica: { aprobados: 0, rechazados: 0, pendientes: 0 },
      tecnica: { aprobados: 0, rechazados: 0, pendientes: 0 },
      medica: { aprobados: 0, rechazados: 0, pendientes: 0 },
    };

    for (const p of pruebas) {
      const mapState = (value) => {
        const estado = normalizeEstado(value);
        if (estado === "aprobado") return "aprobados";
        if (estado === "rechazado" || estado === "no aprobado" || estado === "no_aprobado" || estado === "reprobado") {
          return "rechazados";
        }
        if (estado === "pendiente") return "pendientes";
        return null;
      };
      const ps = mapState(p?.pruebaPsicologica);
      const pt = mapState(p?.pruebaTecnica);
      const em = mapState(p?.examenesMedicos);
      if (ps) agg.psicologica[ps] += 1;
      if (pt) agg.tecnica[pt] += 1;
      if (em) agg.medica[em] += 1;
    }

    setData({
      convocatoriasActivas,
      convocatoriasArchivadas: convocatoriasArchivadasCount,
      totalActivos,
      enLectiva,
      enProductiva,
      cuota,
      cuotaStatus,
      cuotaDelta,
      urgentCount,
      pruebasPendientes,
      aprendicesIncompletos,
      proximosVencimientos,
      ciudades: ciudadesWithPct,
      pruebas: agg,
    });

    setLastUpdatedAt(new Date());

    const minVisibleMs = firstLoad ? 600 : 0;
    const elapsedMs = Date.now() - startAt;
    const remainingMs = Math.max(0, minVisibleMs - elapsedMs);
    if (remainingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingMs));
    }

    setIsRefreshing(false);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setBottomLoading(true);
    const t = setTimeout(() => setBottomLoading(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const cuotaBadge = useMemo(() => {
    if (data.cuotaStatus === "under") {
      return (
        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
          Cuota incompleta ({Math.abs(data.cuotaDelta)})
        </Badge>
      );
    }
    if (data.cuotaStatus === "over") {
      return (
        <Badge className="bg-fuchsia-600 text-white hover:bg-fuchsia-600">
          Cuota excedida (+{data.cuotaDelta})
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
        Cuota cumplida
      </Badge>
    );
  }, [data.cuotaStatus, data.cuotaDelta]);

  const pruebasSummary = useMemo(() => {
    const toPct = (obj) => {
      const total = obj.aprobados + obj.rechazados;
      if (total <= 0) return 0;
      return Math.round((obj.aprobados / total) * 100);
    };
    return [
      { key: "psicologica", label: "Psicológica", data: data.pruebas.psicologica, pct: toPct(data.pruebas.psicologica) },
      { key: "tecnica", label: "Técnica", data: data.pruebas.tecnica, pct: toPct(data.pruebas.tecnica) },
      { key: "medica", label: "Médicos", data: data.pruebas.medica, pct: toPct(data.pruebas.medica) },
    ];
  }, [data.pruebas]);

  const getDaysBadge = (dias, etapa) => {
    if (typeof dias !== "number") {
      return {
        variant: "secondary",
        className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        label: "—",
      };
    }

    if (dias < 0) {
      return { variant: "destructive", className: "", label: "Sin reemplazo" };
    }

    const isLectiva = String(etapa || "").toLowerCase().includes("lectiva");

    if (isLectiva) {
      if (dias <= 30) return { variant: "destructive", className: "", label: `${dias} días` };
      if (dias <= 62) {
        return {
          variant: "secondary",
          className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
          label: `${dias} días`,
        };
      }
    }

    if (dias <= 7) return { variant: "destructive", className: "", label: `${dias} días` };
    if (dias <= 30) {
      return {
        variant: "secondary",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        label: `${dias} días`,
      };
    }
    return {
      variant: "secondary",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      label: `${dias} días`,
    };
  };

  const getPctBarClass = (pct) => {
    if (pct >= 80) return "from-emerald-600 to-emerald-500";
    if (pct >= 50) return "from-amber-500 to-amber-400";
    return "from-red-600 to-red-500";
  };

  const busy = isLoading || isRefreshing;

  const detailsContent = (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 xl:col-span-1 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600" />
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900">Aprendices por ciudad</CardTitle>
            <CardDescription>Top 5 por distribución actual</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-40 bg-gray-100 rounded" />
                      <div className="h-2 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : data.ciudades.length === 0 ? (
                <div className="text-sm text-gray-600">Sin datos</div>
              ) : (
                <div className="space-y-5">
                  {data.ciudades.map((item) => (
                    <div key={item.ciudad} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate">{item.ciudad}</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0 bg-gray-100 text-gray-700 hover:bg-gray-100"
                          >
                            {item.porcentaje}%
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{item.cantidad}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Acciones recomendadas</p>
                    <p className="text-xs text-gray-600">Enfocado en lo que requiere atención</p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 border-l-4 border-red-500 bg-red-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">Urgente</Badge>
                        <span className="text-xs text-gray-600">{data.urgentCount} casos</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Contratos por vencer (≤ 7 días)</p>
                      <p className="text-xs text-gray-600 mt-1">Revisar y gestionar reemplazos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border-l-4 border-blue-600 bg-blue-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-blue-600 text-white hover:bg-blue-600">Importante</Badge>
                        <span className="text-xs text-gray-600">{data.pruebasPendientes} casos</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Pruebas pendientes</p>
                      <p className="text-xs text-gray-600 mt-1">Completar evaluaciones para avanzar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border-l-4 border-amber-500 bg-amber-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-amber-500 text-white hover:bg-amber-500">Información</Badge>
                        <span className="text-xs text-gray-600">{data.aprendicesIncompletos} casos</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Registros incompletos</p>
                      <p className="text-xs text-gray-600 mt-1">Completar datos faltantes en seguimiento</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 xl:col-span-1 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-amber-500" />
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900">Próximos vencimientos</CardTitle>
            <CardDescription>Contratos por vencer (según días restantes)</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : data.proximosVencimientos.length === 0 ? (
            <div className="text-sm text-gray-600">Sin vencimientos próximos</div>
          ) : (
            <div className="space-y-3">
              {data.proximosVencimientos.map((apprentice) => (
                <div
                  key={apprentice.id || `${apprentice.nombre}-${apprentice.dias}`}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {apprentice.nombre}
                      {apprentice.documento ? ` (${apprentice.documento})` : ""}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mt-1 truncate">{apprentice.programa}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-50"
                      >
                        {String(apprentice.etapa).includes("lectiva") ? (
                          <>
                            <BookOpen className="h-2.5 w-2.5 mr-1" />
                            Lectiva
                          </>
                        ) : (
                          <>
                            <Briefcase className="h-2.5 w-2.5 mr-1" />
                            {apprentice.etapa || "Etapa"}
                          </>
                        )}
                      </Badge>
                      {typeof apprentice.dias === "number" &&
                        (apprentice.dias < 0 ||
                          (String(apprentice.etapa || "").toLowerCase().includes("lectiva") &&
                            apprentice.dias <= 62)) && (
                          <Badge
                            className={`text-xs text-white ${
                              apprentice.dias < 0 || apprentice.dias <= 30
                                ? "bg-red-600 hover:bg-red-600"
                                : "bg-amber-500 hover:bg-amber-500"
                            }`}
                          >
                            Urgente
                          </Badge>
                        )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {(() => {
                      const badge = getDaysBadge(apprentice.dias, apprentice.etapa);
                      return (
                        <Badge variant={badge.variant} className={`font-semibold ${badge.className}`}>
                          {badge.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 xl:col-span-1 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900">Pruebas de selección</CardTitle>
            <CardDescription>Porcentaje de aprobación y pendientes</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <TestTubeDiagonal className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-44 bg-gray-100 rounded" />
                  <div className="h-2 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {pruebasSummary.map((prueba) => (
                <div key={prueba.key} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-gray-900">{prueba.label}</span>
                    </div>
                    <Badge className="text-xs bg-gray-900 text-white hover:bg-gray-900">{prueba.pct}%</Badge>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getPctBarClass(prueba.pct)} rounded-full transition-all duration-500`}
                      style={{ width: `${prueba.pct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      Aprobados: {prueba.data.aprobados}
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Rechazados: {prueba.data.rechazados}
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Pendientes: {prueba.data.pendientes}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-purple-50 shadow-sm">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-200/40 blur-2xl" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-200/40 blur-2xl" />
        <div className="relative p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                {!isLoading && (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                    En vivo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {lastUpdatedAt ? `Actualizado: ${lastUpdatedAt.toLocaleString("es-ES")}` : "Cargando datos…"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadDashboard} disabled={busy} className="bg-white">
                <RefreshCw className={`h-4 w-4 mr-2 ${busy ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              {busy && (
                <div className="bg-white/80 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm border border-gray-200">
                  <Spinner />
                  <span className="text-gray-700 font-medium text-sm">
                    {lastUpdatedAt ? "Actualizando..." : "Cargando..."}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/convocatorias" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600">Convocatorias</p>
                  <p className="text-sm text-gray-900 mt-1">Ver y crear</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </Link>
            <Link to="/seleccion" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600">Selección</p>
                  <p className="text-sm text-gray-900 mt-1">Pruebas y estado</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </Link>
            <Link to="/seguimiento" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600">Seguimiento</p>
                  <p className="text-sm text-gray-900 mt-1">Cuota y etapas</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </Link>
            <Link to="/roles" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600">Roles</p>
                  <p className="text-sm text-gray-900 mt-1">Permisos</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                  <ClipboardList className="h-5 w-5 text-slate-700" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 my-8">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Convocatorias activas</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{isLoading ? "—" : data.convocatoriasActivas}</div>
            <p className="text-xs text-gray-600 mt-2">
              Archivadas: {isLoading ? "—" : data.convocatoriasArchivadas}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-fuchsia-600" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Aprendices activos</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{isLoading ? "—" : data.totalActivos}</div>
            <p className="text-xs text-gray-600 mt-2">
              Lectiva: {isLoading ? "—" : data.enLectiva} · Productiva: {isLoading ? "—" : data.enProductiva}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-emerald-600" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Cuota del mes</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <div className="text-3xl font-bold text-gray-900">
                {isLoading ? "—" : `${data.totalActivos}/${data.cuota}`}
              </div>
              {!isLoading && cuotaBadge}
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.cuotaStatus === "over"
                    ? "bg-fuchsia-600"
                    : data.cuotaStatus === "under"
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((data.totalActivos / Math.max(1, data.cuota)) * 100))}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        {bottomLoading ? (
          <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow-sm border border-gray-200 w-fit">
            <Spinner />
            <span className="text-gray-700 font-medium">Cargando...</span>
          </div>
        ) : (
          detailsContent
        )}
      </div>
    </div>
  );
}
