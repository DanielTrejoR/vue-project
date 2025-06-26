<template>
<v-carousel :hide-delimiters="photos.length > 1 ? false : true" :show-arrows="photos.length > 1 ? 'hover' : false" hide-delimiter-background>
    <v-carousel-item v-for="photo in photos" v-bind:key="photo"
        :src="photo"
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