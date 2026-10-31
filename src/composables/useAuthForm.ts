// Lógica compartida de login/registro: la usan la página /login (Element Plus) y el diálogo del blog (Vuetify)
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

export type AuthMode = 'login' | 'register'

export interface AuthUser {
  roles?: string[]
  [key: string]: unknown
}

export function useAuthForm() {
  const auth = useAuthStore()

  const loginForm = reactive({
    email: '',
    password: '',
    remember: false,
  })

  const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const loading = ref(false)
  const errorMessage = ref('')
  // errores de validación de Laravel (422), por campo
  const fieldErrors = ref<Record<string, string>>({})

  const clearErrors = () => {
    errorMessage.value = ''
    fieldErrors.value = {}
  }

  const handleError = (err: any) => {
    ({ fields: fieldErrors.value, message: errorMessage.value } = readApiError(err))
  }

  const submit = async (mode: AuthMode): Promise<AuthUser | null> => {
    clearErrors()
    loading.value = true
    try {
      return mode === 'login'
        ? await auth.login(loginForm)
        : await auth.register(registerForm)
    } catch (err) {
      handleError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  return { loginForm, registerForm, loading, errorMessage, fieldErrors, clearErrors, submit }
}

// Errores de la API de auth: los de validación (422) van por campo, el resto como un mensaje general.
// También lo usan las pantallas de "olvidé mi contraseña"
export function readApiError(err: any): { fields: Record<string, string>, message: string } {
  const status = err?.response?.status
  const data = err?.response?.data

  if (status === 422 && data?.errors) {
    return {
      fields: Object.fromEntries(
        Object.entries(data.errors as Record<string, string[]>).map(([field, messages]) => [field, messages[0]])
      ),
      message: '',
    }
  }
  if (status === 429) {
    return { fields: {}, message: 'Demasiados intentos, espera un minuto antes de volver a intentarlo.' }
  }
  return { fields: {}, message: data?.message || 'No se pudo conectar con el servidor.' }
}

// A dónde ir tras iniciar sesión: el ?redirect pedido, el panel para Admin/Writer o el blog para el resto
export function homeFor(user: AuthUser | null, redirect?: string) {
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  const canUseAdmin = (user?.roles || []).some(role => ['Admin', 'Writer'].includes(role))
  return canUseAdmin ? '/admin' : '/'
}
