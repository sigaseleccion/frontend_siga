import Swal from "sweetalert2";

//Alerta base con estilos personalizados
const baseSwal = Swal.mixin({
  buttonsStyling: false, // 👈 importante
  reverseButtons: true,
  customClass: {
    popup: 'rounded-full p-6 shadow-xl bg-white border border-gray-100',
    title: "text-xl font-semibold text-gray-800",
    htmlContainer: "text-gray-600 mt-2",
    actions: "mt-6 gap-4",
    confirmButton:
      "bg-[#292dff] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200",
    cancelButton:
      "bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200",
  },
});

//Alerta de confirmación
export const confirmAlert = ({
  title = "¿Estás seguro?",
  text = "Esta acción es irreversible.",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  icon = "warning",
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
  title = "Éxito",
  text = "La operación se realizó correctamente.",
}) => {
  return baseSwal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "Aceptar",
  });
};

export const warningAlert = ({ title, text }) => {
  return baseSwal.fire({
    title,
    text,
    icon: "warning",
    confirmButtonText: "Aceptar",
  });
};

//Alerta de error
export const errorAlert = ({
  title = "Error",
  text = "Ocurrió un error inesperado.",
}) => {
  return baseSwal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Aceptar",
  });
};
