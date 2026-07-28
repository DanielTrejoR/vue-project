// src/composables/useAuthDialog.js
import { ref } from 'vue'

export const showAuthDialog = ref(false)

export function openAuthDialog() {
  showAuthDialog.value = true
}

export function closeAuthDialog() {
  showAuthDialog.value = false
}
