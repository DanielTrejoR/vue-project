<template>
<el-aside :width="isCollapse ? '64px' : '210px'">
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      :default-active="activeMenu"
      :default-openeds="openMenus"
      :router="true"
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon><memo /></el-icon>
          <span>Posts</span>
        </template>
        <el-menu-item-group >
          <template #title><span>Gestionar publicaciones</span></template>
            <el-menu-item :route="{ name: 'AdminPosts' }" index="1-1">Listado de Publicaciones</el-menu-item>
          <el-menu-item index="1-2" @click="emitOpenModal()">Crear un Post</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="Group Two">
          <el-menu-item index="1-3">item three</el-menu-item>
        </el-menu-item-group>
        <el-sub-menu index="1-4">
          <template #title><span>item four</span></template>
          <el-menu-item index="1-4-1">item one</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
      <el-menu-item index="2">
        <el-icon><icon-menu /></el-icon>
        <template #title>Navigator Two</template>
      </el-menu-item>
      <el-menu-item index="3" disabled>
        <el-icon><document /></el-icon>
        <template #title>Navigator Three</template>
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><setting /></el-icon>
        <template #title>Navigator Four</template>
      </el-menu-item>
      <el-menu-item @click.prevent="collapse()" index="5">
        <el-icon><expand /></el-icon>
        <template #title>Navigator Four</template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</el-aside>
  <CreateModalPost ref="openModal"></CreateModalPost>
</template>
<script>
import store from '~/store/index.js';
import {
  Location,
  Document,
  Menu as IconMenu,
  Setting,
  Expand,
  Memo
} from "@element-plus/icons-vue";
export default {
  components: {
    Location,
    Document,
    IconMenu,
    Setting,
    Expand
  },
  data: () => ({
    isCollapse: false,
    openCreatePost: false,
    activeMenu: '',
    openMenus: [],
  }),
  computed: {
    asideWidth: function() {
      this.isCollapse ? '64px' : '200px'
    },
    mainMargin: function() {
      this.isCollapse ? '64px' : '200px'
    },
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    async collapse(){
      await store.dispatch('base/stateSideBar', !this.isCollapse)
      this.isCollapse = !this.isCollapse
      const collapseConst = this.isCollapse
      this.emitter.emit("collapseAside", {collapse: collapseConst});
    },
    emitOpenModal() {
      this.openCreatePost = true;
      this.emitter.emit("openModal")
    }
  },
  mounted() {
    if( !sessionStorage.getItem('isCollapse') ){
      sessionStorage.setItem('isCollapse', this.isCollapse)
    }
    // this.isCollapse = store.state.base.user_admin.config.collapseSideBar

     this.emitter.on("closeModal", () => {
      this.openCreatePost = false
     });

     
  }
}
</script>
