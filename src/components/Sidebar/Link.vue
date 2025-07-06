<template>
    <component :is="linkType" v-bind="linkProps(to)">
        <slot />
    </component>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { isExternal } from '~/utils/validate' //

const props = defineProps<{
    to: string
}>()

const linkType = computed(() =>
  isExternal(props.to) ? 'a' : RouterLink
)

function linkProps(to: string) {
  return isExternal(to)
    ? { href: to, target: '_blank', rel: 'noopener noreferrer' }
    : { to }
}
</script>