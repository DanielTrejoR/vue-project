<template>
  <v-chart ref="chartLine" class="chart" :option="option" autoresize :theme="darkMode ? 'dark' : 'light'" />
</template>
<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LinesChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

import { defineComponent } from 'vue';
import { isDark } from "~/composables";
use([
  CanvasRenderer,
  LinesChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);
export default defineComponent({ 
  components: {
    VChart,
  },
  data: () => ({
      newVisitis: {
      expectedData: [100, 120, 161, 134, 105, 160, 165],
      actualData: [120, 82, 91, 154, 162, 140, 145]
      },
      messages: {
        expectedData: [200, 192, 120, 144, 160, 130, 140],
        actualData: [180, 160, 151, 106, 145, 150, 130]
      },
      purchases: {
        expectedData: [80, 100, 121, 104, 105, 90, 100],
        actualData: [120, 90, 100, 138, 142, 130, 130]
      },
      shoppings: {
        expectedData: [130, 140, 141, 142, 145, 150, 160],
        actualData: [120, 82, 91, 154, 162, 140, 130]
      },
      option: {
        xAxis: {
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        boundaryGap: false,
        axisTick: {
          show: false
        }
      },
      grid: {
        left: 10,
        right: 10,
        bottom: 20,
        top: 30,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        padding: [5, 10]
      },
      yAxis: {
        axisTick: {
          show: false,
        }
      },
      legend: {
        data: ['expected', 'actual']
      },
      series: [{
        name: 'expected', lineStyle: {
            color: '#FF005A',
            lineStyle: {
              color: '#FF005A',
              width: 2
          }
        },
        smooth: true,
        type: 'line',
        data: [100, 120, 161, 134, 105, 160, 165],
        animationDuration: 2800,
        animationEasing: 'cubicInOut'
      },
      {
        name: 'actual',
        smooth: true,
        type: 'line',
        lineStyle: {
          color: '#3888fa',
          lineStyle: {
            color: '#3888fa',
            width: 2
          },
          areaStyle: {
          color: '#f3f8ff'
          }
        },
        data: [120, 82, 91, 154, 162, 140, 145],
        animationDuration: 2800,
        animationEasing: 'quadraticOut'
      }]
      },
      darkMode: isDark
  }),
  watch: {
      // whenever question changes, this function will run
    darkMode() {
      this.$refs.chartLine.clear(); // Clear the chart
      this.$refs.chartLine.setOption(this.option);
    }
  },
})
</script>
<style scoped>
.chart {
  height: 350px;
  width: 100%;
}

</style>
