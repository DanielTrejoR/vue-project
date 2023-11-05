<script>
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';

export default {
  setup() {
    const main = ref();
    let tl;
    let ctx;

    function toggleTimeline() {
      tl.reversed(!tl.reversed());
    }

    onMounted(() => {
      ctx = gsap.context((self) => {
        const boxes = self.selector('.box');
        tl = gsap
          .timeline()
          .to(boxes[0], { x: 120, rotation: 360 })
          .to(boxes[1], { x: -120, rotation: -360 }, '<')
          .to(boxes[2], { y: -166 })
          .reverse();
      }, main.value); // <- Scope!
    });

    onUnmounted(() => {
      ctx.revert(); // <- Easy Cleanup!
    });

    return { toggleTimeline, main };
  },
};
</script>

<template>
  <main>
    <div class="mb-4" ref="main">
      <h1>Use the button to toggle a Timeline</h1>
      <div>
        <el-button @click="toggleTimeline">Toggle Timeline</el-button>
      </div>
      <div class="box">Box 1</div>
      <div class="box">Box 2</div>
      <div class="box">Box 3</div>
    </div>
  </main>
</template>