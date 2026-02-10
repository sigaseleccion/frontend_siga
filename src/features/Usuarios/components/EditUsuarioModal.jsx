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
import { successAlert, errorAlert } from '../../../shared/components/ui/SweetAlert';

export const EditUsuarioModal = ({ open, onOpenChange, usuario, onSuccess, roles }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: '',
    activo: true
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: ''
  });

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filtrar solo roles activos
  const rolesActivos = roles.filter(rol => rol.activo !== false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        correo: usuario.correo || '',
        contrasena: '',
        confirmarContrasena: '',
        rol: usuario.rol?._id || usuario.rol || '',
        activo: usuario.activo !== false
      });
      setErrors({ nombre: '', correo: '', contrasena: '', confirmarContrasena: '', rol: '' });
      setShowConfirmPassword(false);
    }
  }, [usuario, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mostrar campo de confirmar contraseña cuando se detecta cambio en contraseña
    if (name === 'contrasena' && value.length > 0) {
      setShowConfirmPassword(true);
    } else if (name === 'contrasena' && value.length === 0) {
      setShowConfirmPassword(false);
      setFormData(prev => ({
        ...prev,
        confirmarContrasena: ''
      }));
    }

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
    if (errors.rol) {
      setErrors(prev => ({
        ...prev,
        rol: ''
      }));
    }
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

  const validateForm = () => {
    const newErrors = {
      nombre: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
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

    if (formData.contrasena && !validatePassword(formData.contrasena)) {
      newErrors.contrasena = 'La contraseña no cumple con los requisitos de seguridad';
      isValid = false;
    }

    // Validar que las contraseñas coincidan si se está cambiando la contraseña
    if (showConfirmPassword && formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
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
      
      setTimeout(() => {
        onSuccess();
        successAlert({
          title: 'Usuario actualizado',
          text: 'El usuario se ha actualizado exitosamente'
        });
      }, 100);
      
    } catch (error) {
      errorAlert({
        title: 'Error',
        text: 'Error al actualizar usuario: ' + error.message
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
            Editar Usuario
          </DialogTitle>
          <DialogDescription>
            Modifique los datos del usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nombre">Nombre <span className="text-red-500">*</span></Label>
            <Input
              id="edit-nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-correo">Correo <span className="text-red-500">*</span></Label>
            <Input
              id="edit-correo"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              className={errors.correo ? 'border-red-500' : ''}
            />
            {errors.correo && (
              <p className="text-sm text-red-500 mt-1">{errors.correo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rol">Rol <span className="text-red-500">*</span></Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger id="edit-rol" className={errors.rol ? 'border-red-500' : ''}>
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
            label="Nueva Contraseña"
            placeholder="Dejar vacío para mantener la actual"
            showValidation={!!formData.contrasena}
            required={false}
            error={errors.contrasena}
          />

          {showConfirmPassword && (
            <div className="space-y-2">
              <Label htmlFor="edit-confirmarContrasena">Confirmar Nueva Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="edit-confirmarContrasena"
                name="confirmarContrasena"
                type="password"
                placeholder="Vuelva a ingresar la contraseña"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                className={errors.confirmarContrasena ? 'border-red-500' : ''}
              />
              {errors.confirmarContrasena && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmarContrasena}</p>
              )}
              {!errors.confirmarContrasena && formData.confirmarContrasena && formData.contrasena === formData.confirmarContrasena && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">✓</span>
                  Las contraseñas coinciden
                </p>
              )}
            </div>
          )}

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
            onClick={() => {
              setErrors({ nombre: '', correo: '', contrasena: '', confirmarContrasena: '', rol: '' });
              setShowConfirmPassword(false);
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
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
