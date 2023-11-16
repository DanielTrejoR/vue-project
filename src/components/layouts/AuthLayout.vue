<template>
    <RouterView v-slot="{ Component, route }" >
        <Transition 
            enter-active-class="animate__animated animate__fadeIn"
            leave-active-class="animate__animated animate__fadeOut"
            >
            <component :is="Component" :key="route.path"></component>
        </Transition>
    </RouterView>
</template>
<script>
export default {
    
}
</script>