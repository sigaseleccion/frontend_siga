import React, { useState } from "react";
import { Shield, Plus, Edit2, Trash2 } from "lucide-react";
import { Navbar } from "@/shared/components/Navbar";
import { useListRole } from "../hooks/useListRole";
import { useNavigate } from "react-router-dom";
import { roleService } from "../services/roleService";

export default function RolesPage() {
  const { roles, loading, error, recargar } = useListRole();
  const navigate = useNavigate();

  const handleEdit = (roleId) => {
    navigate(`/roles/editar/${roleId}`);
  };

  const handleDelete = async (roleId) => {
    const confirmar = window.confirm(
      "¿Estás segura de eliminar este rol?\n\nEsta acción es irreversible.",
    );

    if (!confirmar) return;

    try {
      await roleService.deleteRole(roleId);
      recargar(); // 🔁 vuelve a cargar la lista
    } catch (error) {
      // ⛔ mensaje de negocio del backend
      alert(error.message);
    }
  };

  const handleCreateRole = () => {
    navigate("/roles/crear");
  };

  return (
    <>
      <Navbar />
      <main className="ml-72 min-h-screen bg-gray-50">
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
          <div className="relative">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? "opacity-75" : ""}`}
            >
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Shield className="text-blue-600" size={24} />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        role.activo === true
                          ? "bg-blue-600 text-white"
                          : "bg-pink-600 text-white"
                      }`}
                    >
                      {role.activo === true ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {role.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {role.descripcion}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(role._id)}
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg transition-colors duration-200 font-medium ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(role._id)}
                      disabled={loading}
                      className={`p-2 text-red-600 rounded-lg transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-white/80 rounded-lg p-4 flex items-center gap-3 shadow">
                  <svg
                    className="animate-spin h-6 w-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span className="text-gray-700 font-medium">
                    Cargando roles...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
