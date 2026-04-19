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

export default Swal;