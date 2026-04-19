<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-0">Gestión de Usuarios</h3>
        <p class="text-muted-custom small mb-0">Administra los accesos y cuentas del sistema</p>
      </div>
      <button class="btn btn-brand" @click="openModal(null)">
        <i class="bi bi-person-plus me-2"></i>Nuevo Usuario
      </button>
    </div>

    <div class="card card-custom">
      <div class="card-body p-0">
        
        <div v-if="isLoadingData" class="text-center py-5">
          <div class="spinner-border text-brand" role="status"></div>
          <p class="mt-2 text-muted-custom small">Cargando usuarios...</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small">
              <tr>
                <th class="ps-4">NOMBRE / EMPRESA</th>
                <th>CORREO</th>
                <th>ROLES</th>
                <th>ESTADO</th>
                <th class="text-end pe-4">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No hay usuarios registrados.</td>
              </tr>

              <tr v-for="user in users" :key="user.id">
                <td class="ps-4">
                  <div class="fw-bold">{{ user.name }}</div>
                  <div class="small text-muted" v-if="user.customer_type === 'company'">
                    <i class="bi bi-building me-1"></i>{{ user.business_name || 'Sin Razón Social' }}
                  </div>
                  <div class="small text-muted" v-else>
                    <i class="bi bi-person me-1"></i>Individual
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span v-for="role in user.roles" :key="role.id" class="badge bg-secondary me-1">
                    {{ role.name }}
                  </span>
                  <span v-if="!user.roles || user.roles.length === 0" class="text-muted small">Sin Rol</span>
                </td>
                <td>
                  <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-danger'">
                    {{ user.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-light text-primary me-2" @click="openModal(user)" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger" @click="deleteUser(user.id)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-bottom-0">
            <h5 class="modal-title fw-bold">{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <form @submit.prevent="saveUser">
            <div class="modal-body p-4">
              
              <div v-if="errorMessage" class="alert alert-danger small py-2">{{ errorMessage }}</div>

              <div class="row g-3">
                
                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">TIPO DE CUENTA</label>
                  <select class="form-select form-control-custom" v-model="form.customer_type">
                    <option value="individual">Persona Individual (B2C)</option>
                    <option value="company">Empresa (B2B)</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-muted">NOMBRE COMPLETO</label>
                  <input type="text" class="form-control form-control-custom" v-model="form.name" required>
                </div>

                <div class="col-12 col-md-6" v-if="form.customer_type === 'company'">
                  <label class="form-label small fw-bold text-muted">RAZÓN SOCIAL</label>
                  <input type="text" class="form-control form-control-custom" v-model="form.business_name" required>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">CORREO ELECTRÓNICO</label>
                  <input type="email" class="form-control form-control-custom" v-model="form.email" required>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">
                    CONTRASEÑA <span v-if="isEditing" class="text-primary fw-normal">(Dejar en blanco para no cambiar)</span>
                  </label>
                  <input type="password" class="form-control form-control-custom" v-model="form.password" :required="!isEditing">
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">ROLES DEL SISTEMA</label>
                  <select class="form-select form-control-custom" v-model="form.roles" multiple style="height: 100px;">
                    <option v-for="role in rolesList" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </option>
                  </select>
                  <div class="form-text small">Presiona Ctrl (o Cmd) para seleccionar múltiples.</div>
                </div>

                <div class="col-12" v-if="isEditing">
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" role="switch" id="activeSwitch" v-model="form.is_active">
                    <label class="form-check-label" for="activeSwitch">Usuario Activo en el Sistema</label>
                  </div>
                </div>

              </div>
            </div>
            
            <div class="modal-footer border-top-0 bg-light">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-brand" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSaving ? 'Guardando...' : 'Guardar Usuario' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Toast, ConfirmAlert } from '../plugins/swal';
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Modal } from 'bootstrap'; // Importamos la clase Modal de Bootstrap

// Variables de Estado
const users = ref([]);
const rolesList = ref([]);
const isLoadingData = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const errorMessage = ref('');
let bootstrapModalInstance = null;

// Objeto reactivo para el formulario
const form = reactive({
  id: null,
  customer_type: 'individual',
  name: '',
  business_name: '',
  email: '',
  password: '',
  roles: [], // Array de IDs
  is_active: true
});

// Al montar el componente, cargamos datos e instanciamos el Modal
onMounted(() => {
  bootstrapModalInstance = new Modal(document.getElementById('userModal'));
  fetchUsers();
  fetchRoles();
});

// Función para obtener usuarios de Laravel
const fetchUsers = async () => {
  isLoadingData.value = true;
  try {
    const response = await api.get('/users');
    // Laravel paginate() devuelve los datos dentro de .data
    users.value = response.data.data || response.data; 
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  } finally {
    isLoadingData.value = false;
  }
};

// Función para obtener la lista de roles disponibles
const fetchRoles = async () => {
  try {
    const response = await api.get('/roles');
    rolesList.value = response.data;
  } catch (error) {
    console.error("Error cargando roles:", error);
  }
};

// Abrir Modal para Crear (data = null) o Editar (data = usuario)
const openModal = (userData) => {
  errorMessage.value = '';
  
  if (userData) {
    isEditing.value = true;
    form.id = userData.id;
    form.customer_type = userData.customer_type;
    form.name = userData.name;
    form.business_name = userData.business_name || '';
    form.email = userData.email;
    form.password = ''; // Nunca mostramos el hash, se deja vacío
    form.is_active = userData.is_active;
    // Extraemos solo los IDs de los roles que tiene el usuario
    form.roles = userData.roles ? userData.roles.map(r => r.id) : [];
  } else {
    isEditing.value = false;
    form.id = null;
    form.customer_type = 'individual';
    form.name = '';
    form.business_name = '';
    form.email = '';
    form.password = '';
    form.is_active = true;
    form.roles = [];
  }
  
  bootstrapModalInstance.show();
};

// Guardar (POST) o Actualizar (PUT)
const saveUser = async () => {
  isSaving.value = true;
  errorMessage.value = '';

  try {
    if (isEditing.value) {
      await api.put(`/users/${form.id}`, form);
    } else {
      await api.post('/users', form);
    }
    
    bootstrapModalInstance.hide();
    fetchUsers(); 
    
    // Alerta de Éxito tipo Toast (No bloquea la pantalla)
    Toast.fire({
      icon: 'success',
      title: isEditing.value ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito'
    });
    
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errorMessage.value = Object.values(error.response.data.errors)[0][0];
    } else {
      // Alerta de Error tipo Toast
      Toast.fire({
        icon: 'error',
        title: 'Error al guardar el usuario'
      });
    }
  } finally {
    isSaving.value = false;
  }
};

// Eliminar Usuario (Con SweetAlert2)
const deleteUser = async (id, userName) => { // Pasamos también el nombre para una alerta más personalizada
  
  // Usamos el mixin de confirmación
  const result = await ConfirmAlert.fire({
    title: '¿Eliminar Usuario?',
    text: `Estás a punto de eliminar a "${userName}". Esta acción desactivará su acceso.`,
    confirmButtonText: 'Sí, eliminar',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(); 
      
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El usuario ha sido eliminado del sistema.',
        confirmButtonColor: '#4f46e5' // El color de tu marca (brand-primary)
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un problema al intentar eliminar el usuario.',
        confirmButtonColor: '#4f46e5'
      });
    }
  }
};
</script>