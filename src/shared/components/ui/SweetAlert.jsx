import Swal from 'sweetalert2';

//Alerta base con estilos personalizados
const baseSwal = Swal.mixin({
  confirmButtonColor: '#292dff',
  cancelButtonColor: '#d33',
  reverseButtons: true,
  buttonsStyling: true,
});

//Alerta de confirmación
export const confirmAlert = ({
  title = '¿Estás seguro?',
  text = 'Esta acción es irreversible.',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  icon = 'warning',
}) => {
  return baseSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

//Alerta de éxito
export const successAlert = ({
  title = 'Éxito',
  text = 'La operación se realizó correctamente.',
}) => {
  return baseSwal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Aceptar',
  });
};

export const warningAlert = ({ title, text }) => {
  return baseSwal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'Aceptar',
  });
};

//Alerta de error
export const errorAlert = ({
  title = 'Error',
  text = 'Ocurrió un error inesperado.',
}) => {
  return baseSwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Aceptar',
  });
};
