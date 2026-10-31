<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="auth-title">¿Olvidaste tu contraseña?</h2>

      <template v-if="sentMessage">
        <el-result icon="success" title="Revisa tu correo" :sub-title="sentMessage">
          <template #extra>
            <p class="hint">El enlace vence en una hora. Si no llega, revisa la carpeta de spam.</p>
            <el-button @click="sentMessage = ''">Usar otro correo</el-button>
          </template>
        </el-result>
      </template>

      <template v-else>
        <p class="auth-intro">Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva.</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" status-icon @submit.prevent="submitForm">
          <el-form-item label="Correo electrónico" prop="email" :error="fieldErrors.email">
            <el-input v-model="form.email" type="email" autocomplete="email" clearable autofocus />
          </el-form-item>

          <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" class="mb-4" />

          <el-button type="primary" native-type="submit" :loading="loading" class="w-full">
            Enviar enlace
          </el-button>
        </el-form>
      </template>

      <div class="auth-footer">
        <RouterLink :to="{ name: 'Login' }">← Volver a iniciar sesión</RouterLink>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '~/stores/auth'
import { readApiError } from '~/composables/useAuthForm'

const auth = useAuthStore()
const route = useRoute()

// el login pasa el correo que ya se había escrito
const form = reactive({ email: typeof route.query.email === 'string' ? route.query.email : '' })
const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})
const sentMessage = ref('')

const rules: FormRules = {
  email: [
    { required: true, message: 'El correo es obligatorio', trigger: 'blur' },
    { type: 'email', message: 'Correo inválido', trigger: ['blur', 'change'] },
  ],
}

const submitForm = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  errorMessage.value = ''
  fieldErrors.value = {}
  try {
    sentMessage.value = await auth.forgotPassword(form.email)
  } catch (err) {
    ({ fields: fieldErrors.value, message: errorMessage.value } = readApiError(err))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped src="./auth-page.css"></style>
<style scoped>
.auth-intro,
.hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--ep-text-color-secondary);
}
</style>
