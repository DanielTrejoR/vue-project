<template>
  <div :class="{ fullscreen }" class="tinymce-container" :style="{ width: containerWidth }">
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <div class="editor-custom-btn-container">
      <EditorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import EditorImage, { type UploadedImage } from './components/EditorImage.vue'
import type { Editor } from 'tinymce'
import tinymce from './setup'
import plugins from './plugins'
import toolbar from './toolbar'
import { isDark } from '~/composables/useRadialThemeToggle'

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
const hasInit = ref(false)

// Computed style
const containerWidth = computed(() => {
  const w = props.width || 'auto'
  return /^[\d]+(\.[\d]+)?$/.test(String(w)) ? `${w}px` : w
})

// Valor que llega desde afuera (p. ej. el post al cargar la edición). Se compara con el contenido del
// editor: si es el mismo, el cambio vino del propio editor y no hay que reescribirlo (perdería el cursor).
watch(() => props.modelValue, val => {
  const editor = hasInit.value ? tinymce.get(tinymceId.value) : null
  if (editor && (val || '') !== editor.getContent()) {
    editor.setContent(val || '')
  }
})

// Lifecycle
onMounted(() => {
  initTinymce()
})

// el editor no cambia de skin en caliente: se vuelve a crear con el contenido actual
watch(isDark, () => {
  if (!hasInit.value) return
  destroyTinymce()
  hasInit.value = false
  initTinymce()
})

onBeforeUnmount(() => {
  destroyTinymce()
})

// Tinymce init
function initTinymce() {
  tinymce.init({
    selector: `#${tinymceId.value}`,
    // uso GPL autohospedado: no necesita cuenta ni API key de Tiny
    license_key: 'gpl',
    // skins empaquetadas en ./setup.ts (sin pedirlas a ningún CDN)
    skin_url: 'default',
    skin: isDark.value ? 'oxide-dark' : 'oxide',
    content_css: isDark.value ? 'dark' : 'default',
    promotion: false,
    branding: false,
    height: props.height || 360,
    body_class: 'panel-body',
    object_resizing: false,
    toolbar: props.toolbar?.length ? props.toolbar : toolbar,
    menubar: props.menubar || 'file edit insert view format table',
    plugins: plugins,
    convert_urls: false,
    init_instance_callback: (instance: Editor) => {
      if (props.modelValue) instance.setContent(props.modelValue)
      hasInit.value = true
      instance.on('NodeChange Change KeyUp SetContent', () => {
        const content = instance.getContent()
        if (content !== (props.modelValue || '')) {
          emit('update:modelValue', content)
        }
      })
    },
    setup(instance: Editor) {
      instance.on('FullscreenStateChanged', (e: { state: boolean }) => {
        fullscreen.value = e.state
      })
    }
  })
}

function destroyTinymce() {
  const editor = tinymce.get(tinymceId.value)
  if (fullscreen.value) editor?.execCommand('mceFullScreen')
  editor?.destroy()
}

function imageSuccessCBK(arr: UploadedImage[]) {
  const editor = tinymce.get(tinymceId.value)
  arr.forEach(img => editor?.insertContent(`<img class="wscnph" src="${img.url}" />`))
}
</script>

<style scoped lang="scss">
.tinymce-container {
  position: relative;
  line-height: normal;

  :deep(.mce-fullscreen) {
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
