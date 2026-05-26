<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-3">
      <div>
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
              <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Dirección Física</label>
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

          <!-- Textos del hero -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <BaseInput v-model="form.hero_title" label="Título Principal" placeholder="Ej: Soluciones Plásticas de Alta Ingeniería" />
            </div>
            <div class="col-md-6">
              <BaseInput v-model="form.hero_subtitle" label="Subtítulo / Slogan" placeholder="Ej: Calidad e innovación en materiales plásticos" />
            </div>
          </div>

          <!-- Slider de 3 imágenes -->
          <div class="mb-2">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-3">
              <i class="fa-solid fa-images me-1"></i> Imágenes del Slider Hero (hasta 3)
            </label>
            <p class="smaller text-muted mb-3">
              Las imágenes se irán alternando automáticamente cada 5 segundos en el slider del hero.
              Recomendado: 900×700px o mayor, fondo neutro o transparente. Máx: 4MB por imagen.
            </p>
          </div>

          <div class="row g-3">
            <div class="col-lg-4" v-for="slot in heroSlots" :key="slot.key">
              <div class="hero-img-slot" :class="{ 'has-image': slot.previewUrl }">
                <!-- Badge número -->
                <div class="slot-badge">{{ slot.label }}</div>

                <!-- Preview actual -->
                <div v-if="slot.previewUrl" class="slot-preview">
                  <img :src="slot.previewUrl" :alt="slot.label" class="slot-img">
                  <button
                    type="button"
                    class="slot-remove-btn"
                    @click="removeSlotImage(slot)"
                    title="Eliminar imagen"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <!-- Área de upload vacía -->
                <label v-else class="slot-upload-area" :for="`hero-file-${slot.key}`">
                  <i class="fa-solid fa-cloud-arrow-up mb-2" style="font-size: 2rem; opacity: 0.3;"></i>
                  <span class="smaller fw-semibold text-muted">Clic para subir imagen</span>
                  <span class="sol-smallest text-muted opacity-60">JPG, PNG, WEBP — Máx 4MB</span>
                </label>

                <input
                  :id="`hero-file-${slot.key}`"
                  type="file"
                  class="d-none"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  @change="onHeroFileChange($event, slot)"
                >

                <!-- Si ya tiene imagen, botón de reemplazar -->
                <div v-if="slot.previewUrl" class="slot-replace-bar">
                  <label :for="`hero-file-${slot.key}`" class="btn btn-sm btn-outline-secondary rounded-pill px-3 cursor-pointer mb-0 w-100">
                    <i class="fa-solid fa-arrow-up-from-bracket me-1"></i> Reemplazar
                  </label>
                </div>
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
                  <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Descripción / Texto</label>
                  <textarea v-model="form.about_description" class="form-control sol-textarea" rows="4"
                    placeholder="Describe tu empresa, misión y valores..."></textarea>
                </div>
                <div>
                  <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Imagen Lateral (Nosotros)</label>
                  <input type="file" @change="onFileChange($event, 'about')" class="form-control" accept="image/*">
                  <p class="sol-smallest text-muted mt-1">Recomendado: 800×600px — Máx: 4MB</p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../plugins/axios'
import Swal from 'sweetalert2'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const loading = ref(false)
const form = ref({
  company_name: '', email: '', phone: '', address: '',
  facebook_url: '', instagram_url: '', whatsapp: '',
  hero_title: '', hero_subtitle: '',
  hero_image_url: null, hero_image_2_url: null, hero_image_3_url: null,
  about_title: '', about_description: '',
  about_image_url: null, footer_text: ''
})

// Archivos de las 3 imágenes hero (nuevos uploads)
const heroFiles = reactive({ hero: null, hero2: null, hero3: null })
// Flags para eliminar imágenes del slider
const removeFlags = reactive({ hero: false, hero2: false, hero3: false })

const aboutFile   = ref(null)
const previewAbout = ref(null)

