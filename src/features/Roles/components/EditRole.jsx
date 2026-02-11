import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditRol } from "../hooks/useEditRole";
import { roleService } from "../services/roleService";
import { permissionService } from "../services/permissionService";
import { Navbar } from "@/shared/components/Navbar";
import { ArrowLeft, Shield, Save, Loader2, Edit } from "lucide-react";
import {
  confirmAlert,
  successAlert,
} from "../../../shared/components/ui/SweetAlert";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import Spinner from "../../../shared/components/ui/Spinner";
import { capitalizarPalabras } from "../../../shared/utils/capitalizarPalabras";

const EditRol = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editarRol, loading, error } = useEditRol();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [tieneUsuariosActivos, setTieneUsuariosActivos] = useState(false);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [estadoInicial, setEstadoInicial] = useState(null);
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Editar Rol",
      icon: Edit,
      iconBg: "from-blue-600 to-blue-400",
    });
  }, []);

  // Cargar rol + permisos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);

        const data = await roleService.getRolId(id);
        const permisos = await permissionService.getPermissions();

        const { rol, tieneUsuariosActivos } = data;

        setNombre(rol.nombre);
        setDescripcion(rol.descripcion || "");
        setPermisosSeleccionados(rol.permisos || []);
        setPermisosDisponibles(permisos);
        setActivo(rol.activo);
        setTieneUsuariosActivos(tieneUsuariosActivos);

        setEstadoInicial({
          nombre: rol.nombre,
          descripcion: rol.descripcion || "",
          activo: rol.activo,
          permisos: rol.permisos || [],
        });
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [id]);

  const togglePrivilegio = (permisoId, privilegioId) => {
    setPermisosSeleccionados((prev) => {
      // Buscar si ya existe el permiso
      const permisoExistente = prev.find(
        (p) => (p.permiso._id || p.permiso) === permisoId,
      );

      if (!permisoExistente) {
        // Si no existe, agregarlo
        return [
          ...prev,
          {
            permiso: permisoId,
            privilegiosAsignados: [privilegioId],
          },
        ];
      }

      // Si existe, actualizar privilegios
      return prev.map((p) => {
        const pId = p.permiso._id || p.permiso;
        if (pId === permisoId) {
          const privilegios = p.privilegiosAsignados.map(
            (priv) => priv._id || priv,
          );
          const tienePrivilegio = privilegios.includes(privilegioId);

          return {
            ...p,
            privilegiosAsignados: tienePrivilegio
              ? p.privilegiosAsignados.filter(
                  (priv) => (priv._id || priv) !== privilegioId,
                )
              : [...p.privilegiosAsignados, privilegioId],
          };
        }
        return p;
      });
    });
  };

  // Verificar si un privilegio está seleccionado
  const isPrivilegioSelected = (permisoId, privilegioId) => {
    const permisoRol = permisosSeleccionados.find(
      (p) => (p.permiso._id || p.permiso) === permisoId,
    );

    if (!permisoRol) return false;

    const privilegios = permisoRol.privilegiosAsignados.map(
      (priv) => priv._id || priv,
    );
    return privilegios.includes(privilegioId);
  };

  // Contar permisos seleccionados
  const totalPermisosSeleccionados =
    permisosSeleccionados?.reduce(
      (total, permiso) => total + (permiso.privilegiosAsignados?.length || 0),
      0,
    ) || 0;

  //si hay cambios en el formulario
  const hayCambios = () => {
    if (!estadoInicial) return false;

    const estadoActual = {
      nombre,
      descripcion,
      activo,
      permisos: permisosSeleccionados,
    };

    return JSON.stringify(estadoActual) !== JSON.stringify(estadoInicial);
  };

  const handleCancelar = async () => {
    if (!hayCambios()) {
      navigate("/roles");
      return;
    }

    const result = await confirmAlert({
      title: "¿Salir sin guardar cambios?",
      text: "Tienes cambios sin guardar. Si sales ahora, se perderán.",
      confirmText: "Sí, salir",
    });

    if (result.isConfirmed) {
      navigate("/roles");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await editarRol(id, {
      nombre,
      descripcion,
      activo,
      permisos: permisosSeleccionados.map((p) => ({
        permiso: p.permiso._id || p.permiso,
        privilegiosAsignados: p.privilegiosAsignados.map(
          (priv) => priv._id || priv,
        ),
      })),
    });

    await successAlert({
      title: "Rol actualizado",
      text: "El rol se actualizó correctamente. Los cambios se aplicarán al volver a iniciar sesión.",
      confirmButtonText: "Aceptar",
    });

    if (success) {
      navigate("/roles");
    }
  };

  if (cargandoDatos) {
    return (
      <>
        <main className="bg-gray-50">
          <div className="flex items-center justify-center py-80">
            <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
              <Spinner />
              <span className="text-gray-700 font-medium">Cargando...</span>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="bg-gray-50">
        <div className="p-4">
          {/* Header */}
          {/* <div className="mb-2">
            <button
              onClick={() => navigate("/roles")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver a Roles</span>
            </button>
          </div> */}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda - Información Básica */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Información del Rol
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Modifica los datos básicos del rol
                    </p>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Nombre del Rol */}
                    <div className="space-y-2">
                      <label
                        htmlFor="nombre"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre del Rol <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        placeholder="Ej: Gestor de Convocatorias"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <label
                        htmlFor="descripcion"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        placeholder="Describe las responsabilidades de este rol..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                    {/* Estado del Rol */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Estado del Rol
                      </label>

                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {activo ? "Rol activo" : "Rol inactivo"}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                activo
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {activo ? "● Activo" : "○ Inactivo"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {activo
                              ? "El rol puede ser asignado a usuarios"
                              : "El rol no podrá ser usado"}
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activo}
                            disabled={tieneUsuariosActivos}
                            onChange={() => setActivo(!activo)}
                            className="sr-only peer"
                          />
                          <div
                            className={`w-11 h-6 rounded-full peer transition-all ${
                              tieneUsuariosActivos
                                ? "bg-gray-300 cursor-not-allowed"
                                : activo
                                  ? "bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300"
                                  : "bg-gray-200 peer-focus:ring-2 peer-focus:ring-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform ${
                                activo ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </label>
                      </div>

                      {tieneUsuariosActivos && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <svg
                            className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-xs text-amber-700 font-medium">
                            No puedes desactivar este rol porque tiene usuarios
                            activos asignados. Primero debes reasignar o
                            eliminar esos usuarios.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Resumen de permisos */}
                    <div className="pt-5 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Permisos Seleccionados
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                          {totalPermisosSeleccionados}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Modifica los permisos necesarios para este rol en la
                        sección de la derecha
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Botones */}
                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        disabled={loading || !nombre}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Guardando Cambios...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelar}
                        disabled={loading}
                        className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha - Permisos */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit flex flex-col max-h-[calc(100vh-95px)]">
                  <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Permisos del Sistema
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Selecciona los privilegios que tendrá este rol
                    </p>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                      {permisosDisponibles.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">
                              Cargando permisos...
                            </p>
                          </div>
                        </div>
                      ) : (
                        permisosDisponibles.map((permiso) => {
                          const permisoRol = permisosSeleccionados.find(
                            (p) => (p.permiso._id || p.permiso) === permiso._id,
                          );
                          const permisosActivosEnModulo =
                            permisoRol?.privilegiosAsignados.length || 0;

                          return (
                            <div
                              key={permiso._id}
                              className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
                            >
                              {/* Header del módulo */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {capitalizarPalabras(permiso.modulo)}
                                  </h3>
                                </div>
                                {permisosActivosEnModulo > 0 && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                                    {permisosActivosEnModulo} activo
                                    {permisosActivosEnModulo !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>

                              {/* Grid de privilegios */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {permiso.privilegiosDisponibles.map((priv) => {
                                  const isSelected = isPrivilegioSelected(
                                    permiso._id,
                                    priv._id,
                                  );

                                  return (
                                    <label
                                      key={priv._id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        isSelected
                                          ? "border-blue-500 bg-blue-50"
                                          : "border-gray-200 hover:border-gray-300 bg-white"
                                      }`}
                                    >
                                      <div className="relative flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() =>
                                            togglePrivilegio(
                                              permiso._id,
                                              priv._id,
                                            )
                                          }
                                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                      </div>
                                      <span
                                        className={`text-sm font-medium ${
                                          isSelected
                                            ? "text-blue-900"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {priv.etiqueta}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditRol;
