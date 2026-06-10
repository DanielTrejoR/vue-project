<template>
<div>
    <h1>Listado Roles</h1>
    <div class="">
        <div class="text-align-left" v-if="user.is_super_admin">
            <el-button class="float-right" @click="getRoles()">Recargar</el-button>
            <el-table 
                :data="roles" 
                style="width: 100%" 
                stripe
                v-loading="loading"
            >
                <el-table-column fixed prop="id" label="ID" width="150" />
                <el-table-column prop="display_name" label="Nombre" width="120" />
                <el-table-column label="Permisos" >
                    <template #default="scope">
                        <el-tag
                            v-for="item in scope.row.permissions"
                            :key="item.id"
                            type="info"
                        >{{item.display_name}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="address" label="Acciones" width="600" > 
                    <template #default="scope">
                        <el-button :color="theme" type="primary" icon="EditPen" @click="openEdit(scope.row)">Editar</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-else>
            <el-row class="text-align-center">
                <el-col :sm="12" :lg="6" :xl="4">
                    <el-result
                        icon="primary"
                        title="No tienes permisos para ver esta seccion"
                        sub-title="Manda tu solicitud a un administrador para modificar/agregar permisos"
                    >
                    </el-result>
                </el-col>
            </el-row>
        </div>
    </div>
    <el-dialog v-model="showDialog" title="Editar Rol" destroy-on-close>
        <EditRoles :role="selectedRole" @updateRole="saveRole" @mountedForm="onFormMounted"/>
    </el-dialog>
</div>
</template>
<script setup> 
//imports
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ref, onMounted, toRaw } from 'vue';
import { useTheme } from '@/composables/useTheme'
import EditRoles from './components/edit.vue'
//Variables
const { theme } = useTheme()
const store = useStore()
const router = useRouter()
const user = store.getters['user']
const roles = ref([]);
const loading = ref(false)
const activeName = ref('first')
const showDialog = ref(false)
const selectedRole = ref(null)

const getRoles = async() => {
    loading.value = true
    const res = await store.dispatch('roles/getRoles')
    roles.value = res.data.roles
    loading.value = false
}

const openEdit = async (role) => {
  selectedRole.value = { ...role }
  showDialog.value = true
  
}


async function saveRole(updatedRole) {
    loading.value = true
    const payload = {
            role: toRaw(updatedRole[0]),
            permissions: toRaw(updatedRole[1])
        }
    store.dispatch('roles/updateRoles', payload).then((res) => {
        ElMessage(res.data);
        showDialog.value =false
        getRoles();
        loading.value = false

    }).catch((err) => {
        loading.value = false
        
    });

}

const onFormMounted = () => {
  console.log('El formulario ya está listo')
}


onMounted(() => {
    loading.value = true
    getRoles();
    loading.value = false

});
</script>