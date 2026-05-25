<template>
  <div class="animate__animated animate__fadeIn">
    <!-- VISTA 1: LISTADO DE ROLES -->
    <div v-if="!showForm">
      <!-- Encabezado -->
      <div class="sol-page-header mb-3">
        <div>
          <h2 class="sol-page-title">Roles y Permisos</h2>
          <p class="sol-page-subtitle">Define niveles de acceso y protocolos de seguridad para el personal.</p>
        </div>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openForm(null)">
          <i class="fa-solid fa-plus me-2"></i> Nuevo Rol
        </BaseButton>
      </div>

      <!-- Grid de Roles -->
      <BaseDataGrid
        :items="roles"
        :columns="gridColumns"
        :loading="isLoading"
        title-key="name"
        main-col-label="ROL"
        compact
        search-placeholder="Buscar por nombre o descripción de rol..."
        empty-title="No hay roles registrados"
        empty-icon="fa-solid fa-shield-slash"
        @edit="openForm"
        @search="handleSearch"
      >
        <!-- Columna Permisos -->
        <template #col-permissions_count="{ item }">
          <span class="badge rounded-pill bg-light border text-dark px-3 py-1 sol-fw-800 sol-smallest">
            {{ item.permissions?.length || 0 }} permisos
          </span>
        </template>

        <!-- Columna Usuarios -->
        <template #col-users_count="{ value }">
          <div class="d-flex align-items-center justify-content-center text-muted sol-smaller sol-fw-800">
            <i class="fa-solid fa-users-gear me-2 opacity-50"></i>
            {{ value || 0 }} operarios
          </div>
        </template>

        <!-- Estado -->
        <template #item-status="{ item }">
          <span
            class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase sol-tracking-tight border d-inline-flex align-items-center justify-content-center"
            :class="item.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'"
            style="width: 115px;"
          >
            <i class="fa-solid me-1" :class="item.is_active ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </span>
        </template>

        <!-- Acciones -->
        <template #item-actions="{ item }">
          <li>
            <button class="dropdown-item rounded-3 py-2 small" @click="openForm(item)">
              <i class="fa-regular fa-pen-to-square me-2 text-primary"></i>Editar Rol
            </button>
          </li>
          <li><hr class="dropdown-divider mx-2 opacity-50"></li>
          <li v-if="item.is_active">
            <button class="dropdown-item text-danger rounded-3 py-2 small" @click="deactivateRole(item)">
              <i class="fa-solid fa-ban me-2"></i>Desactivar
            </button>
          </li>
          <li v-else>
            <button class="dropdown-item text-success rounded-3 py-2 small" @click="restoreRole(item)">
              <i class="fa-solid fa-circle-check me-2"></i>Activar
            </button>
          </li>
        </template>
      </BaseDataGrid>
    </div>

    <!-- VISTA 2: FORMULARIO DETALLADO DE ROLES & PERMISOS -->
    <div v-else class="animate__animated animate__fadeIn">
      <!-- Encabezado Formulario -->
      <div class="sol-page-header mb-4">
        <div class="d-flex align-items-center gap-3">
          <BaseButton variant="light" class="btn btn-light border shadow-sm rounded-circle d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px; padding: 0; flex-shrink: 0;" @click="showForm = false">
            <i class="fa-solid fa-arrow-left"></i>
          </BaseButton>
          <div>
            <h2 class="sol-page-title">{{ isEditing ? 'Editar Rol: ' + form.name : 'Crear Nuevo Rol' }}</h2>
            <p class="sol-page-subtitle">Define qué acciones y secciones del sistema tiene permitido usar este rol.</p>
          </div>
        </div>
      </div>

      <!-- Tarjeta del Formulario -->
      <div class="card border-0 rounded-4 shadow-sm p-4 bg-body">
        <form @submit.prevent="saveRole" id="roleForm">
          <div class="mb-4 col-12 col-md-6">
            <BaseInput v-model="form.name" label="Nombre del Rol"
              placeholder="Ej: Gestor de Logística" required />
          </div>

          <div class="sol-section-divider mb-4">Permisos de Acceso</div>

          <div class="row g-4">
            <div v-for="(perms, module) in permissionsGrouped" :key="module" class="col-12 col-md-6 col-lg-4">
              <div class="sol-config-section sol-hover-white sol-hover-lift h-100 p-4" style="transition: all 0.25s ease;">
                <p class="sol-config-section__title mb-3 pb-2">
                  <i class="fa-solid fa-layer-group text-primary me-2"></i>{{ module }}
                </p>
                <div class="d-flex flex-column gap-3">
                  <div v-for="permission in perms" :key="permission.id" class="form-check sol-checkbox d-flex align-items-center">
                    <input
                      class="form-check-input shadow-none me-2 mt-0"
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
          
          <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
            <BaseButton variant="light" class="rounded-pill px-4" @click="showForm = false">Cancelar</BaseButton>
            <BaseButton type="submit" variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="isSaving">
              <i class="fa-solid fa-floppy-disk me-2"></i> {{ isEditing ? 'Guardar Cambios' : 'Crear Rol' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert, showBackendError } from '../plugins/swal';
import Swal from 'sweetalert2';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';

const roles = ref([]);
const permissionsGrouped = ref({});
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showForm = ref(false);

const gridColumns = [
  { label: 'PERMISOS ASIGNADOS', key: 'permissions_count', align: 'center' },
  { label: 'USUARIOS ASIGNADOS', key: 'users_count', align: 'center' }
];

const form = reactive({ id: null, name: '', permissions: [] });

const searchQuery = ref('');
let debounceTimeout = null;

const handleSearch = (value) => {
  searchQuery.value = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchData();
  }, 450);
};

onMounted(() => { fetchData(); });

const fetchData = async () => {
  isLoading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    const [rolesRes, permsRes] = await Promise.all([
      api.get('/roles', { params }),
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

const openForm = (role = null) => {
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
  showForm.value = true;
};

const saveRole = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/roles/${form.id}`, form);
    } else {
      await api.post('/roles', form);
    }
    showForm.value = false;
    fetchData();
    Toast.fire({ icon: 'success', title: 'Protocolo de seguridad actualizado' });
  } catch (error) {
    showBackendError(error, 'Error al guardar rol');
  } finally {
    isSaving.value = false;
  }
};

const deactivateRole = async (role) => {
  if (role.slug === 'super-admin') {
    return Swal.fire({
      title: 'Rol Protegido',
      text: 'El rol de control total no puede ser desactivado.',
      icon: 'info',
      confirmButtonColor: 'var(--sol-color-primary)'
    });
  }
  const result = await ConfirmAlert.fire({
    title: '¿Desactivar rol?',
    text: `El rol "${role.name}" quedará inactivo.`,
    confirmButtonText: 'Sí, desactivar',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/roles/${role.id}`);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Rol desactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al desactivar el rol');
    }
  }
};

const restoreRole = async (role) => {
  const result = await ConfirmAlert.fire({
    title: '¿Activar rol?',
    text: `El rol "${role.name}" volverá a estar disponible.`,
    confirmButtonText: 'Sí, activar',
  });
  if (result.isConfirmed) {
    try {
      await api.patch(`/roles/${role.id}/restore`);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Rol reactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al activar el rol');
    }
  }
};
</script>