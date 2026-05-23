<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-5">
      <div>
        <BaseBadge variant="warning" soft class="mb-2 px-3 py-1 rounded-pill sol-fw-800">Políticas de Seguridad</BaseBadge>
        <h2 class="sol-page-title">Roles y Permisos</h2>
        <p class="sol-page-subtitle">Define niveles de acceso y protocolos de seguridad para el personal.</p>
      </div>
      <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
        <i class="fa-solid fa-shield-halved me-2"></i> Nuevo Rol
      </BaseButton>
    </div>

    <!-- Grid de Roles -->
    <BaseDataGrid
      :items="roles"
      :columns="gridColumns"
      :loading="isLoading"
      title-key="name"
      subtitle-key="slug"
      main-col-label="ROL / IDENTIFICADOR"
      empty-title="No hay roles registrados"
      empty-icon="fa-solid fa-shield-slash"
      @edit="openModal"
      @delete="deleteRole"
    >
      <!-- Columna Permisos -->
      <template #col-permissions_count="{ item }">
        <span class="badge rounded-pill bg-light border text-dark px-3 py-2 sol-fw-800 sol-smaller">
          <i class="fa-solid fa-key text-primary me-2"></i>
          <strong>{{ item.permissions?.length || 0 }}</strong> permisos
        </span>
      </template>

      <!-- Columna Usuarios -->
      <template #col-users_count="{ value }">
        <div class="d-flex align-items-center text-muted sol-smaller sol-fw-800">
          <i class="fa-solid fa-users-gear me-2 opacity-50"></i>
          {{ value || 0 }} operarios
        </div>
      </template>
    </BaseDataGrid>

    <!-- Modal de Rol -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Editar Rol' : 'Nuevo Rol'" size="lg">
      <form @submit.prevent="saveRole" id="roleForm" class="p-2">
        <div class="mb-4">
          <BaseInput v-model="form.name" label="Denominación del Rol"
            placeholder="Ej: Gestor de Logística" required />
        </div>

        <div class="sol-section-divider mb-4">Matriz de Permisos por Módulo</div>

        <div class="row g-4">
          <div v-for="(perms, module) in permissionsGrouped" :key="module" class="col-12 col-md-6">
            <div class="sol-config-section sol-hover-white sol-hover-lift h-100" style="transition: all 0.25s ease;">
              <p class="sol-config-section__title">
                <i class="fa-solid fa-layer-group"></i> {{ module }}
              </p>
              <div class="d-flex flex-column gap-2">
                <div v-for="permission in perms" :key="permission.id" class="form-check sol-checkbox">
                  <input
                    class="form-check-input shadow-none"
                    type="checkbox"
                    :id="'perm-' + permission.id"
                    :value="permission.id"
                    v-model="form.permissions"
                  >
                  <label class="form-check-label sol-smaller sol-cursor" :for="'perm-' + permission.id">
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
          <BaseButton type="submit" form="roleForm" variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="isSaving">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Rol' }}
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

const form = reactive({ id: null, name: '', permissions: [] });

onMounted(() => { fetchData(); });

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [rolesRes, permsRes] = await Promise.all([api.get('/roles'), api.get('/permissions')]);
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
    Toast.fire({ icon: 'error', title: 'Fallo al actualizar privilegios' });
  } finally {
    isSaving.value = false;
  }
};

const deleteRole = async (role) => {
  if (role.slug === 'super-admin') {
    return Swal.fire({
      title: 'Protocolo Protegido',
      text: 'El rol de control total no puede ser eliminado.',
      icon: 'info',
      confirmButtonColor: 'var(--sol-color-primary)'
    });
  }
  const result = await ConfirmAlert.fire({
    title: '¿Confirmar eliminación?',
    text: `Esta acción afectará los privilegios de ${role.users_count} usuarios.`
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/roles/${role.id}`);
      fetchData();
      Swal.fire({ title: 'Rol Eliminado', icon: 'success', confirmButtonColor: 'var(--sol-color-primary)' });
    } catch (error) {
      Swal.fire('Error', 'Fallo al eliminar el rol.', 'error');
    }
  }
};
</script>