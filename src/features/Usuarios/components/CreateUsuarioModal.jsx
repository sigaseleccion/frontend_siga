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
import { Eye, EyeOff } from 'lucide-react';
import { crearUsuario } from '../services/usuarioService.js';

export const CreateUsuarioModal = ({ open, onOpenChange, onSuccess, roles }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: ''
  });

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

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.correo || !formData.contrasena || !formData.rol) {
      alert('Por favor complete todos los campos');
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
            <Label htmlFor="correo">Correo</Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="correo@empresa.com"
              value={formData.correo}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(rol => (
                  <SelectItem key={rol._id} value={rol._id}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="contrasena"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={formData.contrasena}
                onChange={handleChange}
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
