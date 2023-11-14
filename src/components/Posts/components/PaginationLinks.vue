<template>
    <v-container v-if="pagination.last_page > 1">
        <v-row justify="center">
            <v-col cols="8">
                <v-container class="max-width">
                    <v-pagination
                        v-model="page"
                        class="my-4"
                        :length="pagination.last_page"
                        :total-visible="5"
                        @update:model-value="loadData"
                    >
                    </v-pagination>
                </v-container>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
	export default{
		props: ['pagination'],
        data: () => ({
            page: 1
        }),
		methods: {
            loadData() { 
                this.$router.push({ 
                    name: this.$route.name,
                    query: {
                        page: this.page
                    }
                })
                this.$emit('change-page', this.page)
            }
		},
        mounted() {
            this.page = parseInt(this.$route.query.page) || 1
        }
	}
</script>
