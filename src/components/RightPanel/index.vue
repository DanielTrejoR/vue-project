<template>
  <div ref="rightPanel" :class="{show:show}" class="rightPanel-container">
    <div class="rightPanel-background" />
    <div class="rightPanel" ref="panelRef">
      <div class="handle-button" :style="{ top: `${buttonTop}px`, backgroundColor: theme }" @click="show=!show">
        <el-icon>
          <transition name="rotate-icon" mode="out-in">
            <component :is="iconComponent" :key="iconComponent.name"/>
          </transition>
        </el-icon>
      </div>
      <div class="rightPanel-items">
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineProps, computed } from 'vue';
import { useStore } from 'vuex';
import { addClass, removeClass } from '~/utils'
import { useClickOutsideAdvanced } from '~/composables/useClickOutsideAdvanced';
import { Setting, Close } from '@element-plus/icons-vue';
const iconComponent = computed(() => show.value ? Close : Setting);
const store = useStore();
const show = ref(false)
const rightPanel = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const theme = computed(() => store.state.settings?.theme || '#1890ff');

const props = withDefaults(defineProps<{
  clickNotClose?: boolean;
  buttonTop?: number;
}>(), {
  clickNotClose: false,
  buttonTop: 250
});


function insertToBody() {
    const elx = rightPanel.value
    const body = document.querySelector('body')
    if (elx && body) {
      body.insertBefore(elx, body.firstChild);
    }
  }

useClickOutsideAdvanced(
  panelRef,
  () => { show.value = false },
  [
    '.ep-color-hue-slider',
    '.ep-color-svpanel',
    '.ep-color-predefine',
    '.ep-color-dropdown',
    '.rightPanel',
    '.darker-switch'
  ],
  show
);

watch(show, (value) => {
  
  if (value) {
    addClass(document.body, 'showRightPanel');
  } else {
    removeClass(document.body, 'showRightPanel');
  }
});

onMounted(() => {
  insertToBody();
})

onBeforeUnmount(() => {
  rightPanel.value?.remove();
});

</script>
<style scoped lang="scss">

.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}

.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  transition: opacity 0.4s ease;
  opacity: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: -1;
}

.rightPanel {
  width: 100%;
  max-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  transform: translateX(100%);
  transition: transform 0.35s ease, opacity 0.3s ease;
  background: #fff;
  z-index: 40000;
  &.mobile {
    transform: translateY(100%);
  }
  &:not(.mobile) {
    transform: translateX(100%);
  }
}

.show {
  transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translateX(0);
    opacity: 1;
    &.mobile {
      transform: translateY(0);
    }
    &:not(.mobile) {
      transform: translateX(0);
    }
  }
}


.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 55px;
  i {
    font-size: 24px;
    line-height: 48px;
  }
}

.rightPanel {
  transition: transform 0.35s cubic-bezier(0.7, 0.3, 0.1, 1), opacity 0.3s ease;
}

.rotate-icon-enter-active,
.rotate-icon-leave-active {
  transition: transform 0.3s ease;
}
.rotate-icon-enter-from,
.rotate-icon-leave-to {
  transform: rotate(180deg);
}


</style>