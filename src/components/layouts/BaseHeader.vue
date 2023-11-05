<script lang="ts" setup>
import { toggleDark, isDark } from "~/composables";
import { Sunny, Moon } from '@element-plus/icons-vue'
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal">
    <el-menu-item index="1">Element Plus</el-menu-item>
    <el-sub-menu index="2">
      <template #title>Workspace</template>
      <el-menu-item index="2-1">
        <RouterLink :to="{name: 'home'}">
          Home
        </RouterLink>
      </el-menu-item>
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
    <el-menu-item index="5" h="full">
      <el-switch
        class="darker-switch"
        v-model="isDark"
        :active-action-icon="Moon"
        :inactive-action-icon="Sunny"
        style="--ep-switch-on-color: #2C2C2C; --ep-switch-off-color: #F2F2F2"
      />
    </el-menu-item>
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
    color: #cfd3dc;
    background-color: #141414;
}
.darker-switch.ep-switch .ep-switch__core .ep-switch__action {
    
    color: #606266;
}
</style>