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
      <!-- sube al backend (POST /api/admin/editor-images) con axios para llevar sesión y CSRF -->
      <el-upload
        multiple
        class="editor-slide-upload"
        list-type="picture-card"
        accept="image/jpeg,image/png,image/gif,image/webp"
        :file-list="fileList"
        :http-request="uploadToServer"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :on-error="handleError"
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
import { ref, reactive } from 'vue'
import type { UploadFile, UploadRawFile, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import axiosClient from '~/plugins/axios'

// Props
const props = withDefaults(defineProps<{
  color?: string
}>(), {
  color: '#1890ff',
})

// Types
export interface UploadedImage {
  uid: number
  width: number
  height: number
  url?: string
  hasSuccess: boolean
}

// Emits
const emit = defineEmits<{
  (e: 'successCBK', files: UploadedImage[]): void
}>()

// Refs & reactive
const dialogVisible = ref(false)
const fileList = ref<UploadFile[]>([])
const listObj = reactive<Record<number, UploadedImage>>({})

const MAX_SIZE_MB = 2

// Methods
const checkAllSuccess = () => {
  return Object.values(listObj).every(item => item.hasSuccess)
}

const uploadToServer = async (options: UploadRequestOptions) => {
  const data = new FormData()
  data.append('file', options.file)
  const res = await axiosClient.post('/admin/editor-images', data)
  return res.data
}

const handleSubmit = () => {
  if (!checkAllSuccess()) {
    ElMessage.warning(
      'Por favor espera a que todas las imágenes se suban correctamente. Si hay problemas de red, refresca y vuelve a intentar.'
    )
    return
  }

  emit('successCBK', Object.values(listObj))
  Object.keys(listObj).forEach(k => delete listObj[Number(k)])
  fileList.value = []
  dialogVisible.value = false
}

const handleSuccess = (response: { url?: string }, file: UploadFile) => {
  const entry = listObj[file.uid]
  if (entry) {
    entry.url = response?.url || ''
    entry.hasSuccess = true
  }
}

const handleError = (error: any, file: UploadFile) => {
  delete listObj[file.uid]
  ElMessage.error(error?.response?.data?.message || 'No se pudo subir la imagen')
}

const handleRemove = (file: UploadFile) => {
  delete listObj[file.uid]
}

const beforeUpload = (file: UploadRawFile) => {
  if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
    ElMessage.error(`La imagen debe pesar menos de ${MAX_SIZE_MB} MB`)
    return false
  }
  const urlCreator = window.URL || window.webkitURL
  return new Promise<boolean>((resolve) => {
    const img = new Image()
    img.src = urlCreator.createObjectURL(file)
    img.onload = function () {
      listObj[file.uid] = {
        uid: file.uid,
        width: img.width,
        height: img.height,
        hasSuccess: false
      }
      resolve(true)
    }
    img.onerror = () => resolve(false)
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
