<template>
    <div v-if="!item.hidden">
        <div v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren) &&  !item.alwaysShow">
            <Link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
                <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
                    <Item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
                </el-menu-item>
            </Link>
        </div>
        <div v-else>
            <el-sub-menu :index="resolvePath(item.path)">
                <template #title>
                    <Item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
                </template>
                <SidebarItem
                    v-for="child in item.children"
                    :key="child.path"
                    :is-nest="true"
                    :item="child"
                    :base-path="resolvePath(child.path)"
                    class="nest-menu"
                />
            </el-sub-menu>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from "vue"
import { isExternal } from '~/utils/validate'
import Item from "./Item.vue"
const onlyOneChild = ref(null);
const props = defineProps({
    item: {
        type: Object,
        required: false
    },
    isNest: {
        type: Boolean,
        default: false
    },
    basePath: {
        type: String,
        required: false
    }
})

function hasOneShowingChild(children = [], parent) {
        const showingChildren = children.filter(item => {
            if (props.item?.hidden) {
            return false
            } else {
            // Temp set(will be used if only has one showing child)
            onlyOneChild.value = item
            return true
            }
        })

        // When there is only one child router, the child router is displayed by default
        if (showingChildren.length === 1) {
            return true
        }

        // Show parent if there are no child router to display
        if (showingChildren.length === 0) {
            onlyOneChild.value = { ... parent, path: '', noShowingChildren: true }
            return true
        }

        return false
    }

function resolvePath(routePath: string): string {
    if (isExternal(routePath)) return routePath
    if (isExternal(props.basePath)) return props.basePath

    // Evita dobles slashes o errores en la unión
    const base = props.basePath?.replace(/\/$/, '') || ''
    const route = routePath?.replace(/^\//, '') || ''

    return `${base}/${route}`
}
onMounted(() => {
  console.log('sidebar mounted')
})
onUnmounted(() => {
  console.log('sidebar unmounted')
})
</script>