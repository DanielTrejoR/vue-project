<template>
  <el-header class="navbar" >
    <el-row align="middle" justify="space-between" class="navbar-inner pt-4 d-flex align-center">
      <!-- Branding -->
      <div class="d-flex align-center">
        <Hamburger class="" />
        <Breadcrumb class="" />
      </div>
      <!-- Navegación -->
      
      <div class="float-right d-flex align-center">
        <div class="pl-1 pr-1" >
        <HeaderSearch />
        </div>
        <el-switch class="ml-2 d-flex align-center pl-1 pr-1"
            :model-value="isDark"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; "
            @click="handleSwitchClick"
            :active-action-icon="IconMoon"
            :inactive-action-icon="IconSunny"
        />  
        <!-- Menú móvil -->
        <el-icon class="hamburger" @click="drawerVisible = true">
            <Menu />
        </el-icon>
      </div>
      <!-- Acciones o toggle de tema -->

        <el-drawer
            v-model="drawerVisible"
            direction="rtl"
            size="250px"
            title="Navegación"
        >
            <el-menu
            mode="vertical"
            :router="true"
            :default-active="$route.path"
            >
            <el-menu-item index="/admin/dashboard">Dashboard</el-menu-item>
            <el-menu-item index="/usuarios">Usuarios</el-menu-item>
            <el-menu-item index="/ajustes">Ajustes</el-menu-item>
            </el-menu>
        </el-drawer>
    </el-row>
  </el-header>
</template>
<script lang="ts" setup>
import IconMoon from '~/components/icons/IconMoon.vue';
import IconSunny from '~/components/icons/IconSunny.vue';
import {onMounted, onUnmounted, ref} from 'vue';
import { useRadialThemeToggle } from '~/composables/useRadialThemeToggle'
const { isDark, toggleRadialTheme } = useRadialThemeToggle()
const drawerVisible = ref(false)
function handleSwitchClick(event: MouseEvent) {
  if (!(event instanceof MouseEvent)) return

  toggleRadialTheme(event)
}

onMounted(() => {
  console.log('Navbar mounted')
})
onUnmounted(() => {
  console.log('Navbar unmounted')
})
</script>
<style lang="scss" scoped>
.navbar {
  background-color: var(--bg-color);
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);

  .navbar-inner {
    gap: 16px;
    flex-wrap: wrap;
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

  @media (max-width: 768px) {
    .navbar-menu {
      display: none;
    }
    .hamburger {
      display: block;
    }
  }
}


</style>