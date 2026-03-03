 "use client";
 
 import { useEffect, useMemo, useState } from "react";
 import { useParams, Link } from "react-router-dom";
 import { Button } from "@/shared/components/ui/button";
 import { Input } from "@/shared/components/ui/input";
 import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
 } from "@/shared/components/ui/card";
 import { Badge } from "@/shared/components/ui/badge";
 import { useHeader } from "../../../shared/contexts/HeaderContext";
 import Spinner from "../../../shared/components/ui/Spinner";
 import { aprendizService } from "@/features/Convocatorias/services/aprendizService";
 import { getNivelFormacionLabel } from "@/shared/utils/nivelFormacion";
 import { ArrowLeft, BookOpen, GraduationCap, Briefcase, CheckCircle, User, Search } from "lucide-react";
 
 const iconByNivel = {
   tecnica: BookOpen,
   tecnologia: GraduationCap,
   profesional: Briefcase,
 };
 
 const toBogotaDisplay = (d) => {
   if (!d) return "-";
   const iso = typeof d === "string" ? d : new Date(d).toISOString();
   const [y, m, day] = iso.slice(0, 10).split("-");
   return `${day}/${m}/${y}`;
 };
 
 export default function SalaEsperaPage() {
   const { id: convocatoriaId } = useParams();
   const { setHeaderConfig } = useHeader();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [aprendices, setAprendices] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [reemplazosMap, setReemplazosMap] = useState({});
 
   useEffect(() => {
     setHeaderConfig({
       title: "Sala de espera",
       icon: CheckCircle,
       iconBg: "from-green-600 to-green-400",
       accions: (
         <Link to={`/seleccion/${convocatoriaId}`}>
           <Button variant="ghost" size="sm">
             <ArrowLeft className="h-4 w-4 mr-2" />
             Volver a Convocatoria
           </Button>
         </Link>
       ),
     });
   }, [convocatoriaId, setHeaderConfig]);
 
   useEffect(() => {
     const load = async () => {
       const start = Date.now();
       try {
         setError(null);
         setLoading(true);
         const data = await aprendizService.obtenerAprendicesPorConvocatoria(convocatoriaId);
         setAprendices(Array.isArray(data) ? data : []);
       const ids = (Array.isArray(data) ? data : [])
         .map((a) => a.apReemplazar)
         .filter(Boolean);
       if (ids.length > 0) {
         const detalles = await aprendizService.obtenerAprendicesPorIds(ids);
         const map = {};
         (detalles || []).forEach((ap) => {
           if (ap && ap._id) map[ap._id] = ap;
         });
         setReemplazosMap(map);
       } else {
         setReemplazosMap({});
       }
       } catch (e) {
         setError(e.message);
       } finally {
         const elapsed = Date.now() - start;
         const remaining = Math.max(0, 300 - elapsed);
         setTimeout(() => setLoading(false), remaining);
       }
     };
     if (convocatoriaId) load();
   }, [convocatoriaId]);
 
   const hoy = useMemo(() => {
     const d = new Date();
     d.setHours(0, 0, 0, 0);
     return d;
   }, []);
 
   const enSala = useMemo(() => {
     return (aprendices || []).filter((a) => {
       const seleccionado = a.estadoConvocatoria === "seleccionado";
       const enSeleccion2 = a.etapaActual === "seleccion2";
       const tieneInicioContrato = Boolean(a.fechaInicioContrato);
       const inicioContrato = tieneInicioContrato ? new Date(a.fechaInicioContrato) : null;
       const futuro = inicioContrato ? inicioContrato >= hoy : false;
       return seleccionado && enSeleccion2 && tieneInicioContrato && futuro;
     });
   }, [aprendices, hoy]);
 
   const filtrados = useMemo(() => {
     const term = searchTerm.trim().toLowerCase();
     if (!term) return enSala;
     return enSala.filter((a) => {
       const campos = [
         a.nombre || "",
         a.documento || "",
         a.programaFormacion || "",
         a.ciudad || "",
       ].map((s) => String(s).toLowerCase());
       return campos.some((c) => c.includes(term));
     });
   }, [enSala, searchTerm]);
 
   const NivelIcon = ({ nivel }) => {
     const Icon = iconByNivel[nivel] || User;
     return <Icon className="h-5 w-5 text-slate-600" />;
   };
 
   return (
     <main className="min-h-screen bg-gray-50">
       <div className="p-4">
         {error && (
           <Card className="mb-4">
             <CardContent className="p-4 text-red-700 bg-red-50 border border-red-200">
               {error}
             </CardContent>
           </Card>
         )}
 
         <div className="mb-4">
           <Link to={`/seleccion/${convocatoriaId}`}>
             <Button variant="outline" size="sm" className="bg-transparent">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Volver a Convocatoria
             </Button>
           </Link>
         </div>
 
         {loading && (
           <div className="mb-8 flex items-center justify-center py-16">
             <div className="flex flex-col items-center gap-3">
               <Spinner />
               <span className="text-gray-700 font-medium">Cargando...</span>
             </div>
           </div>
         )}
 
         {!loading && (
           <>
            <div className="mb-6 flex items-center justify-between">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar aprendiz por nombre, documento, programa o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 w-full"
                />
              </div>
              <Badge>{enSala.length} en espera</Badge>
            </div>
 
            {filtrados.length === 0 ? (
               <div className="text-sm text-muted-foreground">No hay aprendices en sala de espera para esta convocatoria.</div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtrados.map((a) => (
                   <Card key={a._id} className="border-border shadow-sm">
                     <CardHeader className="flex flex-row items-center justify-between">
                       <CardTitle className="text-base font-bold flex items-center gap-2">
                         <NivelIcon nivel={a.nivelFormacion} />
                         <span className="truncate">{a.nombre}</span>
                       </CardTitle>
                       <Badge className="bg-green-600 text-white">Aprobado</Badge>
                     </CardHeader>
                     <CardContent className="space-y-2 text-sm">
                       <div className="grid grid-cols-2 gap-2">
                         <div>
                           <span className="text-muted-foreground font-semibold">Documento</span>
                           <p>{a.tipoDocumento} {a.documento}</p>
                         </div>
                         <div>
                           <span className="text-muted-foreground font-semibold">Correo</span>
                           <p className="truncate">{a.correo || "-"}</p>
                         </div>
                         <div>
                           <span className="text-muted-foreground font-semibold">Teléfono</span>
                           <p>{a.telefono || "-"}</p>
                         </div>
                         <div>
                           <span className="text-muted-foreground font-semibold">Ciudad</span>
                           <p>{a.ciudad || "-"}</p>
                         </div>
                       </div>
                       <div className="mt-2 p-2 rounded-md bg-blue-50 border border-blue-200">
                         <p className="text-xs text-blue-800">
                           Inicio de contrato: <span className="font-semibold">{toBogotaDisplay(a.fechaInicioContrato)}</span>
                         </p>
                       </div>
                      <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground">
                          Aprendiz a reemplazar:{" "}
                          <span className="font-semibold">
                            {a.apReemplazar && reemplazosMap[a.apReemplazar]
                              ? reemplazosMap[a.apReemplazar].nombre
                              : "No tiene aprendiz a reemplazar"}
                          </span>
                        </p>
                      </div>
                       <div className="flex items-center gap-2 mt-2">
                         <Badge variant="secondary">{getNivelFormacionLabel(a.nivelFormacion)}</Badge>
                         <Badge variant="outline" className="border-gray-300 bg-gray-100 text-gray-600">
                           {a.programaFormacion}
                         </Badge>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             )}
           </>
         )}
       </div>
     </main>
   );
 }
