<template>
    <div :class="{'has-logo':showLogo}">
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                :background-color="variables.menuBg"
                :text-color="variables.menuText"
                :unique-opened="false"
                :active-text-color="variables.menuActiveText"
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
import * as vars from '~/styles/variables.scss'
import { useRoute, useRouter } from 'vue-router'
const routeClass = useRoute();
const router = useRouter();
const store = useStore();

const permissionRoutes = computed(() => store.getters.permission_routes)
const showLogo = computed(() => store.state.settings.sidebarLogo);
const variables = computed(() => vars);
const sidebar = computed(() => store.getters.sidebar);
const isCollapse = computed(() => !sidebar.value.opened)
const activeMenu = computed(() => {
    const route = routeClass
    const { meta, path } = route
    // if set path, the sidebar will highlight the path you set
    if (meta.activeMenu) {
        return meta.activeMenu
    }
    return path
});

</script>