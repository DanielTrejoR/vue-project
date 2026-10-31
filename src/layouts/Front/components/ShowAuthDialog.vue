<script setup>
import { ref, computed } from 'vue'
import { useAuthForm } from '@/composables/useAuthForm'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

// v-model del diálogo sin mutar la prop
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const { loginForm, registerForm, loading, errorMessage, fieldErrors, clearErrors, submit } = useAuthForm()

const tab = ref('login')
const showPassword = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const rules = {
  required: value => !!value || 'Campo obligatorio',
  email: value => /.+@.+\..+/.test(value) || 'Correo inválido',
  min: value => (value || '').length >= 8 || 'Mínimo 8 caracteres',
  matches: value => value === registerForm.password || 'Las contraseñas no coinciden',
}

const changeTab = () => {
  clearErrors()
}

// el usuario se queda en la página donde estaba (p. ej. el post que quería comentar)
const submitForm = async () => {
  const formRef = tab.value === 'login' ? loginFormRef : registerFormRef
  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (await submit(tab.value)) {
    isOpen.value = false
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="440">
    <v-card>
      <v-card-title class="text-h6 pt-4">Necesitas iniciar sesión</v-card-title>
      <v-card-subtitle>Para comentar y puntuar publicaciones</v-card-subtitle>

      <v-tabs v-model="tab" grow class="mt-2" @update:model-value="changeTab">
        <v-tab value="login">Iniciar sesión</v-tab>
        <v-tab value="register">Crear cuenta</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="login">
            <v-form ref="loginFormRef" @submit.prevent="submitForm">
              <v-text-field
                v-model="loginForm.email"
                :rules="[rules.required, rules.email]"
                :error-messages="fieldErrors.email"
                label="Correo"
                type="email"
                autocomplete="email"
                class="mb-2"
              />
              <v-text-field
                v-model="loginForm.password"
                :rules="[rules.required]"
                :error-messages="fieldErrors.password"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"
                label="Contraseña"
                autocomplete="current-password"
                @click:append-inner="showPassword = !showPassword"
              />
              <v-checkbox v-model="loginForm.remember" label="Recordar sesión" density="compact" hide-details />
              <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="my-2">
                {{ errorMessage }}
              </v-alert>
              <v-btn type="submit" color="primary" block :loading="loading" class="mt-2">Iniciar sesión</v-btn>
            </v-form>
          </v-window-item>

          <v-window-item value="register">
            <v-form ref="registerFormRef" @submit.prevent="submitForm">
              <v-text-field
                v-model="registerForm.name"
                :rules="[rules.required]"
                :error-messages="fieldErrors.name"
                label="Nombre"
                autocomplete="name"
                class="mb-2"
              />
              <v-text-field
                v-model="registerForm.email"
                :rules="[rules.required, rules.email]"
                :error-messages="fieldErrors.email"
                label="Correo"
                type="email"
                autocomplete="email"
                class="mb-2"
              />
              <v-text-field
                v-model="registerForm.password"
                :rules="[rules.required, rules.min]"
                :error-messages="fieldErrors.password"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"
                label="Contraseña"
                autocomplete="new-password"
                class="mb-2"
                @click:append-inner="showPassword = !showPassword"
              />
              <v-text-field
                v-model="registerForm.password_confirmation"
                :rules="[rules.required, rules.matches]"
                :type="showPassword ? 'text' : 'password'"
                label="Confirmar contraseña"
                autocomplete="new-password"
              />
              <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="my-2">
                {{ errorMessage }}
              </v-alert>
              <v-btn type="submit" color="primary" block :loading="loading" class="mt-2">Crear cuenta</v-btn>
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
