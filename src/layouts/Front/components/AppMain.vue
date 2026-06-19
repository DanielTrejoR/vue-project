<template>
<!-- Front end appMain -->
    <RouterView v-slot="{ Component, route }" >
        <component :is="Component" :key="route.path"></component>
    </RouterView>
</template>
<script>
export default {
    
}
</script>