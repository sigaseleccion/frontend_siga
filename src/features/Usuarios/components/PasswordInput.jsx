'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export const PasswordInput = ({ 
  value, 
  onChange, 
  label = 'Contraseña',
  placeholder = 'Ingrese contraseña',
  showValidation = true,
  required = true,
  name = 'contrasena',
  error = '' // Nueva prop para mostrar errores
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    isValid: false
  });

  useEffect(() => {
    if (!value || !showValidation) {
      setValidation({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        isValid: false
      });
      return;
    }

    const newValidation = {
      minLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value)
    };

    newValidation.isValid = Object.values(newValidation).every(v => v === true);
    setValidation(newValidation);
  }, [value, showValidation]);

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-gray-600'}>{text}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={
            error 
              ? 'border-red-500' 
              : showValidation && value 
                ? (validation.isValid ? 'border-green-500' : 'border-red-500') 
                : ''
          }
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {showValidation && value && !error && (
        <div className="space-y-1 rounded-md border bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">La contraseña debe cumplir:</p>
          <ValidationItem isValid={validation.minLength} text="Mínimo 8 caracteres" />
          <ValidationItem isValid={validation.hasUpperCase} text="Al menos 1 letra mayúscula" />
          <ValidationItem isValid={validation.hasLowerCase} text="Al menos 1 letra minúscula" />
          <ValidationItem isValid={validation.hasNumber} text="Al menos 1 número" />
        </div>
      )}
    </div>
  );
};