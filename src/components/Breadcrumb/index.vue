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
import { compile } from 'path-to-regexp'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { RouteRecordNormalized, RouteLocationRaw } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import emitter from '~/utils/emitter'

const route = useRoute()
const router = useRouter()
// lo que necesita cada miga: una ruta del router o la del dashboard que se agrega al inicio
type Crumb = Pick<RouteRecordNormalized, 'path' | 'meta'> & Partial<Pick<RouteRecordNormalized, 'name' | 'redirect'>>
const levelList = ref<Crumb[]>([])

onMounted(getBreadcrumb)

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === oldPath || newPath.startsWith('/redirect/')) return
    getBreadcrumb()
  }
)

function getBreadcrumb() {
  let matched: Crumb[] = route.matched.filter(item => item.meta?.title)
  const first = matched[0]

  if (!isDashboardRoute(first)) {
    matched = [
      { path: '/admin/dashboard', meta: { title: 'Dashboard' } },
      ...matched,
    ]
  }
  
  levelList.value = matched.filter(item => item.meta?.title && item.meta?.breadcrumb !== false)
}

function isDashboardRoute(item?: Crumb | null) {
  const name = item?.name?.toString().trim().toLowerCase()
  return name === 'dashboard'
}

function compilePath(path: string) {
  const { params } = route
  return compile(path)(params as Record<string, string>)
}

function handleLink(item: Crumb) {
  if (item.redirect && item.redirect !== 'noRedirect') {
    router.push(item.redirect as RouteLocationRaw)
  } else {
    router.push(compilePath(item.path))
  }
}

// el editor de posts cambia el título de la última miga ("Editando: ...")
const onTitleUpdate = (newTitle: unknown) => {
  const last = route.matched[route.matched.length - 1]
  if (last?.meta) {
    last.meta.title = newTitle as string
  }
  route.meta.title = newTitle as string
  getBreadcrumb();
}
onMounted(() => emitter.on('updateBreadcrumbTitle', onTitleUpdate))
// sin esto cada montaje del header sumaba otro listener
onBeforeUnmount(() => emitter.off('updateBreadcrumbTitle', onTitleUpdate))

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
