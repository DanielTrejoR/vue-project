<template>
  <v-chart ref="chartRadar" class="chart" :theme="darkMode ? 'dark' : 'light'" :option="option" autoresize style="height:500px;width:100%" />
</template>

<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import {  defineComponent } from 'vue';
import { isDark } from "~/composables";

use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

export default defineComponent({
  components: {
    VChart,
  },
  data: () => ({
      darkMode: isDark,
      option: {
        legend: {
          left: 'center',
          bottom: '10',
          data: ['Allocated Budget', 'Expected Spending', 'Actual Spending']
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow' 
          }
        },
        radar: {
          radius: '66%',
          center: ['50%', '42%'],
          splitNumber: 8,
          splitArea: {
            areaStyle: {
              color: 'rgba(127,95,132,.3)',
              opacity: 1,
              shadowBlur: 45,
              shadowColor: 'rgba(0,0,0,.5)',
              shadowOffsetX: 0,
              shadowOffsetY: 15
            }
          },
          indicator: [
            { name: 'Sales', max: 1000 },
            { name: 'Administration', max: 1500 },
            { name: 'Information Technology', max: 1500 },
            { name: 'Customer Support', max: 1500 },
            { name: 'Development', max: 1500  },
            { name: 'Marketing', max: 1500  }
          ],
          splitNumber: 5,
        },
        series: [{
                type: 'radar',
                symbolSize: 0,
                areaStyle: {
                  shadowBlur: 13,
                  shadowColor: 'rgba(0,0,0,.2)',
                  shadowOffsetX: 0,
                  shadowOffsetY: 10,
                  opacity: 1
                },
                data: [
                  {
                    value: [500, 700, 1200, 1100, 1500, 1400],
                    name: 'Allocated Budget'
                  },
                  {
                    value: [400, 900, 1500, 1500, 1300, 1100],
                    name: 'Expected Spending'
                  },
                  {
                    value: [550, 1100, 1200, 1500, 1200, 1200],
                    name: 'Actual Spending'
                  }
                ],
                animationDuration: 2000
        }]
      }
  }),
  watch: {
      // whenever question changes, this function will run
    darkMode() {
      this.$refs.chartRadar.clear(); // Clear the chart
      this.$refs.chartRadar.setOption(this.option);
    }
  }
})

</script>

<style scoped>
.chart {
  height: 450px;
  width: 100%;
}
</style>
