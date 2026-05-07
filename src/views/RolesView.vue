<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-0">Roles y Permisos</h3>
        <p class="text-muted-custom small mb-0">Define los niveles de acceso para el personal</p>
      </div>
      <button class="btn btn-brand" @click="openModal(null)">
        <i class="bi bi-shield-lock me-2"></i>Nuevo Rol
      </button>
    </div>

    <!-- BaseDataGrid for Roles -->
    <BaseDataGrid
      :items="roles"
      :columns="gridColumns"
      :loading="isLoading"
      title-key="name"
      subtitle-key="slug"
      main-col-label="ROL / IDENTIFICADOR"
      empty-title="No hay roles registrados"
      empty-icon="bi bi-shield-slash"
      @edit="openModal"
      @delete="deleteRole"
    >
      <!-- Permissions Count Column -->
      <template #col-permissions_count="{ item }">
        <div class="text-muted small">
          <strong>{{ item.permissions?.length || 0 }}</strong> permisos asignados
        </div>
      </template>

      <!-- Users Count Column -->
      <template #col-users_count="{ value }">
        <div class="d-flex align-items-center text-muted small">
          <i class="bi bi-people me-2"></i>
          {{ value || 0 }} usuarios
        </div>
      </template>
    </BaseDataGrid>

    <div class="modal fade" id="roleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-0">
            <h5 class="modal-title fw-bold">{{ isEditing ? 'Editar Rol' : 'Nuevo Rol' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="saveRole">
            <div class="modal-body p-4">
              <div class="mb-4">
                <label class="form-label small fw-bold">NOMBRE DEL ROL</label>
                <input type="text" class="form-control form-control-custom" v-model="form.name" placeholder="Ej: Supervisor de Producción" required>
              </div>

              <h6 class="fw-bold mb-3 border-bottom pb-2">Asignar Permisos por Módulo</h6>
              
              <div class="row g-4">
                <div v-for="(perms, module) in permissionsGrouped" :key="module" class="col-12 col-md-6">
                  <div class="p-3 bg-light rounded-3 h-100">
                    <p class="fw-bold text-brand small mb-3 text-uppercase">{{ module }}</p>
                    
                    <div v-for="permission in perms" :key="permission.id" class="form-check mb-2">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :id="'perm-' + permission.id"
                        :value="permission.id"
                        v-model="form.permissions"
                      >
                      <label class="form-check-label small" :for="'perm-' + permission.id">
                        {{ permission.name }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="modal-footer border-0 bg-light">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-brand" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                Guardar Rol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Modal } from 'bootstrap';
import { Toast, ConfirmAlert } from '../plugins/swal';
import Swal from 'sweetalert2';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';

const roles = ref([]);
const permissionsGrouped = ref({});
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
let modalInstance = null;

const gridColumns = [
  { label: 'PERMISOS', key: 'permissions_count', align: 'center' },
  { label: 'USUARIOS', key: 'users_count', align: 'center' }
];

const form = reactive({
  id: null,
  name: '',
  permissions: [] // Array de IDs seleccionados
});

onMounted(() => {
  modalInstance = new Modal(document.getElementById('roleModal'));
  fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [rolesRes, permsRes] = await Promise.all([
      api.get('/roles'),
      api.get('/permissions')
    ]);
    roles.value = rolesRes.data;
    permissionsGrouped.value = permsRes.data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const openModal = (role = null) => {
  if (role) {
    isEditing.value = true;
    form.id = role.id;
    form.name = role.name;
    form.permissions = role.permissions ? role.permissions.map(p => p.id) : [];
  } else {
    isEditing.value = false;
    form.id = null;
    form.name = '';
    form.permissions = [];
  }
  modalInstance.show();
};

const saveRole = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/roles/${form.id}`, form);
    } else {
      await api.post('/roles', form);
    }
    
    modalInstance.hide();
    fetchData();
    Toast.fire({ icon: 'success', title: 'Rol guardado correctamente' });
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al procesar la solicitud' });
  } finally {
    isSaving.value = false;
  }
};

const deleteRole = async (role) => {
  if (role.slug === 'super-admin') {
    return Swal.fire('Acción Protegida', 'No puedes eliminar el rol de control total.', 'info');
  }

  const result = await ConfirmAlert.fire({
    title: '¿Eliminar Rol?',
    text: `Esto afectará a ${role.users_count} usuarios que tienen este rol.`
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/roles/${role.id}`);
      fetchData();
      Swal.fire('Eliminado', 'El rol ha sido removido.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el rol.', 'error');
    }
  }
};
</script>