// Slots del slider: gestión reactiva de preview + file + remove
const heroSlots = computed(() => [
  {
    key:        'hero',
    label:      'Imagen 1',
    urlField:   'hero_image_url',
    fileKey:    'hero',
    previewUrl: removeFlags.hero ? null : (heroFiles.hero ? URL.createObjectURL(heroFiles.hero) : form.value.hero_image_url),
  },
  {
    key:        'hero2',
    label:      'Imagen 2',
    urlField:   'hero_image_2_url',
    fileKey:    'hero2',
    previewUrl: removeFlags.hero2 ? null : (heroFiles.hero2 ? URL.createObjectURL(heroFiles.hero2) : form.value.hero_image_2_url),
  },
  {
    key:        'hero3',
    label:      'Imagen 3',
    urlField:   'hero_image_3_url',
    fileKey:    'hero3',
    previewUrl: removeFlags.hero3 ? null : (heroFiles.hero3 ? URL.createObjectURL(heroFiles.hero3) : form.value.hero_image_3_url),
  }
])

const fetchSettings = async () => {
  try {
    const response = await api.get('/settings')
    form.value = { ...response.data }
  } catch (error) {
    console.error('Error al cargar la configuración:', error)
  }
}

const onHeroFileChange = (event, slot) => {
  const file = event.target.files[0]
  if (!file) return
  heroFiles[slot.fileKey] = file
  removeFlags[slot.fileKey] = false
}

const removeSlotImage = (slot) => {
  heroFiles[slot.fileKey] = null
  removeFlags[slot.fileKey] = true
}

const onFileChange = (event, type) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    aboutFile.value = file
    previewAbout.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveSettings = async () => {
  loading.value = true
  const formData = new FormData()

  const skipFields = [
    'hero_image_url', 'hero_image_2_url', 'hero_image_3_url',
    'about_image_url', 'id', 'created_at', 'updated_at',
    'hero_image_path', 'hero_image_2_path', 'hero_image_3_path', 'about_image_path'
  ]

  Object.keys(form.value).forEach(key => {
    if (!skipFields.includes(key) && form.value[key] !== null && form.value[key] !== undefined) {
      formData.append(key, form.value[key])
    }
  })

  // Imágenes hero slider
  if (heroFiles.hero)  formData.append('hero_image',   heroFiles.hero)
  if (heroFiles.hero2) formData.append('hero_image_2', heroFiles.hero2)
  if (heroFiles.hero3) formData.append('hero_image_3', heroFiles.hero3)

  // Flags de eliminación
  if (removeFlags.hero)  formData.append('remove_hero_image',   '1')
  if (removeFlags.hero2) formData.append('remove_hero_image_2', '1')
  if (removeFlags.hero3) formData.append('remove_hero_image_3', '1')

  // Imagen de nosotros
  if (aboutFile.value) formData.append('about_image', aboutFile.value)

  try {
    await api.post('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Configuración actualizada correctamente.', timer: 2200, showConfirmButton: false })

    // Reset temporales
    heroFiles.hero  = null
    heroFiles.hero2 = null
    heroFiles.hero3 = null
    removeFlags.hero  = false
    removeFlags.hero2 = false
    removeFlags.hero3 = false
    aboutFile.value  = null
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

<style scoped>
/* Hero image slots */
.hero-img-slot {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 1rem;
  overflow: hidden;
  background: #f8fafc;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.hero-img-slot.has-image {
  border-style: solid;
  border-color: rgba(var(--bs-primary-rgb), 0.2);
  background: white;
}

.hero-img-slot:hover {
  border-color: var(--color-primary);
}

.slot-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  z-index: 10;
}

.slot-preview {
  position: relative;
  flex: 1;
}

.slot-img {
  width: 100%;
  height: 190px;
  object-fit: contain;
  background: #f1f5f9;
  display: block;
}

.slot-remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 10;
}

.slot-remove-btn:hover {
  background: #dc2626;
}

.slot-upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 2rem 1rem;
  text-align: center;
  min-height: 190px;
}

.slot-replace-bar {
  padding: 0.5rem;
  border-top: 1px solid rgba(0,0,0,0.06);
  background: #f8fafc;
}

.cursor-pointer { cursor: pointer; }
</style>
