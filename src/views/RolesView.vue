<template>
  <div class="animate__animated animate__fadeIn">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
      <div>
        <BaseBadge variant="warning" soft class="mb-2 px-3 py-1 rounded-pill fw-bold">Políticas de Seguridad</BaseBadge>
        <h2 class="fw-800 mb-0 text-body-emphasis lh-1">Roles y Permisos</h2>
        <p class="text-body-secondary mt-2 mb-0">Define niveles de acceso y protocolos de seguridad para el personal.</p>
      </div>
      <BaseButton variant="brand" class="rounded-pill px-4 py-2 fw-bold shadow-brand-sm" @click="openModal(null)">
        <i class="fa-solid fa-shield-halved me-2"></i> Nuevo Rol Maestro
      </BaseButton>
    </div>

    <!-- BaseDataGrid for Roles -->
    <BaseDataGrid
      :items="roles"
      :columns="gridColumns"
      :loading="isLoading"
      title-key="name"
      subtitle-key="slug"
      main-col-label="ROL / IDENTIFICADOR"
      empty-title="Bóveda de roles vacía"
      empty-icon="fa-solid fa-shield-slash"
      @edit="openModal"
      @delete="deleteRole"
    >
      <!-- Permissions Count Column -->
      <template #col-permissions_count="{ item }">
        <div class="text-body-secondary small fw-bold">
          <span class="badge rounded-pill bg-light border text-dark px-3 py-2">
            <i class="fa-solid fa-key text-primary me-2"></i> <strong>{{ item.permissions?.length || 0 }}</strong> permisos
          </span>
        </div>
      </template>

      <!-- Users Count Column -->
      <template #col-users_count="{ value }">
        <div class="d-flex align-items-center text-body-secondary small fw-bold">
          <i class="fa-solid fa-users-gear me-2 opacity-50"></i>
          {{ value || 0 }} operarios
        </div>
      </template>
    </BaseDataGrid>

    <!-- Refactored with BaseModal -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Sincronizar Protocolo de Rol' : 'Generar Nuevo Rol Maestro'" size="lg">
      <form @submit.prevent="saveRole" id="roleForm" class="p-2">
        <div class="mb-5">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Denominación del Rol</label>
          <BaseInput v-model="form.name" placeholder="Ej: Gestor de Inteligencia Logística" required class="premium-input" />
        </div>

        <div class="premium-separator-text mb-4">Matriz de Permisos por Módulo</div>
        
        <div class="row g-4">
          <div v-for="(perms, module) in permissionsGrouped" :key="module" class="col-12 col-md-6">
            <div class="p-4 bg-light rounded-5 border h-100 transition-all hover-white shadow-hover-sm">
              <p class="fw-800 text-primary smaller text-uppercase tracking-wider mb-3 d-flex align-items-center gap-2">
                <i class="fa-solid fa-layer-group opacity-50"></i> {{ module }}
              </p>
              
              <div class="d-flex flex-column gap-2">
                <div v-for="permission in perms" :key="permission.id" class="form-check premium-checkbox">
                  <input 
                    class="form-check-input shadow-none" 
                    type="checkbox" 
                    :id="'perm-' + permission.id"
                    :value="permission.id"
                    v-model="form.permissions"
                  >
                  <label class="form-check-label fw-medium smaller text-body-emphasis cursor-pointer" :for="'perm-' + permission.id">
                    {{ permission.name }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" form="roleForm" variant="brand" class="rounded-pill px-5 shadow-brand-sm" :loading="isSaving">
            {{ isEditing ? 'Guardar Cambios' : 'Generar Rol' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert } from '../plugins/swal';
import Swal from 'sweetalert2';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseInput from '../components/base/BaseInput.vue';

const roles = ref([]);
const permissionsGrouped = ref({});
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);

const gridColumns = [
  { label: 'MAPA DE ACCESO', key: 'permissions_count', align: 'center' },
  { label: 'USUARIOS ASIGNADOS', key: 'users_count', align: 'center' }
];

const form = reactive({
  id: null,
  name: '',
  permissions: []
});

onMounted(() => {
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
    Toast.fire({ icon: 'error', title: 'Error de sincronización de seguridad' });
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
  showModal.value = true;
};

const saveRole = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/roles/${form.id}`, form);
    } else {
      await api.post('/roles', form);
    }
    
    showModal.value = false;
    fetchData();
    Toast.fire({ icon: 'success', title: 'Protocolo de seguridad actualizado' });
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Fallo crítico en actualización de privilegios' });
  } finally {
    isSaving.value = false;
  }
};

const deleteRole = async (role) => {
  if (role.slug === 'super-admin') {
    return Swal.fire({
      title: 'Protocolo Protegido',
      text: 'El rol de control total no puede ser purgado del sistema.',
      icon: 'info',
      confirmButtonColor: 'var(--color-primary)'
    });
  }

  const result = await ConfirmAlert.fire({
    title: '¿Confirmar purga de rol?',
    text: `Esta acción afectará los privilegios de ${role.users_count} operarios.`
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/roles/${role.id}`);
      fetchData();
      Swal.fire({
        title: 'Rol Depurado',
        icon: 'success',
        confirmButtonColor: 'var(--color-primary)'
      });
    } catch (error) {
      Swal.fire('Error', 'Fallo al purgar registro de seguridad.', 'error');
    }
  }
};
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.85rem; }
.smallest { font-size: 0.75rem; }
.tracking-tighter { letter-spacing: -0.02em; }
.tracking-wider { letter-spacing: 0.1em; }

.shadow-brand-sm {
  box-shadow: 0 10px 20px var(--color-primary-glass) !important;
}

.premium-separator-text {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-primary);
  opacity: 0.8;
}

.premium-separator-text::after {
  content: "";
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, var(--color-primary-soft), transparent);
  margin-left: 1.5rem;
}

.rounded-5 { border-radius: 2rem !important; }

.hover-white:hover {
  background: white !important;
}

.shadow-hover-sm:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.premium-checkbox .form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.4rem;
  border: 2px solid var(--border-light);
  cursor: pointer;
}

.premium-checkbox .form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.cursor-pointer { cursor: pointer; }
</style>