<template>
<div class="table-wrapper">
    <div class="posts-header">
        <h2>Usuarios</h2>
        <div class="posts-header__actions">
            <el-button :loading="loading" @click="getUsers()">Recargar</el-button>
        </div>
    </div>

    <el-form :model="filters" @submit.prevent="applyFilters" class="posts-filters">
        <el-input v-model="filters.search" placeholder="Buscar por nombre o correo" clearable />
        <el-select v-model="filters.role" placeholder="Rol" clearable>
            <el-option v-for="role in roles" :key="role.name" :label="role.display_name" :value="role.name" />
            <el-option label="Sin rol (lectores)" value="none" />
        </el-select>
        <el-select v-model="filters.status" placeholder="Estado" clearable>
            <el-option label="Activas" value="active" />
            <el-option label="Desactivadas" value="inactive" />
        </el-select>

        <div class="posts-filters__actions">
            <el-button type="primary" native-type="submit" :loading="loading">Filtrar</el-button>
            <el-button :disabled="!hasFilters" @click="resetFilters">Limpiar filtros</el-button>
        </div>
    </el-form>

    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="mb-4" />

    <el-table v-loading="loading" element-loading-text="Cargando..." :data="users" style="width: 100%">
        <el-table-column label="Usuario" min-width="240" fixed>
            <template #default="{ row }">
                <div class="user-cell">
                    <UserAvatar :src="row.avatar" :name="row.name" :size="36" />
                    <div class="user-cell__text">
                        <div class="user-cell__name">
                            {{ row.name }}
                            <el-tag v-if="isMe(row)" size="small" effect="plain" disable-transitions>Tú</el-tag>
                        </div>
                        <div class="user-cell__email">{{ row.email }}</div>
                    </div>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="Roles" min-width="170">
            <template #default="{ row }">
                <el-tag v-for="role in row.roles" :key="role.name" :type="role.name === 'Admin' ? 'danger' : 'primary'" class="role-tag" disable-transitions>
                    {{ role.display_name || role.name }}
                </el-tag>
                <span v-if="!row.roles.length" class="muted">Lector</span>
            </template>
        </el-table-column>
        <el-table-column label="Estado" min-width="130">
            <template #default="{ row }">
                <el-tooltip :disabled="!isMe(row)" content="No puedes desactivar tu propia cuenta">
                    <!-- before-change: pide confirmación y guarda; el switch solo cambia si el backend acepta -->
                    <el-switch
                        :model-value="row.is_active"
                        :disabled="isMe(row)"
                        :loading="savingId === row.id"
                        :before-change="() => toggleActive(row)"
                        inline-prompt
                        active-text="Activa"
                        inactive-text="Inactiva"
                        style="--ep-switch-off-color: var(--ep-color-danger)"
                    />
                </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column label="Posts" prop="posts_count" min-width="80" align="center" />
        <el-table-column label="Comentarios" prop="comments_count" min-width="120" align="center" />
        <el-table-column label="Alta" min-width="120">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column :fixed="isMobile ? false : 'right'" label="Acciones" min-width="130">
            <template #default="{ row }">
                <el-button size="small" type="primary" icon="EditPen" @click="openRoles(row)">Roles</el-button>
            </template>
        </el-table-column>
        <template #empty>
            <div class="posts-empty">
                {{ hasFilters ? 'Ningún usuario coincide con los filtros.' : 'Todavía no hay usuarios.' }}
            </div>
        </template>
    </el-table>

    <div class="d-flex justify-center pt-4 mt-5">
        <el-pagination
            background
            :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, sizes'"
            :pager-count="isMobile ? 5 : 7"
            :total="total"
            :page-sizes="[10, 20, 50]"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            @current-change="getUsers()"
            @size-change="applyFilters"
        />
    </div>

    <el-dialog v-model="showRoles" :title="`Roles de ${editing?.name ?? ''}`" :width="isMobile ? '95%' : '420px'" destroy-on-close>
        <p class="muted dialog-hint">Sin ningún rol, la cuenta solo puede comentar y puntuar en el blog.</p>
        <el-checkbox-group v-model="selectedRoles" class="roles-options">
            <el-checkbox
                v-for="role in roles"
                :key="role.name"
                :value="role.name"
                :disabled="role.name === 'Admin' && editing !== null && isMe(editing)"
            >
                {{ role.display_name || role.name }}
            </el-checkbox>
        </el-checkbox-group>
        <template #footer>
            <el-button @click="showRoles = false">Cancelar</el-button>
            <el-button type="primary" :loading="savingId === editing?.id" @click="saveRoles">Guardar</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'UsersIndex' })
