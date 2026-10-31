<template>
  <div class="tags-view">
    <el-scrollbar ref="scrollbar" class="tags-view__scroll" @wheel.prevent="onWheel">
      <div class="tags-view__list">
        <router-link
          v-for="view in tagsView.visitedViews"
          :key="view.path"
          :ref="el => setTagRef(view.path, el)"
          :to="view.fullPath"
          class="tags-view__item"
          :class="{ 'is-active': isActive(view) }"
          @click.middle.prevent="closeTag(view)"
          @contextmenu.prevent="openMenu(view, $event)"
        >
          <span>{{ view.title }}</span>
          <el-icon
            v-if="!view.affix"
            class="tags-view__close"
            :aria-label="`Cerrar ${view.title}`"
            @click.prevent.stop="closeTag(view)"
          ><Close /></el-icon>
        </router-link>
      </div>
    </el-scrollbar>

    <!-- menú del clic derecho -->
    <ul
      v-if="menu.visible"
      class="tags-view__menu"
      :style="{ left: `${menu.left}px`, top: `${menu.top}px` }"
      role="menu"
    >
      <li role="menuitem" @click="refresh(menu.view)"><el-icon><Refresh /></el-icon>Recargar</li>
      <li v-if="!menu.view?.affix" role="menuitem" @click="closeTag(menu.view)"><el-icon><Close /></el-icon>Cerrar</li>
      <li role="menuitem" @click="closeOthers(menu.view)"><el-icon><CircleClose /></el-icon>Cerrar las demás</li>
      <li role="menuitem" @click="closeAll"><el-icon><Remove /></el-icon>Cerrar todas</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, Refresh, CircleClose, Remove } from '@element-plus/icons-vue'
import { useTagsViewStore } from '~/stores/tagsView'

type TagView = { name: string, path: string, fullPath: string, title: string, affix?: boolean }

const route = useRoute()
const router = useRouter()
const tagsView = useTagsViewStore()

const isActive = (view: TagView) => view.path === route.path

// ---- cada página visitada del panel abre (o reutiliza) su pestaña y queda a la vista
const scrollbar = ref()
const tagRefs = new Map<string, HTMLElement>()
const setTagRef = (path: string, el: any) => {
  if (el?.$el) tagRefs.set(path, el.$el)
  else tagRefs.delete(path)
}

watch(() => route.fullPath, async () => {
  tagsView.addView(route)
  await nextTick()
  tagRefs.get(route.path)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
}, { immediate: true })

// la rueda vertical del mouse desplaza la barra en horizontal
const onWheel = (event: WheelEvent) => {
  const wrap = scrollbar.value?.wrapRef as HTMLElement | undefined
  if (wrap) wrap.scrollLeft += event.deltaY || event.deltaX
}

// ---- cerrar: si es la pestaña actual, se pasa a la última que quede
const goToLast = () => {
  const last = tagsView.visitedViews[tagsView.visitedViews.length - 1]
  router.push(last ? last.fullPath : '/admin/dashboard')
}

const closeTag = (view?: TagView | null) => {
  closeMenu()
  if (!view || view.affix) return
  tagsView.delView(view)
  if (isActive(view)) goToLast()
}

const closeOthers = (view?: TagView | null) => {
  closeMenu()
  if (!view) return
  tagsView.delOthersViews(view)
  if (!isActive(view)) router.push(view.fullPath)
}

const closeAll = () => {
  closeMenu()
  tagsView.delAllViews()
  goToLast()
}

// recargar: se saca de la caché y se pasa por /redirect para que el componente se vuelva a crear
const refresh = async (view?: TagView | null) => {
  closeMenu()
  if (!view) return
  tagsView.delCachedView(view)
  await nextTick()
  router.replace({ path: `/redirect${view.fullPath}` })
}

// ---- menú contextual
const menu = reactive<{ visible: boolean, left: number, top: number, view: TagView | null }>({
  visible: false, left: 0, top: 0, view: null,
})

const openMenu = (view: TagView, event: MouseEvent) => {
  // que no se salga por la derecha de la ventana
  const MENU_WIDTH = 180
  menu.left = Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 8)
  menu.top = event.clientY
  menu.view = view
  menu.visible = true
}

const closeMenu = () => {
  menu.visible = false
}

watch(() => menu.visible, visible => {
  if (visible) {
    document.addEventListener('click', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
  } else {
    document.removeEventListener('click', closeMenu)
    window.removeEventListener('scroll', closeMenu, true)
  }
})

onBeforeUnmount(closeMenu)
</script>

<style scoped>
.tags-view {
  position: relative;
  height: 38px;
  border-bottom: 1px solid var(--ep-border-color-light);
  background: var(--ep-bg-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.tags-view__list {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  white-space: nowrap;
}

.tags-view__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--ep-border-color);
  border-radius: 4px;
  color: var(--ep-text-color-regular);
  background: var(--ep-bg-color);
  font-size: 12px;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.tags-view__item:hover {
  color: var(--ep-color-primary);
}

/* la pestaña actual: color principal y un punto blanco delante, no solo color */
.tags-view__item.is-active {
  color: #fff;
  background: var(--ep-color-primary);
  border-color: var(--ep-color-primary);
}

.tags-view__item.is-active::before {
  content: '';
  width: 6px;
  height: 6px;
  margin-right: 2px;
  border-radius: 50%;
  background: #fff;
}

.tags-view__close {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 11px;
  transition: background-color 0.15s;
}

.tags-view__close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
}

.tags-view__menu {
  position: fixed;
  z-index: 3000;
  min-width: 160px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid var(--ep-border-color-light);
  border-radius: 6px;
  background: var(--ep-bg-color-overlay);
  box-shadow: var(--ep-box-shadow-light);
  font-size: 13px;
}

.tags-view__menu li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  color: var(--ep-text-color-regular);
  cursor: pointer;
}

.tags-view__menu li:hover {
  background: var(--ep-fill-color-light);
  color: var(--ep-color-primary);
}
</style>
