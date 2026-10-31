<template>
    <!-- más bajo en pantallas chicas: 500px fijos ocupaban casi todo el teléfono -->
    <v-carousel 
        :height="$vuetify.display.smAndDown ? 280 : 460"
        :hide-delimiters="photos.length > 1 ? false : true" :show-arrows="photos.length > 1 ? 'hover' : false" 
        hide-delimiter-background
        transition-duration="700" 
        crossfade
        >
        <v-carousel-item v-for="photo in photos" v-bind:key="photo"
            :src="photo.full_url"
            cover
        ></v-carousel-item>
    </v-carousel>
</template>
<script>
export default {
    props: {
        photos: {
            require: true,
            type: Array
        }
    }
}
</script>