<template>
<div class="app-breadcrumb">
    <el-breadcrumb separator="/">
        <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
            <span
            v-if="item.redirect === 'noRedirect' || index === levelList.length - 1"
            class="no-redirect"
            >
            {{ item.meta.title }}
            </span>
            <a v-else @click.prevent="handleLink(item)">
            {{ item.meta.title }}
            </a>
        </el-breadcrumb-item>
        </transition-group>
    </el-breadcrumb>
</div>
</template>

<script setup lang="ts">
import pathToRegexp from 'path-to-regexp'
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

const route = useRoute()
const router = useRouter()
const levelList = ref<RouteRecordNormalized[]>([])

onMounted(getBreadcrumb)

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === oldPath || newPath.startsWith('/redirect/')) return
    getBreadcrumb()
  }
)

function getBreadcrumb() {
  let matched = route.matched.filter(item => item.meta?.title)
  const first = matched[0]

  if (!isDashboardRoute(first)) {
    matched = [
      { path: '/dashboard', meta: { title: 'Dashboard' } } as RouteRecordNormalized,
      ...matched,
    ]
  }

  levelList.value = matched.filter(item => item.meta?.title && item.meta?.breadcrumb !== false)
}

function isDashboardRoute(item?: RouteRecordNormalized | null) {
  const name = item?.name?.toString().trim().toLowerCase()
  return name === 'dashboard'
}

function compilePath(path: string) {
  const { params } = route
  return pathToRegexp.compile(path)(params)
}

function handleLink(item: RouteRecordNormalized) {
  if (item.redirect && item.redirect !== 'noRedirect') {
    router.push(item.redirect)
  } else {
    router.push(compilePath(item.path))
  }
}
</script>

<style scoped lang="scss">
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  :deep(.el-breadcrumb__item) {
    transition: all 0.3s ease;
  }

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
