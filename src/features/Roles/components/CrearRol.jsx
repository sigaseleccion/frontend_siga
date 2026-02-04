import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRol } from '../hooks/useCreateRole';
import { permissionService } from '../services/permissionService';
import { Navbar } from '@/shared/components/Navbar';
import { ArrowLeft, Shield, Check, Loader2 } from 'lucide-react';

const CrearRol = () => {
  const navigate = useNavigate();
  const { crearRol, cargando, error } = useCreateRol();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

  // 🔹 Cargar permisos
  useEffect(() => {
    const cargarPermisos = async () => {
      const data = await permissionService.getPermissions();
      setPermisosDisponibles(data);
    };
    cargarPermisos();
  }, []);

  // 🔹 Manejar check de privilegios
  const togglePrivilegio = (permisoId, privilegioId) => {
    setPermisosSeleccionados(prev => {
      const permiso = prev.find(p => p.permiso === permisoId);

      if (!permiso) {
        return [
          ...prev,
          {
            permiso: permisoId,
            privilegiosAsignados: [privilegioId],
          },
        ];
      }

      const existe = permiso.privilegiosAsignados.includes(privilegioId);

      return prev.map(p =>
        p.permiso === permisoId
          ? {
              ...p,
              privilegiosAsignados: existe
                ? p.privilegiosAsignados.filter(id => id !== privilegioId)
                : [...p.privilegiosAsignados, privilegioId],
            }
          : p
      );
    });
  };

  // 🔹 Verificar si un privilegio está seleccionado
  const isPrivilegioSelected = (permisoId, privilegioId) => {
    const permiso = permisosSeleccionados.find(p => p.permiso === permisoId);
    return permiso?.privilegiosAsignados.includes(privilegioId) || false;
  };

  // 🔹 Contar permisos seleccionados
  const totalPermisosSeleccionados = permisosSeleccionados.reduce(
    (total, permiso) => total + permiso.privilegiosAsignados.length,
    0
  );

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await crearRol({
      nombre,
      descripcion,
      permisos: permisosSeleccionados,
    });

    if (success) {
      navigate('/roles');
    }
  };

  return (
    <>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/roles')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver a Roles</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Crear Rol</h1>
                <p className="text-gray-600 mt-1">Define permisos y accesos del sistema</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda - Información Básica */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Información del Rol</h2>
                    <p className="text-sm text-gray-600 mt-1">Configura los datos básicos del rol</p>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Nombre del Rol */}
                    <div className="space-y-2">
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre del Rol <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        placeholder="Ej: Gestor de Convocatorias"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        placeholder="Describe las responsabilidades de este rol..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
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
                        Selecciona los permisos necesarios para este rol en la sección de la derecha
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
                        disabled={cargando || !nombre}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {cargando ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creando Rol...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Crear Rol
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/roles')}
                        disabled={cargando}
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit flex flex-col max-h-[calc(100vh-200px)]">
                  <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">Permisos del Sistema</h2>
                    <p className="text-sm text-gray-600 mt-1">Selecciona los privilegios que tendrá este rol</p>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                      {permisosDisponibles.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Cargando permisos...</p>
                          </div>
                        </div>
                      ) : (
                        permisosDisponibles.map(permiso => {
                          const permisosActivosEnModulo = permisosSeleccionados.find(
                            p => p.permiso === permiso._id
                          )?.privilegiosAsignados.length || 0;

                          return (
                            <div
                              key={permiso._id}
                              className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
                            >
                              {/* Header del módulo */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {permiso.modulo}
                                  </h3>
                                  {permiso.descripcion && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      {permiso.descripcion}
                                    </p>
                                  )}
                                </div>
                                {permisosActivosEnModulo > 0 && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                                    {permisosActivosEnModulo} activo{permisosActivosEnModulo !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              {/* Grid de privilegios */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {permiso.privilegiosDisponibles.map(priv => {
                                  const isSelected = isPrivilegioSelected(permiso._id, priv._id);
                                  
                                  return (
                                    <label
                                      key={priv._id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-50'
                                          : 'border-gray-200 hover:border-gray-300 bg-white'
                                      }`}
                                    >
                                      <div className="relative flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => togglePrivilegio(permiso._id, priv._id)}
                                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                      </div>
                                      <span
                                        className={`text-sm font-medium ${
                                          isSelected ? 'text-blue-900' : 'text-gray-700'
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

export default CrearRol;