<template>
	<!-- <RouterLink 
    :to="{name: 'category_posts', params: {category: category.url }}"
    > -->
        
		<v-chip
		class="ma-2"
		color="pink"
		>
		#{{ category.name }}
		</v-chip>
	<!-- </RouterLink> -->
</template>

<script>
	export default{
		props: ['category']
	}
</script>
