<template>
  <div :class="{ fullscreen }" class="tinymce-container" :style="{ width: containerWidth }">
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <div class="editor-custom-btn-container">
      <EditorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, defineProps, defineEmits } from 'vue'
import EditorImage from './components/EditorImage.vue'
import plugins from './plugins'
import toolbar from './toolbar'
import load from './dynamicLoadScript'

// Props
const props = defineProps<{
  id?: string
  modelValue?: string
  toolbar?: string[]
  menubar?: string
  height?: number | string
  width?: number | string
}>()

// Emit
const emit = defineEmits<{ (e: 'update:modelValue', content: string): void }>()

// Data refs
const tinymceId = ref(props.id || `vue-tinymce-${Date.now()}`)
const fullscreen = ref(false)
const hasChange = ref(false)
const hasInit = ref(false)
const tinymceCDN = 'https://cdn.jsdelivr.net/npm/tinymce-all-in-one@4.9.3/tinymce.min.js'
//
const languageTypeList = {
  en: 'en',
  zh: 'zh_CN',
  es: 'es_MX',
  ja: 'ja'
}

// Computed style
const containerWidth = computed(() => {
  const w = props.width || 'auto'
  return /^[\d]+(\.[\d]+)?$/.test(String(w)) ? `${w}px` : w
})

// Watch external value update
watch(() => props.modelValue, val => {
  if (!hasChange.value && hasInit.value) {
    setTimeout(() => {
      window.tinymce.get(tinymceId.value)?.setContent(val || '')
    }, 0)
  }
})

// Lifecycle
onMounted(() => {
  load(tinymceCDN, err => {
    if (err) return console.error('Tinymce load error', err)
    initTinymce()
  })
})

onBeforeUnmount(() => {
  destroyTinymce()
})

// Tinymce init
function initTinymce() {
  const editor = window.tinymce
  editor.init({
    selector: `#${tinymceId.value}`,
    language: languageTypeList['en'],
    height: props.height || 360,
    body_class: 'panel-body',
    object_resizing: false,
    toolbar: props.toolbar?.length ? props.toolbar : toolbar,
    menubar: props.menubar || 'file edit insert view format table',
    plugins: plugins,
    convert_urls: false,
    init_instance_callback: instance => {
      if (props.modelValue) instance.setContent(props.modelValue)
      hasInit.value = true
      instance.on('NodeChange Change KeyUp SetContent', () => {
        hasChange.value = true
        emit('update:modelValue', instance.getContent())
      })
    },
    setup(instance) {
      instance.on('FullscreenStateChanged', e => {
        fullscreen.value = e.state
      })
    }
  })
}

function destroyTinymce() {
  const editor = window.tinymce.get(tinymceId.value)
  if (fullscreen.value) editor?.execCommand('mceFullScreen')
  editor?.destroy()
}

function imageSuccessCBK(arr: Array<{ url: string }>) {
  const editor = window.tinymce.get(tinymceId.value)
  arr.forEach(img => editor?.insertContent(`<img class="wscnph" src="${img.url}" />`))
}
</script>

<style scoped lang="scss">
.tinymce-container {
  position: relative;
  line-height: normal;

  ::v-deep(.mce-fullscreen) {
    z-index: 10000;
  }
}

.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}

.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
}

.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}

.editor-upload-btn {
  display: inline-block;
}
</style>
