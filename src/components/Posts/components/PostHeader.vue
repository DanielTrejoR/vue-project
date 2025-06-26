<template>
	<v-row
        align="start"
        no-gutters
        style="height: 100px;"
    >
        <v-col cols="2">
            <v-card-subtitle class="pt-4 d-flex justify-start">
                {{ post.published_date }} / {{ post.owner.name }}
            </v-card-subtitle>
        </v-col>
        <v-col>
            <h1 class="pt-3" v-text="post.title"></h1>
        </v-col>
        
        <v-col cols="2" class="d-flex justify-end">
            <category-link :category="post.category" />
        </v-col>
        
        <v-col cols="12">
            <v-divider class="pt-1 border-opacity-50"></v-divider>
        </v-col>
	</v-row>
</template>

<script>
	export default {
		props: ['post']
	}
</script>
