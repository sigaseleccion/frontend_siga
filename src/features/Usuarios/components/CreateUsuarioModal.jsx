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
import { successAlert, errorAlert } from '../../../shared/components/ui/SweetAlert';

export const CreateUsuarioModal = ({ open, onOpenChange, onSuccess, roles }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: ''
  });
  
  const [errors, setErrors] = useState({
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
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRolChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rol: value
    }));
    // Limpiar error de rol
    if (errors.rol) {
      setErrors(prev => ({
        ...prev,
        rol: ''
      }));
    }
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

  const validateForm = () => {
    const newErrors = {
      nombre: '',
      correo: '',
      contrasena: '',
      rol: ''
    };

    let isValid = true;

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
      isValid = false;
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'Ingrese un correo electrónico válido';
      isValid = false;
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
      isValid = false;
    } else if (!validatePassword(formData.contrasena)) {
      newErrors.contrasena = 'La contraseña no cumple con los requisitos de seguridad';
      isValid = false;
    }

    if (!formData.rol) {
      newErrors.rol = 'Debe seleccionar un rol';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
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
      setErrors({ nombre: '', correo: '', contrasena: '', rol: '' });
      onOpenChange(false);
      
      setTimeout(() => {
        onSuccess();
        successAlert({
          title: 'Usuario creado',
          text: 'El usuario se ha creado exitosamente'
        });
      }, 100);
      
    } catch (error) {
      errorAlert({
        title: 'Error',
        text: 'Error al crear usuario: ' + error.message
      });
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
            <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>
            )}
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
              className={errors.correo ? 'border-red-500' : ''}
            />
            {errors.correo && (
              <p className="text-sm text-red-500 mt-1">{errors.correo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol <span className="text-red-500">*</span></Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger id="rol" className={errors.rol ? 'border-red-500' : ''}>
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
            {errors.rol && (
              <p className="text-sm text-red-500 mt-1">{errors.rol}</p>
            )}
          </div>

          <PasswordInput
            value={formData.contrasena}
            onChange={handleChange}
            label="Contraseña"
            placeholder="Ingrese contraseña segura"
            showValidation={true}
            required={true}
            error={errors.contrasena}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setFormData({ nombre: '', correo: '', contrasena: '', rol: '' });
              setErrors({ nombre: '', correo: '', contrasena: '', rol: '' });
              onOpenChange(false);
            }}
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