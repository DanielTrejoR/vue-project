<template>
  <div class="upload-container">
    <el-button
      :style="{ background: props.color, borderColor: props.color }"
      icon="Upload"
      size="small"
      type="primary"
      @click="dialogVisible = true"
    >
      upload
    </el-button>

    <el-dialog v-model="dialogVisible">
      <el-upload
        multiple
        class="editor-slide-upload"
        list-type="picture-card"
        action="https://httpbin.org/post"
        :file-list="fileList"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :show-file-list="true"
      >
        <el-button size="small" type="primary">Subir imagenes..</el-button>
      </el-upload>

      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Confirm</el-button>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
// Props
const props = defineProps<{
  color?: string
}>()
props.color ??= '#1890ff'

// Emits
const emit = defineEmits<{
  (e: 'successCBK', files: UploadedImage[]): void
}>()

// Types
interface UploadedImage {
  uid: string
  width: number
  height: number
  url?: string
  hasSuccess: boolean
}

// Refs & reactive
const dialogVisible = ref(false)
const fileList = ref<UploadFile[]>([])
const listObj = reactive<Record<string, UploadedImage>>({})

// Methods
const checkAllSuccess = () => {
  return Object.keys(listObj).every(key => listObj[key].hasSuccess)
}

const handleSubmit = () => {
  if (!checkAllSuccess()) {
    ElMessage.warning(
      'Por favor espera a que todas las imágenes se suban correctamente. Si hay problemas de red, refresca y vuelve a intentar.'
    )
    return
  }

  emit('successCBK', Object.values(listObj))
  Object.keys(listObj).forEach(k => delete listObj[k])
  fileList.value = []
  dialogVisible.value = false
}

const handleSuccess = (response: any, file: UploadFile) => {
  const uid = file.uid
  const entry = Object.values(listObj).find(item => item.uid === uid)
  if (entry) {
    entry.url = response?.files?.file || ''
    entry.hasSuccess = true
  }
}

const handleRemove = (file: UploadFile) => {
  const uid = file.uid
  for (const key in listObj) {
    if (listObj[key].uid === uid) {
      delete listObj[key]
    }
  }
}

const beforeUpload = (file: File) => {
  const uid = (file as UploadFile).uid
  const urlCreator = window.URL || window.webkitURL
  return new Promise((resolve) => {
    const img = new Image()
    img.src = urlCreator.createObjectURL(file)
    img.onload = function () {
      listObj[uid] = {
        uid,
        width: img.width,
        height: img.height,
        hasSuccess: false
      }
      resolve(true)
    }
  })
}
</script>

<style scoped lang="scss">
.editor-slide-upload {
  margin-bottom: 20px;

  :deep(.el-upload--picture-card) {
    width: 100%;
  }
}
</style>
