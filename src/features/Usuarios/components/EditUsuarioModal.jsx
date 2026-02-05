'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { PasswordInput } from './PasswordInput';
import { actualizarUsuario } from '../services/usuarioService.js';

export const EditUsuarioModal = ({ open, onOpenChange, usuario, onSuccess, roles }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: '',
    activo: true
  });

  // Filtrar solo roles activos
  const rolesActivos = roles.filter(rol => rol.activo !== false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        correo: usuario.correo || '',
        contrasena: '',
        rol: usuario.rol?._id || usuario.rol || '',
        activo: usuario.activo !== false
      });
    }
  }, [usuario, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRolChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rol: value
    }));
  };

  const handleActivoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      activo: value === 'activo'
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (!password) return true; // Contraseña es opcional en edición
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.correo || !formData.rol) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    if (!validateEmail(formData.correo)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }

    if (formData.contrasena && !validatePassword(formData.contrasena)) {
      alert('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        nombre: formData.nombre,
        correo: formData.correo,
        rol: formData.rol,
        activo: formData.activo
      };

      if (formData.contrasena) {
        updateData.contrasena = formData.contrasena;
      }

      await actualizarUsuario(usuario._id, updateData);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      alert('Error al actualizar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-correo">Correo</Label>
            <Input
              id="edit-correo"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rol">Rol</Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger id="edit-rol">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {rolesActivos.map(rol => (
                  <SelectItem key={rol._id} value={rol._id}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PasswordInput
            value={formData.contrasena}
            onChange={handleChange}
            label="Nueva Contraseña"
            placeholder="Dejar vacío para mantener la actual"
            showValidation={!!formData.contrasena}
            required={false}
          />

          <div className="space-y-2">
            <Label htmlFor="edit-activo">Estado</Label>
            <Select 
              value={formData.activo ? 'activo' : 'inactivo'} 
              onValueChange={handleActivoChange}
            >
              <SelectTrigger id="edit-activo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
