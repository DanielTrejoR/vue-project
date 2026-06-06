<template>
  <div :class="{ show }" class="header-search">
    <el-button :icon="!show ? Search : Close" circle @click.stop="click" />
    <el-select
      ref="headerSearchSelect"
      v-model="search"
      :remote-method="querySearch"
      filterable
      default-first-option
      remote
      placeholder="Search"
      class="header-search-select"
      @change="change"
    >
      <el-option
        v-for="item in options"
        :key="item.path"
        :value="item"
        :label="Array.isArray(item.title) ? item.title.join(' > ') : item.title || ''"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import path from 'path'
import {
  Search, Close
} from '@element-plus/icons-vue'
// 🔧 Store y Router
const store = useStore()
const router = useRouter()

// 🔁 Refs
const search = ref('')
const options = ref([])
const searchPool = ref([])
const show = ref(false)
const fuse = ref()
const headerSearchSelect = ref()

// 🧠 Computed
const routes = computed(() => store.getters.permission_routes)

const generateRoutes = (routes, basePath = '/', prefixTitle = []) => {
  let res = []

  for (const router of routes) {
    // skip hidden router
    if (router.hidden) continue

    const data = {
      path: resolvePath(basePath, router.path),
      title: [...prefixTitle]
    }
    if (router.meta && router.meta.title) {
      data.title = [...data.title, router.meta.title]
      
      if (router.redirect !== 'noRedirect') {
        res.push(data)
      }
    }

    if (router.children) {
      const children = generateRoutes(router.children, data.path, data.title)
      if (children.length) res.push(...children)
    }
  }

  return res
}

function initFuse(list) {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'path', weight: 0.3 }
    ]
  })
}

function querySearch(query) {
  if (query !== '') {
    const results = fuse.value?.search(query) ?? []
    options.value = results
    .map(r => r.item)
    .filter(item => Array.isArray(item.title) && item.path)
  } else {
    options.value = []
  }
}

function click() {
  show.value = !show.value
  if (show.value) {
    headerSearchSelect.value?.focus()
  }
}

function close() {
  headerSearchSelect.value?.blur()
  options.value = []
  show.value = false
}

function change(val) {
  router.push(val.path)
  search.value = ''
  options.value = []
  nextTick(() => {
    show.value = false
  })
}

function resolvePath(basePath, routePath) {
  if (routePath.startsWith('/')) return routePath
  return `${basePath.replace(/\/$/, '')}/${routePath.replace(/^\//, '')}`
}

// 👀 Watchers
watch(routes, (newRoutes) => {
  searchPool.value = generateRoutes(newRoutes)
}, { immediate: true })

watch(searchPool, (list) => {
  initFuse(list)
}, { immediate: true })

watch(show, (value) => {
  if (value) {
    document.body.addEventListener('click', close)
  } else {
    document.body.removeEventListener('click', close)
  }
})

// 🧹 Limpieza
onUnmounted(() => {
  document.body.removeEventListener('click', close)
})

// 🧭 Inicialización
onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})

</script>
<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
  }

  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    :deep( .el-input__inner) {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>