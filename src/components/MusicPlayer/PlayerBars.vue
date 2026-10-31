<template>
  <!-- indicador de la navbar: barras que se mueven mientras suena algo -->
  <span class="player-bars" :class="{ 'is-playing': playing }" aria-hidden="true">
    <span /><span /><span />
  </span>
</template>

<script setup lang="ts">
defineProps<{ playing: boolean }>()
</script>

<style scoped>
.player-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  width: 14px;
  height: 14px;
}

.player-bars span {
  flex: 1;
  height: 30%;
  border-radius: 1px;
  background: currentColor;
  transition: height 0.2s;
}

.player-bars span:nth-child(2) {
  height: 60%;
}

.player-bars.is-playing span {
  animation: bars 0.9s ease-in-out infinite alternate;
}

.player-bars.is-playing span:nth-child(2) {
  animation-delay: -0.3s;
}

.player-bars.is-playing span:nth-child(3) {
  animation-delay: -0.6s;
}

@keyframes bars {
  from { height: 20%; }
  to { height: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .player-bars.is-playing span {
    animation: none;
    height: 70%;
  }
}
</style>
