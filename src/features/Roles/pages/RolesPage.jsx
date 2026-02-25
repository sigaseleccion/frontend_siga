import React, { useState, useEffect, act } from "react";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Search,
  ShieldBanIcon,
  ShieldUser,
  ShieldX,
  ShieldCheck,
  PenBoxIcon,
} from "lucide-react";
import { useListRole } from "../hooks/useListRole";
import { useNavigate } from "react-router-dom";
import { roleService } from "../services/roleService";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../../shared/components/ui/SweetAlert";
import { tienePermiso } from "../../../shared/utils/auth/permissions";
import { useAuth } from "../../../shared/contexts/auth/AuthContext";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useHeader } from "../../../shared/contexts/HeaderContext";
import Spinner from "../../../shared/components/ui/Spinner";
import {
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";

export default function RolesPage() {
  const { auth } = useAuth();
  const { roles, loading, error, recargar } = useListRole();
  const [searchNombre, setSearchNombre] = useState("");
  const navigate = useNavigate();
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Roles",
      icon: Shield,
      iconBg: "from-blue-600 to-blue-400",
    });
  }, []);

  const handleEdit = (roleId) => {
    navigate(`/roles/editar/${roleId}`);
  };

  const handleDelete = async (roleId) => {
    const result = await confirmAlert({
      title: "¿Estás seguro de eliminar este rol?",
      text: "Esta acción es irreversible.",
      confirmText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      await roleService.deleteRole(roleId);

      await successAlert({
        title: "Rol eliminado",
        text: "El rol se eliminó correctamente.",
        confirmButtonText: "Aceptar",
      });

      recargar(); // recargar la lista
    } catch (error) {
      if (error.status === 409) {
        warningAlert({
          title: "Acción no permitida",
          text: "No se puede eliminar el rol porque tiene usuarios activos asociados.",
        });
      } else {
        errorAlert({
          title: "Error del sistema",
          text: error.message || "Ocurrió un problema inesperado.",
        });
      }
    }
  };

  const handleCreateRole = () => {
    navigate("/roles/crear");
  };

  const rolesFiltrados = roles.filter((role) =>
    role.nombre
      ?.toLowerCase()
      .trim()
      .includes(searchNombre.toLowerCase().trim()),
  );

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="mb-8 flex items-center justify-between">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de rol..."
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
                className="pl-10 bg-white border-gray-200 w-full"
              />
            </div>

            {/* Botón */}
            {tienePermiso(auth, "roles", "eliminar") && (
              <Button onClick={handleCreateRole} className="ml-auto">
                <Plus className="h-4 w-4" />
                Crear Rol
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Roles activos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roles.filter((r) => r.activo).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ShieldUser className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Roles inactivos
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roles.filter((r) => !r.activo).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <ShieldX className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Roles totales</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roles.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roles Grid */}
          <div className="relative">
            <div className="relative">
              {/* ESTADO VACÍO */}
              {roles.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Shield size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    No hay roles en el sistema
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Crea roles para controlar los permisos y accesos del
                    sistema.
                  </p>
                </div>
              )}

              {/* GRID DE ROLES */}
              {roles.length > 0 && (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
                    loading ? "opacity-75" : ""
                  }`}
                >
                  {rolesFiltrados.map((role) => (
                    <Card key={role._id} className="flex flex-col h-full">
                      {/* HEADER */}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="text-blue-600" size={20} />
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                role.activo
                                  ? "bg-blue-600 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {role.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </div>

                        <CardTitle className="text-lg">{role.nombre}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {role.descripcion}
                        </p>
                      </CardHeader>

                      {/* CONTENT */}
                      <CardContent className="flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Permisos */}
                          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4 text-center transition hover:shadow-sm">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                              Permisos
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                              {role.permisos?.length || 0}
                            </p>
                          </div>

                          {/* Usuarios */}
                          <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-4 text-center transition hover:shadow-sm">
                            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                              Usuarios
                            </p>
                            <p className="text-2xl font-bold text-purple-700">
                              {role.usersCount || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>

                      {/* FOOTER */}
                      <CardFooter className="flex gap-2">
                        {tienePermiso(auth, "roles", "editar") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(role._id)}
                            disabled={loading}
                          >
                            <PenBoxIcon className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        )}

                        {tienePermiso(auth, "roles", "eliminar") && (
                          <Button
                            size="sm"
                            onClick={() => handleDelete(role._id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* LOADER */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none py-10">
                  <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
                    <Spinner />
                    <span className="text-gray-700 font-medium">
                      Cargando...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? "opacity-75" : ""}`}
            ></div>
          </div>
        </div>
      </main>
    </>
  );
}
