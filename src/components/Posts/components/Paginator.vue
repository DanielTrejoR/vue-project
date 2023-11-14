<template>
    <div>
        <component :is="componentImport" :items="items"></component>
        <PaginationLinks :pagination="pagination" @change-page="getPost"></PaginationLinks>
    </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'
import store from '~/store/index.js'

export default {
    props: ['url', 'componentName'],
    data(){
        return {
            pagination: {},
            items: []
        }
    },
    computed: {
        componentImport() {
            let data = this.componentName;
            return defineAsyncComponent(() =>
                import( /* @vite-ignore */`./${data}.vue`)
            )
        }
    },
    methods: {
        getPost(page = 1) {
            store.dispatch('getPosts', {
            url: this.url,
            page: page
            })
            .then((res) => {
                this.pagination = res.data;
                this.items = res.data.data;
                delete this.pagination.data;
            }).catch((err) => {
                
            });
        }
    },
    mounted() {
        this.getPost()
    },
}
</script>