<template>
  <div class="account">
    <!-- foto -->
    <section class="account__section">
      <h3>Foto de perfil</h3>
      <div class="account__avatar">
        <el-avatar :size="88" :src="avatarPreview || auth.user?.avatar">{{ auth.user?.name?.charAt(0) }}</el-avatar>
        <div>
          <el-upload
            :show-file-list="false"
            :auto-upload="false"
            accept="image/jpeg,image/png,image/gif,image/webp"
            :on-change="onAvatarSelected"
          >
            <el-button icon="Upload" :loading="savingAvatar">Cambiar foto</el-button>
          </el-upload>
          <p class="account__hint">JPG, PNG, GIF o WEBP de hasta 2 MB.</p>
        </div>
      </div>
    </section>

    <el-divider />

    <!-- nombre y correo -->
    <section class="account__section">
      <h3>Datos personales</h3>
      <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-position="top" @submit.prevent="saveProfile">
        <el-form-item label="Nombre" prop="name" :error="profileErrors.name">
          <el-input v-model.trim="profileForm.name" autocomplete="name" />
        </el-form-item>
        <el-form-item label="Correo electrónico" prop="email" :error="profileErrors.email">
          <el-input v-model.trim="profileForm.email" type="email" autocomplete="email" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="savingProfile" :disabled="!profileChanged">Guardar cambios</el-button>
      </el-form>
    </section>

    <el-divider />

    <!-- contraseña -->
    <section class="account__section">
      <h3>Contraseña</h3>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top" @submit.prevent="savePassword">
        <el-form-item label="Contraseña actual" prop="current_password" :error="passwordErrors.current_password">
          <el-input v-model="passwordForm.current_password" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-form-item label="Nueva contraseña" prop="password" :error="passwordErrors.password">
          <el-input v-model="passwordForm.password" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="Confirmar nueva contraseña" prop="password_confirmation">
          <el-input v-model="passwordForm.password_confirmation" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="savingPassword">Cambiar contraseña</el-button>
      </el-form>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

// errores de validación de Laravel (422): el primero de cada campo
const firstErrors = (err: any): Record<string, string> => Object.fromEntries(
  Object.entries(err?.response?.data?.errors || {}).map(([field, messages]: [string, any]) => [field, messages[0]])
)

// ---- foto
const avatarPreview = ref('')
const savingAvatar = ref(false)
const MAX_AVATAR_MB = 2

const onAvatarSelected = async (file: UploadFile) => {
  const raw = file.raw
  if (!raw) return
  if (raw.size / 1024 / 1024 > MAX_AVATAR_MB) {
    ElMessage.error(`La foto debe pesar menos de ${MAX_AVATAR_MB} MB`)
    return
  }
  avatarPreview.value = URL.createObjectURL(raw)
  savingAvatar.value = true
  try {
    await auth.updateAvatar(raw)
    ElMessage.success('Foto actualizada')
  } catch (err: any) {
    ElMessage.error(firstErrors(err).avatar || 'No se pudo subir la foto')
  } finally {
    savingAvatar.value = false
    URL.revokeObjectURL(avatarPreview.value)
    avatarPreview.value = ''
  }
}

// ---- datos personales
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({ name: auth.user?.name || '', email: auth.user?.email || '' })
const profileErrors = ref<Record<string, string>>({})
const savingProfile = ref(false)
const profileChanged = computed(() => profileForm.name !== auth.user?.name || profileForm.email !== auth.user?.email)

const profileRules: FormRules = {
  name: [{ required: true, message: 'El nombre es obligatorio', trigger: 'blur' }],
  email: [
    { required: true, message: 'El correo es obligatorio', trigger: 'blur' },
    { type: 'email', message: 'Correo inválido', trigger: ['blur', 'change'] },
  ],
}

const saveProfile = async () => {
  if (!(await profileFormRef.value?.validate().catch(() => false))) return
  savingProfile.value = true
  profileErrors.value = {}
  try {
    await auth.updateProfile({ ...profileForm })
    ElMessage.success('Datos actualizados')
  } catch (err) {
    profileErrors.value = firstErrors(err)
    if (!Object.keys(profileErrors.value).length) ElMessage.error('No se pudieron guardar los datos')
  } finally {
    savingProfile.value = false
  }
}

// ---- contraseña
const passwordFormRef = ref<FormInstance>()
const emptyPassword = () => ({ current_password: '', password: '', password_confirmation: '' })
const passwordForm = reactive(emptyPassword())
const passwordErrors = ref<Record<string, string>>({})
const savingPassword = ref(false)

const passwordRules: FormRules = {
  current_password: [{ required: true, message: 'Ingresa tu contraseña actual', trigger: 'blur' }],
  password: [
    { required: true, message: 'Ingresa una contraseña nueva', trigger: 'blur' },
    { min: 8, message: 'Debe tener al menos 8 caracteres', trigger: 'blur' },
  ],
  password_confirmation: [{
    validator: (_rule, value, callback) => value === passwordForm.password
      ? callback()
      : callback(new Error('Las contraseñas no coinciden')),
    trigger: ['blur', 'change'],
  }],
}

const savePassword = async () => {
  if (!(await passwordFormRef.value?.validate().catch(() => false))) return
  savingPassword.value = true
  passwordErrors.value = {}
  try {
    await auth.updatePassword({ ...passwordForm })
    Object.assign(passwordForm, emptyPassword())
    passwordFormRef.value?.clearValidate()
    ElMessage.success('Contraseña actualizada')
  } catch (err) {
    passwordErrors.value = firstErrors(err)
    if (!Object.keys(passwordErrors.value).length) ElMessage.error('No se pudo cambiar la contraseña')
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.account {
  max-width: 520px;
  text-align: left;
}

.account__section h3 {
  margin: 0 0 16px;
  font-size: 1rem;
}

.account__avatar {
  display: flex;
  align-items: center;
  gap: 20px;
}

.account__hint {
  margin: 8px 0 0;
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}
</style>
