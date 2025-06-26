<template>
	<!-- <RouterLink :to="{name: 'tags_posts', params: {tag: tag.url} }"> -->
		<v-chip
		class="ma-2"
		color="pink"
		text-color="white"
		>
    		<v-icon start icon="mdi mdi-label"></v-icon>
			{{ tag.name }}
		</v-chip>
    <!-- </RouterLink> -->
</template>
<script>
	export default{
		props: ['tag']
	}
</script>