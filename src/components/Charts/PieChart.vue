<template>
    <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts';

import 'echarts/theme/macarons' // echarts theme

import { isDark } from "~/composables";

export default {
    props: {
        className: {
            type: String,
            default: 'chart'
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: '300px'
        }
    },
    data() {
        return {
            chart: null,
            darkMode: isDark
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.initChart()
        })
    },
    watch: {
        // whenever question changes, this function will run
        darkMode() {
            if (!this.chart) {
                return
            }
                this.chart.dispose()
                this.chart = null
                this.initChart();
        }
    },
    beforeDestroy() {
        if (!this.chart) {
            return
        }
        this.chart.dispose()
        this.chart = null
    },
    methods: {
        initChart() {
            this.chart = echarts.init(this.$el, this.darkMode ? 'dark' : 'light')

            this.chart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    left: 'center',
                    bottom: '10',
                    data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
                },
                series: [
                    {
                        name: 'WEEKLY WRITE ARTICLES',
                        type: 'pie',
                        roseType: 'radius',
                        radius: [15, 95],
                        center: ['50%', '38%'],
                        data: [
                            { value: 320, name: 'Industries' },
                            { value: 240, name: 'Technology' },
                            { value: 149, name: 'Forex' },
                            { value: 100, name: 'Gold' },
                            { value: 59, name: 'Forecasts' }
                        ],
                        animationEasing: 'cubicInOut',
                        animationDuration: 1000
                    }
                ]
            })
        }
    }
}
</script>
