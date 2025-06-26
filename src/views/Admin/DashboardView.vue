<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import axiosClient from "~/axios.js";

const count = ref(0);
const input = ref("element-plus");

const curDate = ref("");

const toast = () => {
  ElMessage.success("Hello");
};

const value1 = ref(true);
const images = [
  "https://images2.alphacoders.com/111/111290.jpg",
  "https://images4.alphacoders.com/206/206454.png",
  "https://images2.alphacoders.com/737/737550.jpg"
  ]

const checkSession = () => {
  axiosClient.get("/user")
    .then((res) => {
      console.log(res.data);
      
    })
    .catch(error => {
      console.error("Error fetching CSRF cookie:", error);
    });
}
</script>

<template>
  <div>
    <el-row >
      <el-col :offset="6" :span="12" class="" style="text-align:center">
          <el-carousel :interval="5000" type="card" height="300px">
            <el-carousel-item v-for="item in images" :key="item">
              <el-image :src="item" fit="cover"/>
            </el-carousel-item>
          </el-carousel>
      </el-col>
    </el-row>
    <el-row style="padding:16px 16px 0;margin-bottom:32px;">
      <LineChart></LineChart>
    </el-row>
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <RadarApexChart></RadarApexChart>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <PieChart></PieChart>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <BarChart></BarChart>
          </div>
        </el-col>
    </el-row>
    <el-row :gutter="32">
      <el-col :lg="8">
          <RadarChart></RadarChart>
      </el-col>
    </el-row>
    <!-- example components -->
    <div class="mb-4">
      <el-button size="large" @click="toast">El Message</el-button>
    </div>

    <div class="my-2 text-center flex flex-wrap justify-center items-center">
      <el-button @click="count++">count is: {{ count }}</el-button>
      <el-button type="primary" @click="count++">count is: {{ count }}</el-button>
      <el-button type="success" @click="count++">count is: {{ count }}</el-button>
      <el-button type="warning" @click="count++">count is: {{ count }}</el-button>
      <el-button type="danger" @click="count++">count is: {{ count }}</el-button>
      <el-button type="info" @click="count++">count is: {{ count }}</el-button>
    </div>

    <div>
      <el-tag type="success" class="m-1">Tag 1</el-tag>
      <el-tag type="warning" class="m-1">Tag 1</el-tag>
      <el-tag type="danger" class="m-1">Tag 1</el-tag>
      <el-tag type="info" class="m-1">Tag 1</el-tag>
    </div>
    <div>
      <el-button class="ep-button" type="primary" @click="checkSession()">Check Session</el-button>
    </div>

    <div>
      <el-switch v-model="value1" />
      <el-switch
        v-model="value1"
        class="m-2"
        style="--ep-switch-on-color: black; --ep-switch-off-color: gray;"
      />
    </div>

    <div class="my-2">
      <el-input class="m-2" v-model="input" style="width: 200px" />
      <el-date-picker
        class="m-2"
        v-model="curDate"
        type="date"
        placeholder="Pick a day"
      ></el-date-picker>
    </div>
  </div>
</template>

<style>
.ep-button {
  margin: 4px;
}
.ep-button + .ep-button {
  margin-left: 0;
  margin: 4px;
}

.chart-wrapper {
  padding: 16px 16px 0;
  margin-bottom: 32px;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

