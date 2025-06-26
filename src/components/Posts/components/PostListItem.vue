<template>
    <article class="pb-5 mb-2">
        <v-card
            class="mx-auto"
            max-width="800"
        >
            <CarouselComponent :photos="['https://cdn.vuetifyjs.com/images/cards/sunshine.jpg']"></CarouselComponent>
            <v-card-title>
                <PostHeader :post="post"></PostHeader>
            </v-card-title>
            <v-card-text>
                <p v-html="post.excerpt"></p>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <span class="c-gray-1 text-capitalize" v-for="tag in post.tags" :key="tag">
                    <TagLink :tag="tag" />
                </span>
            </v-card-actions>
            <div class="text-caption pb-2 mb-2"><PostLink class="text-subtitle-1 text-uppercase c-green" :post="post">Leer mas...</PostLink></div>
        </v-card>
    </article>
</template>

<script>
    export default {
        props: ['post']
    }
</script>

<style lang="scss" scoped>

</style>
