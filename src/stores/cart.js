import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // Estado del Carrito
  const items = ref(JSON.parse(localStorage.getItem('soluplast_cart') || '[]'))

  // Getters
  const cartQty = computed(() => items.value.reduce((acc, item) => acc + item.qty, 0))
  const cartSubtotal = computed(() => items.value.reduce((acc, item) => acc + (parseFloat(item.sale_price || item.price) * item.qty), 0))
  const cartShipping = computed(() => items.value.length > 0 ? 150.00 : 0) // Flete industrial estándar
  const cartTotal = computed(() => cartSubtotal.value + cartShipping.value)

  // Acciones
  const saveToLocalStorage = () => {
    localStorage.setItem('soluplast_cart', JSON.stringify(items.value))
  }

  const addToCart = (product, qty = 1) => {
    const existing = items.value.find(item => item.id === product.id)
    if (existing) {
      existing.qty += qty
    } else {
      items.value.push({
        id: product.id,
        sku: product.sku || '',
        name: product.name,
        price: parseFloat(product.sale_price || product.price),
        sale_price: parseFloat(product.sale_price || product.price),
        image: product.primaryImage || 
               product.image || 
               product.image_url || 
               (product.images?.find(img => img.is_primary)?.image_url) || 
               (product.images?.find(img => img.is_primary)?.url) || 
               (product.images?.[0]?.image_url) || 
               (product.images?.[0]?.url) || 
               '',
        qty: qty
      })
    }
    saveToLocalStorage()
  }

  const changeQty = (productId, amount) => {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      item.qty += amount
      if (item.qty <= 0) {
        removeFromCart(productId)
      } else {
        saveToLocalStorage()
      }
    }
  }

  const removeFromCart = (productId) => {
    items.value = items.value.filter(i => i.id !== productId)
    saveToLocalStorage()
  }

  const clearCart = () => {
    items.value = []
    saveToLocalStorage()
  }

  return {
    items,
    cartQty,
    cartSubtotal,
    cartShipping,
    cartTotal,
    addToCart,
    changeQty,
    removeFromCart,
    clearCart
  }
})
