<template>
<el-config-provider namespace="ep">
    <div ref="root" class="app-main">
        <RouterView v-slot="{ Component, route }" >
            <!-- salida corta y entrada algo más larga: la vista nueva aparece rápido sin un hueco en blanco -->
            <Transition name="page" mode="out-in" @after-leave="scrollToTop">
                <component :is="Component" :key="route.path"></component>
            </Transition>
        </RouterView>
    </div>
</el-config-provider>
</template>
<script setup>
import { ref } from 'vue'

const root = ref(null)
// sube al inicio cuando la vista anterior ya salió, para que no se vea el salto;
// también el el-main por si el layout lo deja con scroll propio
const scrollToTop = () => {
    window.scrollTo({ top: 0 })
    root.value?.parentElement?.scrollTo({ top: 0 })
}
</script>
<style>
#app {
    text-align: center;
    color: var(--ep-text-color-primary);
}

.main-container {
    height: calc(100vh - var(--ep-menu-item-height) - 3px);
}

.page-enter-active {
    transition: opacity 0.22s ease-out, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.page-leave-active {
    transition: opacity 0.12s ease-in, transform 0.12s ease-in;
}

.page-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
    .page-enter-active,
    .page-leave-active {
        transition: opacity 0.1s linear;
    }

    .page-enter-from,
    .page-leave-to {
        transform: none;
    }
}

/* barra de progreso (NProgress) con el color del tema mientras carga la vista */
#nprogress .bar {
    background: var(--ep-color-primary);
    height: 3px;
}

#nprogress .peg {
    box-shadow: 0 0 10px var(--ep-color-primary), 0 0 5px var(--ep-color-primary);
}

.ep-aside,
.ep-header,
.ep-main {
    transition: background-color 0.4s ease-in-out, color 0.4s ease-in-out;
}

svg,
.ep-icon {
    transition: fill 0.4s ease-in-out, color 0.4s ease-in-out;
}

</style>