<template>
<div class="d-flex align-center float-end">
        <v-list
            class="d-flex"
        >
            <v-list-item
                v-for="item in items"
                :key="item.id"
                :href="item.link"
                target="_blank"
                :title="item.name"
                :prepend-icon="item.icon"
            />
        </v-list>
</div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    currentUrl: {
        type: String,
        required: true
    }
})
const items = computed(() => [
  { icon: 'fa:fab fa-facebook', id: 1, name: 'Facebook', link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.currentUrl)}` },
  { icon: 'fa:fab fa-x-twitter', id: 2, name: 'X (Twitter)', link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(props.currentUrl)}&text=${encodeURIComponent(props.title)}` },
  { icon: 'fa:fab fa-pinterest', id: 3, name: 'Pin it', link: `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(props.currentUrl)}&description=${encodeURIComponent(props.title)}` }, // Instagram no tiene sharer directo
])
</script>