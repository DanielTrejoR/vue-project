<template>
     <div id="chart">
        <apexchart :style="darkMode ? 'background: rgb(66, 66, 66) !important;' : 'background: transparent !important;'" ref="chart" type="radar" height="350" :options="chartOptions" :series="series"></apexchart>
      </div>
</template>
<script>
import { isDark } from "~/composables";

export default {
    data: () => ({
        darkMode: isDark,
        series: [{
            name: 'Series 1',
            data: [80, 50, 30, 40, 100, 20],
        }],
        chartOptions: {
            chart: {
                height: 350,
                type: 'radar',
            },
            title: {
                text: 'Basic Radar Chart'
            },
            xaxis: {
                categories: ['January', 'February', 'March', 'April', 'May', 'June']
            }
        },
    }),
    watch: {
        // whenever question changes, this function will run
        darkMode() {
            this.updateChart()
        }
    },
    methods: {
        updateChart(){
            this.$refs.chart.updateSeries([{
                data: this.series.data
            }], false, true)
            const dark = this.darkMode
            this.chartOptions = {
                theme: {
                    mode: dark ? 'dark' : 'light'
                }
            }
        }
    },
    mounted() {
        this.chartOptions = {
            theme: {
                mode: this.darkMode ? 'dark' : 'light'
            },
            chart: {
                height: 350,
                type: 'radar',
                background: 'rgba(0, 0, 0, 0)'
            },
        }
    },
}
</script>
<style scoped>

</style>