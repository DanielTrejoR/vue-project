<template>
    <el-color-picker
        v-model="theme"
        :predefine="['#409EFF', '#1890ff', '#304156','#212121','#11a983', '#13c2c2', '#6959CD', '#f5222d']"
        class="theme-picker"
        popper-class="theme-picker-dropdown"
    />
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import pkg from 'element-plus/package.json';
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus';

const theme = ref('#ff4500')
const chalk = ref('');
const ORIGINAL_THEME = '#409EFF'
const version = pkg.version;
const store = useStore();
const defaultTheme = computed(() => store.state.settings.theme)
const cssContent = ref<string>('');

const emit = defineEmits<{
    (e: 'change', val: string): void;
}>();

watch(defaultTheme, (val) => {
  console.log('[defaultTheme changed]:', val);
  theme.value = val;
}, { immediate: true });

watch(theme, async (val) => {
  if (typeof val !== 'string') return;

  const oldVal = chalk.value ? theme.value : '#409EFF'; // ORIGINAL_THEME hardcoded
  const themeCluster = getThemeCluster(val.replace('#', ''));
  const originalCluster = getThemeCluster(oldVal.replace('#', ''));

  const $message = ElMessage({
    message: 'Cambiando de tema',
    customClass: 'theme-message',
    type: 'success',
    icon: 'loading'
  });

const applyStyle = (css: string, id: string) => {
    const newStyle = updateStyle(css, originalCluster, themeCluster);
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.innerText = newStyle;
  };

  if (!chalk.value) {
    const url = `https://unpkg.com/element-plus@${version}/dist/index.css`;
    chalk.value = await getCSSString(url);
  }

  applyStyle(chalk.value, 'chalk-style');

  const styles = Array.from(document.querySelectorAll('style')).filter(s =>
    new RegExp(oldVal, 'i').test(s.innerText) && !/Chalk Variables/.test(s.innerText)
  );

  styles.forEach(s => {
    s.innerText = updateStyle(s.innerText, originalCluster, themeCluster);
  });

  emit('change', val);
  setTimeout(() => {
    $message.close();
  }, 1000);
});

function updateStyle(
  style: string,
  oldCluster: string[],
  newCluster: string
): string {
  return oldCluster.reduce((result, color, index) => {
    const regex = new RegExp(color, 'ig');
    return result.replace(regex, newCluster[index]);
  }, style);
}

async function getCSSString(url: string): Promise<string> {
    const res = await fetch(url);
    const text = await res.text();
    return text.replace(/@font-face{[^}]+}/, '');
}

function getThemeCluster(theme: string): string[] {
    const tintColor = (hex: string, tint: number): string => {
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);

        if (tint === 0) return `${r},${g},${b}`;
            r = Math.round(r + tint * (255 - r));
            g = Math.round(g + tint * (255 - g));
            b = Math.round(b + tint * (255 - b));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
    }

    const shadeColor = (hex: string, shade: number): string => {
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);

        r = Math.round((1 - shade) * r);
        g = Math.round((1 - shade) * g);
        b = Math.round((1 - shade) * b);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const pure = theme.replace('#', '').toLowerCase();
    const clusters = [`#${pure}`];
        for (let i = 1; i <= 9; i++) {
            clusters.push(tintColor(pure, Number((i / 10).toFixed(2))));
        }
    clusters.push(shadeColor(pure, 0.1));
    return clusters;
}
</script>
<style>
    .theme-message,
    .theme-picker-dropdown {
      z-index: 99999 !important;
    }

    .theme-picker .ep-color-picker__trigger {
      height: 26px !important;
      width: 26px !important;
      padding: 2px;
      background-color: v-bind(theme); /* opcional, si no se muestra bien */
      border: 1px solid #ddd;
    }

    .theme-picker-dropdown .ep-color-dropdown__link-btn {
      display: none;
    }
</style>