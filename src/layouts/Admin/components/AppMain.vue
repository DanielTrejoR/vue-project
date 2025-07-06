<template>
<el-config-provider namespace="ep">
    <RouterView v-slot="{ Component, route }" >
        <Transition 
            name="theme-fade" mode="out-in"
        >
            <component :is="Component" :key="route.path"></component>
        </Transition>
    </RouterView>
</el-config-provider>
</template>
<style>
#app {
    text-align: center;
    color: var(--ep-text-color-primary);
}

.main-container {
    height: calc(100vh - var(--ep-menu-item-height) - 3px);
}

.theme-fade-enter-active,
.theme-fade-leave-active {
    transition: opacity 0.3s var(--ep-transition-function-fast-bezier);
}

.theme-fade-enter-from,
.theme-fade-leave-to {
    opacity: 0;
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