<template>
    <div
        v-if="isExternal"
        :style="styleExternalIcon"
        class="svg-external-icon svg-icon"
    />
    <svg
        v-else
        :class="svgClass"
        aria-hidden="true"
    >
        <use :href="iconName" />
    </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isExternal as checkIsExternal } from '~/utils/validate'

interface Props {
    iconClass?: string
    className?: string
}

const props = defineProps<Props>()
const icon = computed(() => props.iconClass || '')
const isExternal = computed(() => checkIsExternal(icon.value))

const iconName = computed(() => `#icon-${icon.value}`)

const svgClass = computed(() =>
    props.className ? `svg-icon ${props.className}` : 'svg-icon'
)

const styleExternalIcon = computed(() => ({
  mask: `url(${icon.value}) no-repeat 50% 50%`,
  '-webkit-mask': `url(${icon.value}) no-repeat 50% 50%`
}))
</script>

<style scoped>
.svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}

.svg-external-icon {
    background-color: currentColor;
    mask-size: cover !important;
    display: inline-block;
}

.svg-icon:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>
