<template>
    <RouterView v-slot="{ Component, route }">
        <Transition name="auth-fade">
            <component :is="Component" :key="route.path"></component>
        </Transition>
    </RouterView>
</template>

<style>
/* fundido entre login, registro y recuperar contraseña (antes con animate.css, 95 kB para esto) */
.auth-fade-enter-active,
.auth-fade-leave-active {
    transition: opacity 0.4s ease;
}

.auth-fade-enter-from,
.auth-fade-leave-to {
    opacity: 0;
}
</style>
