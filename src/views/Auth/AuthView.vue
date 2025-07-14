<template>
  <el-row>
    <el-col :span="24"><h2>Bienvenido</h2></el-col>
  </el-row>
  <el-row class="pt-50">
    <el-col :span="11" :offset="1">
      <el-card shadow="hover">
        <div style="padding: 14px">
          <span>Inicia sesión</span>
          <div class="mt-10">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              label-width="120px"
              status-icon
              label-position="top"
            >
              <el-form-item label="Correo electrónico" prop="email">
                <el-input v-model="loginForm.email" clearable />
              </el-form-item>

              <el-form-item label="Contraseña" prop="password">
                <el-input v-model="loginForm.password" type="password" show-password />
              </el-form-item>

              <el-form-item label="Recuérdame" prop="remember">
                <el-checkbox v-model="loginForm.remember">Recordar sesión</el-checkbox>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitForm">Submit</el-button>
                <el-button @click="resetForm">Reset</el-button>
              </el-form-item>
            </el-form>

            <p class="text-red mt-2" v-if="errorMessage">{{ errorMessage }}</p>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :span="11">
      <el-card shadow="hover">
        <div style="padding: 14px">
          <!-- espacio para otra sección o diseño -->
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '~/store'
import type { FormInstance, FormRules } from 'element-plus'

interface LoginForm {
  email: string
  password: string
  remember: boolean
}

const route = useRoute()
const router = useRouter()

const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
  remember: false,
})

const loginRules: FormRules = {
  email: [
    { required: true, message: 'Correo electrónico es requerido', trigger: 'blur' },
    { type: 'email', message: 'Correo inválido', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: 'Ingresa tu contraseña', trigger: 'blur' },
    { min: 3, message: 'Debe contener al menos 3 caracteres', trigger: 'blur' },
  ],
}

const errorMessage = ref('')
const redirect = ref<string | undefined>(undefined)

watch(
  () => route.query,
  (query) => {
    redirect.value = typeof query.redirect === 'string' ? query.redirect : undefined
  },
  { immediate: true }
)

const submitForm = () => {
  if (!loginFormRef.value) return

  loginFormRef.value.validate((valid) => {
    if (valid) {
      store
        .dispatch('admin/login', loginForm)
        .then(() => {
          const target = redirect.value || '/admin/dashboard'
          router.push(target)
        })
        .catch((err) => {
          errorMessage.value = err?.response?.data?.error || 'Error al iniciar sesión'
        })
    } else {
      console.log('Error en el formulario')
    }
  })
}

const resetForm = () => {
  loginFormRef.value?.resetFields()
  errorMessage.value = ''
}
</script>
