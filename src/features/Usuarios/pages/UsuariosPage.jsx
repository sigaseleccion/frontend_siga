"use client";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../../shared/components/ui/SweetAlert";
import Header from "../../../shared/components/Header";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/shared/components/Navbar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  UserCog,
  PenBoxIcon,
  Trash2Icon,
  Trash,
} from "lucide-react";
import { useUsuarios, useRoles } from "../hooks/index.js";
import {
  CreateUsuarioModal,
  EditUsuarioModal,
  DeleteUsuarioDialog,
} from "../components/index.js";
import { useHeader } from "../../../shared/contexts/HeaderContext.jsx";
import { DataTable } from "../../../shared/components/DataTable";
import Spinner from "../../../shared/components/ui/Spinner";
import { tienePermiso } from "../../../shared/utils/auth/permissions.js";
import { useAuth } from "../../../shared/contexts/auth/AuthContext.jsx";

const UsuariosPage = () => {
  const { usuarios, loading: usuariosLoading, refetch } = useUsuarios();
  const { roles, loading: rolesLoading } = useRoles();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { setHeaderConfig } = useHeader();
  const { auth } = useAuth();

  useEffect(() => {
    setHeaderConfig({
      title: "Usuarios",
      icon: UserCog,
      iconBg: "from-purple-600 to-purple-400",
    });
  }, []);

  const handleEditClick = (usuario) => {
    setSelectedUsuario(usuario);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (usuario) => {
    setSelectedUsuario(usuario);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  const getRolBadgeStyle = (rolData) => {
    // rolData puede ser un objeto { _id, nombre } o un string con el ID
    let rolName = "Sin rol";

    if (typeof rolData === "object" && rolData?.nombre) {
      // Si es un objeto con nombre (populate)
      rolName = rolData.nombre;
    } else if (typeof rolData === "string") {
      // Si es solo el ID, buscar en la lista de roles
      const rol = roles.find((r) => r._id === rolData);
      rolName = rol?.nombre || "Sin rol";
    }

    switch (rolName.toLowerCase()) {
      case "administrador":
        return "bg-blue-600 text-white hover:bg-blue-600";
      case "coordinador":
        return "bg-pink-500 text-white hover:bg-pink-500";
      case "analista":
        return "border border-gray-300 bg-transparent text-gray-700 hover:bg-transparent";
      default:
        return "bg-gray-500 text-white hover:bg-gray-500";
    }
  };

  const getEstadoBadgeStyle = (activo) => {
    return activo
      ? "bg-green-100 text-green-700 hover:bg-green-100"
      : "bg-red-100 text-red-700 hover:bg-red-100";
  };

  const getRolNombre = (rolData) => {
    // rolData puede ser un objeto { _id, nombre } o un string con el ID
    if (typeof rolData === "object" && rolData?.nombre) {
      return rolData.nombre;
    } else if (typeof rolData === "string") {
      return roles.find((r) => r._id === rolData)?.nombre || "Sin rol";
    }
    return "Sin rol";
  };

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.activo).length;

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (rolesLoading) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>
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
      <main className="min-h-screen bg-gray-50">
        <div className="p-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {/* Buscador más corto */}
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 w-full"
                />
              </div>

              {/* Botón al final */}
              {tienePermiso(auth, "usuarios", "crear") && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={20} />
                  Crear Usuario
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalUsuarios}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card showTopLine>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Usuarios Activos
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {usuariosActivos}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Listado de Usuarios
              </h2>
              {usuariosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
                    <Spinner />
                    <span className="text-gray-700 font-medium">
                      Cargando...
                    </span>
                  </div>
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "nombre",
                      header: "Nombre",
                      render: (value) => (
                        <span className="font-medium text-gray-900">
                          {value}
                        </span>
                      ),
                    },
                    {
                      key: "correo",
                      header: "Correo",
                    },
                    {
                      key: "rol",
                      header: "Rol",
                      render: (value, row) => (
                        <Badge
                          className={`${getRolBadgeStyle(
                            value,
                          )} rounded-full px-3 py-1 text-xs font-medium`}
                        >
                          {getRolNombre(value)}
                        </Badge>
                      ),
                    },
                    {
                      key: "activo",
                      header: "Estado",
                      render: (value) => (
                        <Badge
                          className={`${getEstadoBadgeStyle(
                            value,
                          )} rounded-full px-3 py-1 text-xs font-medium`}
                        >
                          {value ? "Activo" : "Inactivo"}
                        </Badge>
                      ),
                    },
                    {
                      key: "fechaCreacion",
                      header: "Fecha Creación",
                      render: (value) => formatDate(value),
                    },
                    {
                      key: "_id",
                      header: "Acciones",
                      render: (value, row) => (
                        <div className="flex items-center gap-2">
                          {tienePermiso(auth, "usuarios", "editar") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(row)}
                              title="Editar Usuario"
                              className="h-9 w-9 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            >
                              <PenBoxIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {tienePermiso(auth, "usuarios", "eliminar") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(row)}
                              title="Eliminar Usuario"
                              className="h-9 w-9 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={filteredUsuarios}
                  pageSize={5}
                  emptyMessage="No hay usuarios registrados"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <CreateUsuarioModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleSuccess}
        roles={roles}
      />

      {selectedUsuario && (
        <>
          <EditUsuarioModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            usuario={selectedUsuario}
            onSuccess={handleSuccess}
            roles={roles}
          />

          <DeleteUsuarioDialog
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            usuario={selectedUsuario}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  );
};

export default UsuariosPage;
