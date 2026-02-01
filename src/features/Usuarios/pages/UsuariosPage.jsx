'use client';

import React, { useState } from "react";
import { Navbar } from "@/shared/components/Navbar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Plus, Search, Users, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

const UsuariosPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo para la tabla
  const usuarios = [
    {
      id: 1,
      nombre: "Carlos Administrador",
      tipoDoc: "CC",
      documento: "1234567890",
      correo: "carlos.admin@empresa.com",
      rol: "Administrador",
      estado: "Activo",
    },
    {
      id: 2,
      nombre: "Maria Coordinadora",
      tipoDoc: "CC",
      documento: "9876543210",
      correo: "maria.coord@empresa.com",
      rol: "Coordinador",
      estado: "Activo",
    },
    {
      id: 3,
      nombre: "Juan Analista",
      tipoDoc: "CE",
      documento: "5555555555",
      correo: "juan.analista@empresa.com",
      rol: "Analista",
      estado: "Activo",
    },
    {
      id: 4,
      nombre: "Ana Supervisora",
      tipoDoc: "CC",
      documento: "1112223334",
      correo: "ana.super@empresa.com",
      rol: "Coordinador",
      estado: "Inactivo",
    },
  ];

  const getRolBadgeStyle = (rol) => {
    switch (rol) {
      case "Administrador":
        return "bg-blue-600 text-white hover:bg-blue-600";
      case "Coordinador":
        return "bg-pink-500 text-white hover:bg-pink-500";
      case "Analista":
        return "border border-gray-300 bg-transparent text-gray-700 hover:bg-transparent";
      default:
        return "bg-gray-500 text-white hover:bg-gray-500";
    }
  };

  const getEstadoBadgeStyle = (estado) => {
    return estado === "Activo"
      ? "bg-green-100 text-green-700 hover:bg-green-100"
      : "bg-red-100 text-red-700 hover:bg-red-100";
  };

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.estado === "Activo").length;

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.documento.includes(searchTerm) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="ml-64 min-h-screen bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
                <p className="text-gray-600 mt-1">
                  Gestion de usuarios del sistema
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={20} />
                Crear Usuario
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalUsuarios}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
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
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, documento o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
          </div>

          {/* Users Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Listado de Usuarios
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tipo Doc.
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Correo
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {usuario.nombre}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {usuario.tipoDoc}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {usuario.documento}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {usuario.correo}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`${getRolBadgeStyle(
                              usuario.rol
                            )} rounded-full px-3 py-1 text-xs font-medium`}
                          >
                            {usuario.rol}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`${getEstadoBadgeStyle(
                              usuario.estado
                            )} rounded-full px-3 py-1 text-xs font-medium`}
                          >
                            {usuario.estado}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditModalOpen(true)}
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Edit2 size={16} className="mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsDeleteModalOpen(true)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal Crear Usuario */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre completo"
                className="border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Tipo Documento</Label>
                <Select>
                  <SelectTrigger id="tipoDocumento">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc">Cedula de Ciudadania</SelectItem>
                    <SelectItem value="ce">Cedula de Extranjeria</SelectItem>
                    <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="pas">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">Documento</Label>
                <Input id="documento" placeholder="Numero de documento" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                placeholder="correo@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select>
                <SelectTrigger id="rol">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="analista">Analista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contrasena"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuario */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifique los datos del usuario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                defaultValue="Carlos Administrador"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipoDocumento">Tipo Documento</Label>
                <Select defaultValue="cc">
                  <SelectTrigger id="edit-tipoDocumento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc">Cedula de Ciudadania</SelectItem>
                    <SelectItem value="ce">Cedula de Extranjeria</SelectItem>
                    <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="pas">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-documento">Documento</Label>
                <Input id="edit-documento" defaultValue="1234567890" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-correo">Correo</Label>
              <Input
                id="edit-correo"
                type="email"
                defaultValue="carlos.admin@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol</Label>
              <Select defaultValue="administrador">
                <SelectTrigger id="edit-rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="analista">Analista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contrasena (opcional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Dejar vacio para mantener la actual"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar Usuario */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Eliminar Usuario
            </DialogTitle>
            <DialogDescription>
              Esta seguro que desea eliminar este usuario? Esta accion no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsuariosPage;
