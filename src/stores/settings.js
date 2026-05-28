import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/axios'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(null)
  const loaded   = ref(false)

  async function fetch() {
    if (loaded.value) return
    try {
      const { data } = await api.get('/public/settings')
      settings.value = data
      loaded.value   = true
    } catch {
      // fallo silencioso: componentes usarán fallbacks estáticos
    }
  }

  function invalidate() {
    loaded.value = false
  }

  return { settings, loaded, fetch, invalidate }
})
