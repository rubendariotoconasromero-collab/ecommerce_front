import Swal from 'sweetalert2';

// 1. Alerta tipo Toast (Pequeña notificación en la esquina superior derecha)
// Ideal para "Usuario guardado" o "Error temporal" sin interrumpir al usuario.
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

// 2. Alerta de Confirmación Base (Centrada, con botones adaptados a tu tema)
// Ideal para "¿Estás seguro de eliminar esto?"
export const ConfirmAlert = Swal.mixin({
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#d33', // Rojo para acciones destructivas
  cancelButtonColor: '#6b7280', // Gris muteado para cancelar
  confirmButtonText: 'Sí, continuar',
  cancelButtonText: 'Cancelar',
  customClass: {
    // Le aplicamos las clases de Bootstrap/nuestro tema a los botones de Swal
    confirmButton: 'btn btn-danger px-4 mx-2',
    cancelButton: 'btn btn-secondary px-4 mx-2'
  },
  buttonsStyling: false // Desactiva los estilos por defecto de Swal para usar los de Bootstrap
});

// 3. Alerta de Error del Backend
// Extrae de forma robusta mensajes de validación y de excepción del backend
export const showBackendError = (error, defaultTitle = 'Error en la operación') => {
  let errorMsg = '';
  if (error.response?.data?.errors) {
    errorMsg = Object.values(error.response.data.errors).flat().join('<br>');
  } else if (error.response?.data?.message) {
    errorMsg = error.response.data.message;
  } else if (error.response?.data?.error) {
    errorMsg = error.response.data.error;
  } else {
    errorMsg = error.message || 'Fallo de conexión o error interno del servidor.';
  }
  
  Swal.fire({
    icon: 'error',
    title: defaultTitle,
    html: `<div class="text-start p-2" style="font-size: 0.85rem; line-height: 1.5; font-family: inherit; max-height: 250px; overflow-y: auto;">${errorMsg}</div>`,
    confirmButtonColor: 'var(--sol-color-primary)',
    customClass: {
      confirmButton: 'btn btn-primary px-5 rounded-pill'
    },
    buttonsStyling: false
  });
};

export default Swal;