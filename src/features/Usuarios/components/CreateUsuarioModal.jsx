'use client';

import React, { useState } from 'react';
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
import { crearUsuario } from '../services/usuarioService.js';

export const CreateUsuarioModal = ({ open, onOpenChange, onSuccess, roles }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: ''
  });

  // Filtrar solo roles activos
  const rolesActivos = roles.filter(rol => rol.activo !== false);

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.correo || !formData.contrasena || !formData.rol) {
      alert('Por favor complete todos los campos');
      return;
    }

    if (!validateEmail(formData.correo)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }

    if (!validatePassword(formData.contrasena)) {
      alert('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    try {
      setLoading(true);
      await crearUsuario({
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol: formData.rol
      });

      setFormData({ nombre: '', correo: '', contrasena: '', rol: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      alert('Error al crear usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              className="border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo <span className="text-red-500">*</span></Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="correo@empresa.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol <span className="text-red-500">*</span></Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger id="rol">
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
            label="Contraseña"
            placeholder="Ingrese contraseña segura"
            showValidation={true}
            required={true}
          />
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
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
