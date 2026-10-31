<template>
    <div :class="{'has-logo':showLogo}" class="sidebar-root">
        <RouterLink v-if="showLogo" to="/admin" class="sidebar-logo" :title="title">
            <span class="sidebar-logo__mark">{{ title.charAt(0) }}</span>
            <span v-if="!isCollapse" class="sidebar-logo__title">{{ title }}</span>
        </RouterLink>
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                :unique-opened="false"
                :collapse-transition="false"
                mode="vertical"
            >
                <SidebarItem v-for="route in permissionRoutes" :key="route.path" :item="route" :base-path="route.path"/>
            </el-menu>
        </el-scrollbar>
        <CreateModalPost></CreateModalPost>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue"
import { mapState, useStore, mapGetters } from 'vuex'
import defaultSettings from '~/settings'
import { useRoute, useRouter } from 'vue-router'
const routeClass = useRoute();
const router = useRouter();
const store = useStore();

const permissionRoutes = computed(() => store.getters.permission_routes)
const showLogo = computed(() => store.state.settings.sidebarLogo);
const title = defaultSettings.title
// colapsado es una preferencia del usuario; en móvil el menú va en un drawer y siempre se muestra completo
const isCollapse = computed(() => store.state.settings.sidebarCollapsed && store.state.app.device !== 'mobile')
const activeMenu = computed(() => {
    const route = routeClass
    const { meta, path } = route
    // if set path, the sidebar will highlight the path you set
    if (meta.activeMenu) {
        return meta.activeMenu as string
    }
    return path
});

</script>
<style scoped>
.sidebar-root {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.sidebar-root :deep(.ep-scrollbar) {
    flex: 1;
}

.sidebar-root :deep(.ep-menu) {
    border-right: none;
}

.sidebar-root :deep(.ep-menu:not(.ep-menu--collapse)) {
    width: 100%;
}

/* SidebarItem envuelve los ítems en divs, así que los selectores de colapso de Element Plus
   (hijos directos) no llegan: se ocultan aquí el texto y la flecha y se centra el ícono */
.sidebar-root :deep(.ep-menu--collapse .item-title),
.sidebar-root :deep(.ep-menu--collapse .ep-sub-menu__icon-arrow) {
    display: none;
}

.sidebar-root :deep(.ep-menu--collapse .ep-sub-menu__title),
.sidebar-root :deep(.ep-menu--collapse .ep-menu-item) {
    justify-content: center;
    padding: 0 !important;
}

.sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 56px;
    padding: 0 18px;
    color: var(--ep-text-color-primary);
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
}

.sidebar-logo__mark {
    flex: none;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--ep-color-primary);
    color: #fff;
}

.sidebar-logo__title {
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>