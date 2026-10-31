<template>
  <el-header class="navbar" >
    <el-row align="middle" justify="space-between" class="navbar-inner d-flex align-center">
      <!-- Branding -->
      <div class="d-flex align-center navbar-left">
        <Hamburger :is-active="menuOpen" @toggle="store.dispatch('app/toggleMenu')" />
        <Breadcrumb class="navbar-breadcrumb" />
      </div>
      <!-- Navegación -->
      
      <div class="float-right d-flex align-center">
        <div class="pl-1 pr-1 navbar-search" >
          <HeaderSearch />
        </div>
        <el-switch class="ml-2 d-flex align-center pl-1 pr-3"
            :model-value="isDark"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; "
            @click="handleSwitchClick"
            :active-action-icon="IconMoon"
            :inactive-action-icon="IconSunny"
        />  
        <div class="pl-1 pr-1" >
          <el-dropdown trigger="click">
            <span class="el-dropdown-link user-dropdown">
              <el-avatar
                :src="user.avatar || ''"
                size="small"
                style="margin-right: 8px"
              />
              <span class="user-name">{{ user.name }}</span> 
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">
                  Mi Perfil
                </el-dropdown-item>
                <el-dropdown-item @click="store.dispatch('app/setSettingsPanel', true)">
                  Configuración
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout">
                  Cerrar sesión
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-row>
  </el-header>
</template>
<script lang="ts" setup>
import IconMoon from '~/components/icons/IconMoon.vue';
import IconSunny from '~/components/icons/IconSunny.vue';
import {onMounted, onUnmounted, ref, computed} from 'vue';
import { useRadialThemeToggle } from '~/composables/useRadialThemeToggle'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
const router = useRouter()
const { isDark, toggleRadialTheme } = useRadialThemeToggle()
// ícono del botón de menú: abierto si el drawer móvil está abierto o el menú de escritorio expandido
const menuOpen = computed(() => store.state.app.device === 'mobile'
  ? store.state.app.mobileSidebar
  : !store.state.settings.sidebarCollapsed)
const store = useStore();
const user = computed(() => store.getters['user'] || {});
function handleSwitchClick(event: MouseEvent) {
  if (!(event instanceof MouseEvent)) return

  toggleRadialTheme(event)
}
const logout = async () => {
  await store.dispatch('user/logout')
  router.push('/login')
}

const goProfile = () => {
  router.push({ name: 'ProfileIndex' })
}
</script>
<style lang="scss" scoped>
.user-dropdown {
  display: flex;
  align-items: center;   /* centra verticalmente avatar y texto */
  gap: 8px;              /* espacio entre avatar y nombre */
  cursor: pointer;
}

.user-name {
  font-weight: 500;
}

.navbar {
  background-color: var(--bg-color);
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);

  .navbar-inner {
    gap: 16px;
    flex-wrap: nowrap;
    min-height: 56px;
  }

  .navbar-left {
    min-width: 0;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 18px;
    color: var(--el-color-primary);
  }

  .navbar-menu {
    flex: 1;
    display: flex;
    justify-content: center;

    .navbar-breadcrumb {
      font-size: 13px;
      padding: 4px 0;
      color: var(--text-color-secondary);
      :deep(.el-breadcrumb) {
        font-weight: 400;
      }
    }

    :deep(.el-menu-item) {
      transition: all 0.3s ease;
      font-weight: 500;

      .icon {
        margin-right: 6px;
      }

      &:hover {
        color: var(--el-color-primary);
        transform: translateY(-1px);
      }
    }
  }

  .theme-toggle {
    margin-left: auto;
  }

  .hamburger {
    display: none;
    cursor: pointer;
  }

  @media (max-width: 767px) {
    padding: 0 8px;

    .navbar-menu,
    .navbar-breadcrumb,
    .user-name {
      display: none;
    }
  }

  @media (max-width: 575px) {
    .navbar-search {
      display: none;
    }
  }
}


</style>