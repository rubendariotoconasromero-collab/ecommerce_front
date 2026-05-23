<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-5">
      <div>
        <BaseBadge variant="info" soft class="mb-2 px-3 py-1 rounded-pill sol-fw-800">Panel de Control</BaseBadge>
        <h2 class="sol-page-title">Configuración del Sistema</h2>
        <p class="sol-page-subtitle">Personaliza la información corporativa y el contenido de la landing pública.</p>
      </div>
      <BaseButton variant="brand" class="rounded-pill px-5 py-2 sol-fw-800 sol-shadow-brand" :loading="loading" @click="saveSettings">
        <i class="fa-solid fa-floppy-disk me-2"></i> Guardar Cambios
      </BaseButton>
    </div>

    <div class="row g-4">
      <!-- Información General -->
      <div class="col-md-6">
        <div class="sol-config-section h-100">
          <div class="sol-config-section__title">
            <i class="fa-solid fa-building"></i> Información General
          </div>
          <div class="d-flex flex-column gap-3">
            <BaseInput v-model="form.company_name" label="Nombre de la Empresa" placeholder="Ej: SOLUPLAST S.A." />
            <BaseInput v-model="form.email" label="Email de Contacto" type="email" placeholder="contacto@soluplast.com" />
            <BaseInput v-model="form.phone" label="Teléfono" placeholder="+591 000 0000" />
            <div>
              <label class="form-label">Dirección Física</label>
              <textarea v-model="form.address" class="form-control sol-textarea" rows="2" placeholder="Calle, Ciudad, País"></textarea>
            </div>
            <BaseInput v-model="form.footer_text" label="Texto del Footer" placeholder="© 2026 SOLUPLAST. Todos los derechos reservados." />
          </div>
        </div>
      </div>

      <!-- Redes Sociales -->
      <div class="col-md-6">
        <div class="sol-config-section h-100">
          <div class="sol-config-section__title">
            <i class="fa-solid fa-share-nodes"></i> Redes Sociales
          </div>
          <div class="d-flex flex-column gap-3">
            <BaseInput v-model="form.facebook_url" label="Facebook URL" type="url" placeholder="https://facebook.com/soluplast" />
            <BaseInput v-model="form.instagram_url" label="Instagram URL" type="url" placeholder="https://instagram.com/soluplast" />
            <BaseInput v-model="form.whatsapp" label="WhatsApp (Número)" placeholder="5917XXXXXXXX" />
          </div>
        </div>
      </div>

      <!-- Sección Hero -->
      <div class="col-12">
        <div class="sol-config-section">
          <div class="sol-config-section__title">
            <i class="fa-solid fa-panorama"></i> Sección Hero — Cabecera de la Landing
          </div>
          <div class="row g-4">
            <div class="col-md-8">
              <div class="d-flex flex-column gap-3">
                <BaseInput v-model="form.hero_title" label="Título Principal" placeholder="Ej: Soluciones Plásticas de Alta Ingeniería" />
                <BaseInput v-model="form.hero_subtitle" label="Subtítulo / Slogan" placeholder="Ej: Calidad e innovación en materiales plásticos" />
                <div>
                  <label class="form-label">Imagen de Fondo (Hero)</label>
                  <input type="file" @change="onFileChange($event, 'hero')" class="form-control" accept="image/*">
                  <p class="sol-smallest text-muted mt-1">Recomendado: 1920×1080px — Máx: 2MB</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 d-flex align-items-center justify-content-center">
              <div v-if="previewHero || form.hero_image_url" class="w-100">
                <p class="sol-smallest text-muted mb-2 sol-fw-800 text-uppercase">Vista Previa Hero</p>
                <img :src="previewHero || form.hero_image_url" class="rounded-3 shadow-sm w-100" style="max-height: 200px; object-fit: cover;">
              </div>
              <div v-else class="w-100 text-center p-4 rounded-3 bg-light border d-flex flex-column align-items-center gap-2">
                <i class="fa-solid fa-image text-muted" style="font-size: 2.5rem; opacity: 0.3;"></i>
                <p class="sol-smallest text-muted mb-0">Sin imagen de Hero</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Sobre Nosotros -->
      <div class="col-12">
        <div class="sol-config-section">
          <div class="sol-config-section__title">
            <i class="fa-solid fa-people-group"></i> Sección Sobre Nosotros
          </div>
          <div class="row g-4">
            <div class="col-md-8">
              <div class="d-flex flex-column gap-3">
                <BaseInput v-model="form.about_title" label="Título de la Sección" placeholder="Ej: Nuestra Historia y Compromiso" />
                <div>
                  <label class="form-label">Descripción / Texto</label>
                  <textarea v-model="form.about_description" class="form-control sol-textarea" rows="4"
                    placeholder="Describe tu empresa, misión y valores..."></textarea>
                </div>
                <div>
                  <label class="form-label">Imagen Lateral (Nosotros)</label>
                  <input type="file" @change="onFileChange($event, 'about')" class="form-control" accept="image/*">
                  <p class="sol-smallest text-muted mt-1">Recomendado: 800×600px — Máx: 2MB</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 d-flex align-items-center justify-content-center">
              <div v-if="previewAbout || form.about_image_url" class="w-100">
                <p class="sol-smallest text-muted mb-2 sol-fw-800 text-uppercase">Vista Previa Nosotros</p>
                <img :src="previewAbout || form.about_image_url" class="rounded-3 shadow-sm w-100" style="max-height: 200px; object-fit: cover;">
              </div>
              <div v-else class="w-100 text-center p-4 rounded-3 bg-light border d-flex flex-column align-items-center gap-2">
                <i class="fa-solid fa-image text-muted" style="font-size: 2.5rem; opacity: 0.3;"></i>
                <p class="sol-smallest text-muted mb-0">Sin imagen de Nosotros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante de guardado al final -->
    <div class="d-flex justify-content-end mt-4">
      <BaseButton variant="brand" class="rounded-pill px-5 py-2 sol-fw-800 sol-shadow-brand" :loading="loading" @click="saveSettings">
        <i class="fa-solid fa-floppy-disk me-2"></i> Guardar Todos los Cambios
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../plugins/axios'
import Swal from 'sweetalert2'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'

