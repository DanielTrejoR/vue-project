<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="auth-title">Bienvenido</h2>

      <el-tabs v-model="mode" stretch @tab-change="onTabChange">
        <el-tab-pane label="Iniciar sesión" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            status-icon
            @submit.prevent="submitLogin"
          >
            <el-form-item label="Correo electrónico" prop="email" :error="fieldErrors.email">
              <el-input v-model="loginForm.email" type="email" autocomplete="email" clearable />
            </el-form-item>

            <el-form-item label="Contraseña" prop="password" :error="fieldErrors.password">
              <el-input v-model="loginForm.password" type="password" autocomplete="current-password" show-password />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="loginForm.remember">Recordar sesión</el-checkbox>
            </el-form-item>

            <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" class="mb-4" />

            <el-button type="primary" native-type="submit" :loading="loading" class="w-full">
              Iniciar sesión
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Crear cuenta" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            status-icon
            @submit.prevent="submitRegister"
          >
            <el-form-item label="Nombre" prop="name" :error="fieldErrors.name">
              <el-input v-model="registerForm.name" autocomplete="name" clearable />
            </el-form-item>

            <el-form-item label="Correo electrónico" prop="email" :error="fieldErrors.email">
              <el-input v-model="registerForm.email" type="email" autocomplete="email" clearable />
            </el-form-item>

            <el-form-item label="Contraseña" prop="password" :error="fieldErrors.password">
              <el-input v-model="registerForm.password" type="password" autocomplete="new-password" show-password />
            </el-form-item>

            <el-form-item label="Confirmar contraseña" prop="password_confirmation">
              <el-input v-model="registerForm.password_confirmation" type="password" autocomplete="new-password" show-password />
            </el-form-item>

            <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" class="mb-4" />

            <el-button type="primary" native-type="submit" :loading="loading" class="w-full">
              Crear cuenta
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="auth-footer">
        <RouterLink :to="{ name: 'Index' }">← Volver al blog</RouterLink>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthForm, homeFor, type AuthMode } from '~/composables/useAuthForm'

const route = useRoute()
const router = useRouter()

const { loginForm, registerForm, loading, errorMessage, fieldErrors, clearErrors, submit } = useAuthForm()

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// la pestaña sigue a la ruta (/login o /register) para que los enlaces "Registrarse" abran la correcta
const mode = ref<AuthMode>(route.name === 'Register' ? 'register' : 'login')
const onTabChange = (name: string | number) => {
  clearErrors()
  router.replace({ name: name === 'register' ? 'Register' : 'Login', query: route.query })
}

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : undefined))

const loginRules: FormRules = {
  email: [
    { required: true, message: 'El correo es obligatorio', trigger: 'blur' },
    { type: 'email', message: 'Correo inválido', trigger: ['blur', 'change'] },
  ],
  password: [{ required: true, message: 'Ingresa tu contraseña', trigger: 'blur' }],
}

const registerRules: FormRules = {
  name: [{ required: true, message: 'El nombre es obligatorio', trigger: 'blur' }],
  email: loginRules.email,
  password: [
    { required: true, message: 'Ingresa una contraseña', trigger: 'blur' },
    { min: 8, message: 'Debe tener al menos 8 caracteres', trigger: 'blur' },
  ],
  password_confirmation: [
    { required: true, message: 'Confirma la contraseña', trigger: 'blur' },
    {
      validator: (_rule, value, callback) =>
        value === registerForm.password ? callback() : callback(new Error('Las contraseñas no coinciden')),
      trigger: ['blur', 'change'],
    },
  ],
}

const finish = (user: Awaited<ReturnType<typeof submit>>) => {
  if (user) {
    router.push(homeFor(user, redirect.value))
  }
}

const submitLogin = async () => {
  if (!(await loginFormRef.value?.validate().catch(() => false))) return
  finish(await submit('login'))
}

const submitRegister = async () => {
  if (!(await registerFormRef.value?.validate().catch(() => false))) return
  finish(await submit('register'))
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--ep-bg-color-page);
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.auth-title {
  margin: 0 0 8px;
  text-align: center;
}

.auth-footer {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}

.auth-footer a {
  color: var(--ep-color-primary);
  text-decoration: none;
}
</style>
