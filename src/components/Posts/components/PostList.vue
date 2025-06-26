<template>
    <v-container class="posts container">
        <PostListItem v-for="post in items"
        :post="post"
        :key="post.id"
        />

        <article class="post" v-if="! items.length">

            <v-card
                class="mx-auto my-8"
                max-width="344"
                elevation="16"
            >
                <template v-slot:title>
                    Ooops...
                </template>

                <v-card-text>
                    Todavia no hay publicaciones
                </v-card-text>
            </v-card>
        </article>
    </v-container><!-- fin del div.posts.container -->
</template>

<script>
export default {
    props: ['items'],
}
</script>

<style lang="scss">

</style>
