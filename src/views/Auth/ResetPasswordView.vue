<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="auth-title">Elige una contraseña nueva</h2>

      <el-result v-if="!hasToken" icon="warning" title="Enlace incompleto" sub-title="Abre el enlace tal como llegó en el correo o pide uno nuevo.">
        <template #extra>
          <el-button type="primary" @click="router.push({ name: 'ForgotPassword' })">Pedir otro enlace</el-button>
        </template>
      </el-result>

      <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top" status-icon @submit.prevent="submitForm">
        <el-form-item label="Correo electrónico">
          <el-input :model-value="form.email" disabled />
        </el-form-item>

        <el-form-item label="Contraseña nueva" prop="password" :error="fieldErrors.password">
          <el-input v-model="form.password" type="password" autocomplete="new-password" show-password autofocus />
        </el-form-item>

        <el-form-item label="Confirmar contraseña" prop="password_confirmation">
          <el-input v-model="form.password_confirmation" type="password" autocomplete="new-password" show-password />
        </el-form-item>

        <!-- token vencido o ya usado: el backend lo reporta en "email" -->
        <el-alert v-if="fieldErrors.email || errorMessage" :title="fieldErrors.email || errorMessage" type="error" show-icon :closable="false" class="mb-4">
          <RouterLink v-if="fieldErrors.email" :to="{ name: 'ForgotPassword', query: { email: form.email } }">Pedir otro enlace</RouterLink>
        </el-alert>

        <el-button type="primary" native-type="submit" :loading="loading" class="w-full">
          Guardar contraseña
        </el-button>
      </el-form>

      <div class="auth-footer">
        <RouterLink :to="{ name: 'Login' }">← Volver a iniciar sesión</RouterLink>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '~/stores/auth'
import { readApiError } from '~/composables/useAuthForm'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const queryValue = (key: string) => (typeof route.query[key] === 'string' ? route.query[key] as string : '')

const form = reactive({
  token: queryValue('token'),
  email: queryValue('email'),
  password: '',
  password_confirmation: '',
})
const hasToken = computed(() => !!form.token && !!form.email)

const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})

const rules: FormRules = {
  password: [
    { required: true, message: 'Ingresa una contraseña', trigger: 'blur' },
    { min: 8, message: 'Debe tener al menos 8 caracteres', trigger: 'blur' },
  ],
  password_confirmation: [
    { required: true, message: 'Confirma la contraseña', trigger: 'blur' },
    {
      validator: (_rule, value, callback) =>
        value === form.password ? callback() : callback(new Error('Las contraseñas no coinciden')),
      trigger: ['blur', 'change'],
    },
  ],
}

const submitForm = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  errorMessage.value = ''
  fieldErrors.value = {}
  try {
    ElMessage.success(await auth.resetPassword(form))
    // el correo ya queda escrito en el login
    router.push({ name: 'Login', query: { email: form.email } })
  } catch (err) {
    ({ fields: fieldErrors.value, message: errorMessage.value } = readApiError(err))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped src="./auth-page.css"></style>