import UserAvatar from '~/components/UserAvatar/UserAvatar.vue'
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '~/stores/app'
import { useAuthStore } from '~/stores/auth'
import { useRolesStore } from '~/stores/roles'
import { useUsersStore } from '~/stores/users'

type Role = { name: string, display_name?: string }
// filas de la tabla tal como las devuelve /admin/users (el-table las tipa como registros sueltos)
type User = Record<string, any>

const appStore = useAppStore()
const auth = useAuthStore()
const rolesStore = useRolesStore()
const usersStore = useUsersStore()

const isMobile = computed(() => appStore.isMobile)
const isMe = (user: User) => user.id === auth.user?.id

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const loadError = ref('')
const savingId = ref<number | null>(null)

const emptyFilters = () => ({ search: '', role: '', status: '' })
const filters = ref(emptyFilters())
const hasFilters = computed(() => Object.values(filters.value).some(Boolean))

const getUsers = async () => {
    loading.value = true
    loadError.value = ''
    try {
        const activeFilters = Object.fromEntries(Object.entries(filters.value).filter(([, value]) => value))
        const page = await usersStore.fetchUsers({ page: currentPage.value, size: pageSize.value, filters: activeFilters })
        users.value = page.data
        total.value = Number(page.total) || 0
    } catch {
        loadError.value = 'No se pudieron cargar los usuarios.'
    } finally {
        loading.value = false
    }
}

const applyFilters = () => {
    currentPage.value = 1
    getUsers()
}

const resetFilters = () => {
    filters.value = emptyFilters()
    applyFilters()
}

const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—')

// guarda y reemplaza la fila con lo que devuelve el backend; los errores (422) llegan en español
const save = async (user: User, changes: { roles: string[], is_active: boolean }) => {
    savingId.value = user.id
    try {
        const { message, user: updated } = await usersStore.updateUser(user.id, changes)
        Object.assign(user, updated)
        ElMessage.success(message)
        return true
    } catch (error: any) {
        const errors = error?.response?.data?.errors
        ElMessage.error(errors ? Object.values(errors).flat().join(' ') : 'No se pudo guardar el cambio')
        return false
    } finally {
        savingId.value = null
    }
}

const roleNames = (user: User): string[] => user.roles.map((role: Role) => role.name)

const toggleActive = async (user: User) => {
    const activate = !user.is_active
    try {
        await ElMessageBox.confirm(
            activate
                ? `${user.name} podrá volver a iniciar sesión.`
                : `${user.name} perderá la sesión y no podrá volver a entrar hasta que la actives.`,
            activate ? 'Activar cuenta' : 'Desactivar cuenta',
            { confirmButtonText: activate ? 'Activar' : 'Desactivar', cancelButtonText: 'Cancelar', type: activate ? 'info' : 'warning' }
        )
    } catch {
        return false
    }
    // Object.assign en save() ya cambia is_active: el switch no debe cambiarlo otra vez
    await save(user, { roles: roleNames(user), is_active: activate })
    return false
}

const showRoles = ref(false)
const editing = ref<User | null>(null)
const selectedRoles = ref<string[]>([])

const openRoles = (user: User) => {
    editing.value = user
    selectedRoles.value = roleNames(user)
    showRoles.value = true
}

const saveRoles = async () => {
    if (!editing.value) return
    if (await save(editing.value, { roles: selectedRoles.value, is_active: editing.value.is_active })) {
        showRoles.value = false
    }
}

onMounted(async () => {
    getUsers()
    try {
        const { data } = await rolesStore.getRoles()
        roles.value = data.roles
    } catch {
        // sin la lista de roles el filtro y el diálogo quedan vacíos, la tabla igual se muestra
    }
})
</script>

<style src="../list-page.css"></style>
<style scoped>
.user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.user-cell__text {
    min-width: 0;
}

.user-cell__name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
}

.user-cell__email {
    color: var(--ep-text-color-secondary);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.role-tag {
    margin: 2px 4px 2px 0;
}

.muted {
    color: var(--ep-text-color-secondary);
}

.dialog-hint {
    margin: 0 0 12px;
    font-size: 13px;
}

.roles-options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
</style>
