<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const router = useRouter()

const closeDialog = () => {
  emit('update:modelValue', false)
}

const firstName = ref('')
const password = ref('')
const show1 = ref(false)
const rules = {
    required: value => !!value || 'Required.',
    min: v => v.length >= 8 || 'Min 8 characters',
  }
</script>

<template>
  <v-dialog v-model="props.modelValue" max-width="950">
    <v-card>
      <v-card-title class="text-h6">Necesitas iniciar sesión</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-sheet class="mx-auto" width="300">
              <v-responsive>
                <v-form @submit.prevent>
                  <v-text-field
                    clearable
                    v-model="firstName"
                    :rules="[rules.required]"
                    label="Correo"
                    hide-details="auto"
                    placeholder="johndoe@gmail.com"
                  ></v-text-field>
                  <v-text-field
                    class="pt-3"
                    v-model="password"
                    :append-icon="show1 ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    hint="At least 8 characters"
                    label="Contrasena"
                    :rules="[rules.required]"
                    name="input-10-1"
                    counter
                    @click:append="show1 = !show1"
                  ></v-text-field>
                  <v-btn color="primary" class="mt-2" type="submit" block>Iniciar Sesion</v-btn>
                </v-form>
              </v-responsive>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="6">
            asdas
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" >Iniciar sesión</v-btn>
        <v-btn color="secondary" >Registrarse</v-btn>
        <v-spacer />
        <v-btn text @click="closeDialog">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
