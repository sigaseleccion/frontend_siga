import React, { useState } from "react";
import { Shield, Plus, Edit2, Trash2 } from "lucide-react";
import { Navbar } from '@/shared/components/Navbar'

export default function RolesPage() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Administrador",
      description: "Acceso completo a todos los módulos del sistema",
      permissions: 15,
      status: "active",
    },
    {
      id: 2,
      name: "Gestor de Convocatorias",
      description: "Gestión de convocatorias y proceso de selección",
      permissions: 8,
      status: "active",
    },
    {
      id: 3,
      name: "Supervisor de Seguimiento",
      description: "Seguimiento y monitoreo de aprendices activos",
      permissions: 6,
      status: "active",
    },
    {
      id: 4,
      name: "Consultor",
      description: "Solo visualización de información",
      permissions: 4,
      status: "inactive",
    },
  ]);

  const handleEdit = (roleId) => {
    console.log("Editar rol:", roleId);
    // Aquí irá la lógica para editar
  };

  const handleDelete = (roleId) => {
    console.log("Eliminar rol:", roleId);
    // Aquí irá la lógica para eliminar
  };

  const handleCreateRole = () => {
    console.log("Crear nuevo rol");
    // Aquí irá la lógica para crear un nuevo rol
  };

  return (
    <>
      <Navbar />
      <main className="ml-64 min-h-screen bg-gray-50">
        <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
            <p className="text-gray-600 mt-1">
              Gestión de roles y permisos del sistema
            </p>
          </div>
          <button
            onClick={handleCreateRole}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            <Plus size={20} />
            Crear Rol
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Shield className="text-blue-600" size={24} />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  role.status === "active"
                    ? "bg-blue-600 text-white"
                    : "bg-pink-600 text-white"
                }`}
              >
                {role.status === "active" ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Card Content */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {role.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="inline-block bg-gray-100 px-3 py-1 rounded-md">
                <span className="text-sm font-medium text-gray-700">
                  {role.permissions} permisos activos
                </span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleEdit(role.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                <Edit2 size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDelete(role.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      </main>
    </>
  );
};
