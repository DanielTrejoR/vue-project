<script lang="ts" setup>
import { ref } from 'vue'
import { isDark } from "~/composables";
import { Sunny, Moon } from '@element-plus/icons-vue'
import store from '~/store';
import router from '~/router';
const activeIndex = ref('1')

const logout = () => {
  // Implement your logout logic here
  console.log("Logging out...");
  store.dispatch("base/logout")
    .then(() => {
      // Redirect to login or home page after logout
      router.push({ name: 'Login' })
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
}
</script>

<template>
  <el-menu class="" mode="horizontal" :ellipsis="false" :default-active="activeIndex">
    <el-menu-item index="0">Element Plus</el-menu-item>
    <el-sub-menu index="2">
      <template #title>Workspace</template>
        <RouterLink :to="{name: 'Dashboard'}">
        <el-menu-item index="2-1">
            Home
        </el-menu-item>
        </RouterLink>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>Info</el-menu-item>
    <el-menu-item index="4">
      <RouterLink :to="{name: 'about'}">
        About
      </RouterLink>  
    </el-menu-item>
    <el-menu-item index="7" h="full">
      <el-switch
        class="darker-switch"
        v-model="isDark"
        :active-action-icon="Moon"
        :inactive-action-icon="Sunny"
        style="--ep-switch-on-color: #2C2C2C; --ep-switch-off-color: #F2F2F2"
      />
    </el-menu-item>
    <el-sub-menu index="8" class="">
      <template #title>{{ store.getters.user.user.name }}</template>
      <el-menu-item index="8-1" @click="logout()">Cerrar sesion</el-menu-item>
    </el-sub-menu>
  </el-menu>
  
</template>
<style>
.light-icon {
    color: #606266;
}
.dark-icon {
    border-radius: 50%;
    color: #cfd3dc;
    background-color: #141414;
}
.darker-switch.ep-switch.is-checked .ep-switch__core .ep-switch__action {
    left: calc(100% - 17px);
    border-radius: 50%;
    color: #cfd3dc !important;
    background-color: #141414 !important;
}
.darker-switch.ep-switch .ep-switch__core .ep-switch__action {
    
    color: #606266;
}

.ep-menu--horizontal {
    height: calc(var(--ep-menu-horizontal-height) - 1px)
}


.ep-menu--horizontal > .ep-menu-item:nth-child(5) {
  margin-right: auto;
}

</style>