const loading = ref(false)
const form = ref({
  company_name: '',
  email: '',
  phone: '',
  address: '',
  facebook_url: '',
  instagram_url: '',
  whatsapp: '',
  hero_title: '',
  hero_subtitle: '',
  hero_image_url: null,
  about_title: '',
  about_description: '',
  about_image_url: null,
  footer_text: ''
})

const heroFile = ref(null)
const aboutFile = ref(null)
const previewHero = ref(null)
const previewAbout = ref(null)

const fetchSettings = async () => {
  try {
    const response = await api.get('/settings')
    form.value = { ...response.data }
  } catch (error) {
    console.error('Error al cargar la configuración:', error)
  }
}

const onFileChange = (event, type) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    if (type === 'hero') {
      heroFile.value = file
      previewHero.value = e.target.result
    } else {
      aboutFile.value = file
      previewAbout.value = e.target.result
    }
  }
  reader.readAsDataURL(file)
}

const saveSettings = async () => {
  loading.value = true
  const formData = new FormData()
  const skipFields = ['hero_image_url', 'about_image_url', 'id', 'created_at', 'updated_at', 'hero_image_path', 'about_image_path']
  Object.keys(form.value).forEach(key => {
    if (form.value[key] !== null && !skipFields.includes(key)) {
      formData.append(key, form.value[key])
    }
  })
  if (heroFile.value) formData.append('hero_image', heroFile.value)
  if (aboutFile.value) formData.append('about_image', aboutFile.value)

  try {
    await api.post('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Configuración actualizada correctamente.', timer: 2200, showConfirmButton: false })
    heroFile.value = null
    aboutFile.value = null
    previewHero.value = null
    previewAbout.value = null
    await fetchSettings()
  } catch (error) {
    console.error('Error al guardar:', error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la configuración.' })
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchSettings() })
</script>
