<template>
    <article class="pb-5 mb-2">
        <v-card
            class="mx-auto"
            max-width="800"
        >
            <CarouselComponent v-if="post.photos.length > 0" :photos="post.photos"></CarouselComponent>
            <v-card-title>
                <PostHeader :post="post"></PostHeader>
            </v-card-title>
            <v-card-text class="">
                <p v-html="post.excerpt"></p>
            </v-card-text>
            <v-card-actions class="d-flex justify-start" v-if="post.tags && post.tags.length > 0">
                <span class="c-gray-1 text-capitalize">
                    <TagLink :tags="post.tags" />
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
