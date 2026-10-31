<template>
  <!-- :key recrea la gráfica al cambiar de tema (vue-echarts no reaplica la opción al cambiar theme) -->
  <v-chart
    :key="isDark ? 'dark' : 'light'"
    class="echart"
    :style="{ height: `${height}px` }"
    :option="themedOption"
    :theme="isDark ? 'dark' : undefined"
    autoresize
  />
</template>

<script setup lang="ts">
// Gráfica genérica de ECharts para el panel: recibe la opción ya armada y le pone el fondo
// transparente y la tipografía del admin, así se integra con las tarjetas en claro y oscuro.
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DatasetComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { isDark } from '~/composables/useRadialThemeToggle'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DatasetComponent])

const props = withDefaults(defineProps<{
  option: Record<string, any>
  height?: number
}>(), {
  height: 280,
})

const themedOption = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'inherit' },
  ...props.option,
}))
</script>

<style scoped>
.echart {
  width: 100%;
}
</style>
