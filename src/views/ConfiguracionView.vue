<template>
  <div class="container-fluid py-4">
    <BaseCard title="Configuración de la Empresa y Landing">
      <template #header>
        <BaseButton 
          variant="brand" 
          :loading="loading" 
          icon="bi bi-save"
          @click="saveSettings"
        >
          Guardar Cambios
        </BaseButton>
      </template>

      <div class="row g-4">
        <!-- Información General -->
        <div class="col-md-6">
          <div class="p-4 border rounded-4 bg-body-tertiary h-100 shadow-none">
            <h6 class="fw-bold mb-4 border-bottom pb-2 text-body-emphasis">
              <i class="bi bi-info-circle me-2 text-primary"></i>Información General
            </h6>
            <BaseInput 
              v-model="form.company_name" 
              label="Nombre de la Empresa" 
              placeholder="Ej: PlasticoGlobal S.A." 
              icon="bi bi-building"
            />
            <BaseInput 
              v-model="form.email" 
              label="Email de Contacto" 
              type="email" 
              placeholder="contacto@empresa.com" 
              icon="bi bi-envelope"
            />
            <BaseInput 
              v-model="form.phone" 
              label="Teléfono" 
              placeholder="+123456789" 
              icon="bi bi-telephone"
            />
            
            <div class="mb-3">
              <label class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">Dirección Física</label>
              <textarea v-model="form.address" class="form-control" rows="2" placeholder="Calle, Ciudad, País"></textarea>
            </div>

            <BaseInput 
              v-model="form.footer_text" 
              label="Texto del Footer" 
              placeholder="© 2026 Todos los derechos reservados" 
              icon="bi bi-c-circle"
            />
          </div>
        </div>

        <!-- Redes Sociales -->
        <div class="col-md-6">
          <div class="p-4 border rounded-4 bg-body-tertiary h-100 shadow-none">
            <h6 class="fw-bold mb-4 border-bottom pb-2 text-body-emphasis">
              <i class="bi bi-share me-2 text-primary"></i>Redes Sociales
            </h6>
            <BaseInput 
              v-model="form.facebook_url" 
              label="Facebook URL" 
              type="url" 
              placeholder="https://facebook.com/tu-pagina" 
              icon="bi bi-facebook text-primary"
            />
            <BaseInput 
              v-model="form.instagram_url" 
              label="Instagram URL" 
              type="url" 
              placeholder="https://instagram.com/tu-perfil" 
              icon="bi bi-instagram text-danger"
            />
            <BaseInput 
              v-model="form.whatsapp" 
              label="WhatsApp (Número)" 
              placeholder="Ej: 5491122334455" 
              icon="bi bi-whatsapp text-success"
            />
          </div>
        </div>

        <!-- Sección Hero (Landing) -->
        <div class="col-md-12">
          <div class="p-4 border rounded-4 bg-body-tertiary shadow-none">
            <h6 class="fw-bold mb-4 border-bottom pb-2 text-body-emphasis">
              <i class="bi bi-layout-text-window-reverse me-2 text-primary"></i>Sección Hero (Cabecera Landing)
            </h6>
            <div class="row g-4">
              <div class="col-md-8">
                <BaseInput 
                  v-model="form.hero_title" 
                  label="Título Principal" 
                  placeholder="Ej: Bienvenidos a PlasticoGlobal" 
                />
                <BaseInput 
                  v-model="form.hero_subtitle" 
                  label="Subtítulo / Slogan" 
                  placeholder="Ej: Calidad e innovación en plásticos" 
                />
                
                <div class="mb-0">
                  <label class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">Imagen de Fondo (Hero)</label>
                  <input type="file" @change="onFileChange($event, 'hero')" class="form-control" accept="image/*">
                  <small class="text-body-secondary">Recomendado: 1920x1080px. Máx: 2MB.</small>
                </div>
              </div>
              <div class="col-md-4 text-center d-flex align-items-center justify-content-center">
                <div v-if="previewHero || form.hero_image_url" class="mt-2 w-100">
                  <p class="small text-body-secondary mb-2 fw-bold text-uppercase">Vista Previa Hero</p>
                  <img :src="previewHero || form.hero_image_url" class="img-thumbnail shadow-sm border-0 bg-body p-2" style="max-height: 200px; width: 100%; object-fit: cover;">
                </div>
                <div v-else class="text-body-secondary border rounded-4 p-4 w-100 bg-body d-flex flex-column align-items-center">
                  <i class="bi bi-image opacity-25" style="font-size: 3rem;"></i>
                  <p class="small mb-0">Sin imagen de Hero</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Sobre Nosotros (Landing) -->
        <div class="col-md-12">
          <div class="p-4 border rounded-4 bg-body-tertiary shadow-none">
            <h6 class="fw-bold mb-4 border-bottom pb-2 text-body-emphasis">
              <i class="bi bi-people me-2 text-primary"></i>Sección Sobre Nosotros (Landing)
            </h6>
            <div class="row g-4">
              <div class="col-md-8">
                <BaseInput 
                  v-model="form.about_title" 
                  label="Título Sección" 
                  placeholder="Ej: Nuestra Historia y Compromiso" 
                />
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">Descripción / Texto</label>
                  <textarea v-model="form.about_description" class="form-control" rows="4" placeholder="Describe tu empresa..."></textarea>
                </div>
                <div class="mb-0">
                  <label class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">Imagen Lateral (Nosotros)</label>
                  <input type="file" @change="onFileChange($event, 'about')" class="form-control" accept="image/*">
                  <small class="text-body-secondary">Recomendado: 800x600px. Máx: 2MB.</small>
                </div>
              </div>
              <div class="col-md-4 text-center d-flex align-items-center justify-content-center">
                <div v-if="previewAbout || form.about_image_url" class="mt-2 w-100">
                  <p class="small text-body-secondary mb-2 fw-bold text-uppercase">Vista Previa Nosotros</p>
                  <img :src="previewAbout || form.about_image_url" class="img-thumbnail shadow-sm border-0 bg-body p-2" style="max-height: 200px; width: 100%; object-fit: cover;">
                </div>
                <div v-else class="text-body-secondary border rounded-4 p-4 w-100 bg-body d-flex flex-column align-items-center">
                  <i class="bi bi-image opacity-25" style="font-size: 3rem;"></i>
                  <p class="small mb-0">Sin imagen de Nosotros</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../plugins/axios'
import Swal from 'sweetalert2'
import BaseCard from '../components/base/BaseCard.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

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
  
  Object.keys(form.value).forEach(key => {
    const skipFields = ['hero_image_url', 'about_image_url', 'id', 'created_at', 'updated_at', 'hero_image_path', 'about_image_path']
    if (form.value[key] !== null && !skipFields.includes(key)) {
      formData.append(key, form.value[key])
    }
  })

  if (heroFile.value) {
    formData.append('hero_image', heroFile.value)
  }
  if (aboutFile.value) {
    formData.append('about_image', aboutFile.value)
  }

  try {
    await api.post('/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'La configuración se ha actualizado correctamente.',
      timer: 2000,
      showConfirmButton: false
    })
    
    heroFile.value = null
    aboutFile.value = null
    previewHero.value = null
    previewAbout.value = null
    
    await fetchSettings()
  } catch (error) {
    console.error('Error al guardar:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar la configuración. Revisa los datos e intenta de nuevo.'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.img-thumbnail {
  border-radius: 12px;
}
</style>
