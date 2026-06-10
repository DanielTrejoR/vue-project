<template>
 <el-form @submit.prevent="submitForm">
    <el-form-item label="Nombre del rol">
      <el-input v-model="localRole.display_name" disabled/>
    </el-form-item>
    <el-checkbox-group v-model="selectedPermissions">
            <el-checkbox 
            v-for="perm in permissions" 
            :key="perm.id" 
            :label="perm"
            :value="perm"
            >
            {{ perm }}
        </el-checkbox>
    </el-checkbox-group>
    <div class="pt-3 mt-5">
        <el-button class="" type="primary" @click="submitForm">Guardar</el-button>
    </div>
  </el-form>
</template>
<script setup>
import { ref, defineEmits, onMounted, reactive } from 'vue';
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  role: {
    type: Object,
    required: true
  }
})
const permissions = ref([]);
const currentRole = ref([]);
const selectedPermissions = ref([])
const getPermissionsList = async () => {
    const res = await store.dispatch('permission/getPermissions');
    console.log(res)
}
// Emit: evento para enviar el rol editado
const emit = defineEmits(['mountedForm', 'updateRole'])

const localRole = currentRole.display_name || reactive({ ...props.role })

const submitForm = () => {
    emit('updateRole', [localRole, selectedPermissions.value]) // 👈 manda el rol editado al padre
}

onMounted(() => {
    emit('mountedForm');
    store.dispatch('roles/editRole', props.role.id).then((res) => {
        currentRole.value = res.data.role;
        permissions.value = res.data.permissions

        selectedPermissions.value = props.role.permissions.map(p => p.name)
    }).catch((err) => {
        
    });
    
})
</script>
