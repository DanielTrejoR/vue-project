<template>
<div>
    <h1>Permisos</h1>
    <div class="text-align-left">
        <el-table 
            :data="permissions" 
            style="width: 100%" 
            stripe
            v-loading="loading"
        >
            <el-table-column fixed prop="id" label="ID" width="150" />
            <el-table-column prop="display_name" label="Nombre" width="120" />
            <el-table-column label="Permisos" prop="name" />
        </el-table>
    </div>
</div>

</template>
<script setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'PermissionsIndex' })
import { usePermissionStore } from '~/stores/permission'
import { useRouter } from 'vue-router'
import { ref, onMounted, toRaw } from 'vue';
import { useTheme } from '@/composables/useTheme'
const { theme } = useTheme()
const permissionStore = usePermissionStore()
const router = useRouter()
const permissions = ref([])
const loading = ref(false)
const getRoles = () => {
    loading.value = true
    permissionStore.getPermissions().then((res) => {
        if(res.data){
            permissions.value = res.data.permissions
        }
    loading.value = false
    }).catch((err) => {
        loading.value = false
    });
}
onMounted( () => {
    getRoles();
})
</script>