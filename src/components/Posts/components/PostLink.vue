<template>
<div>
	<RouterLink
	:to="{name: 'ViewPost', params: {url: post.url} }
	">
		<slot />
	</RouterLink>
</div>
</template>
<script>
	export default{
		props: ['post']
	}
</script>