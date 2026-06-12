<template>
<div>
    <v-carousel :hide-delimiters="photos.length > 1 ? false : true" :show-arrows="photos.length > 1 ? 'hover' : false" hide-delimiter-background>
        <v-carousel-item v-for="photo in photos" v-bind:key="photo"
            :src="photo.full_url"
            cover
        ></v-carousel-item>
    </v-carousel>
</div>
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