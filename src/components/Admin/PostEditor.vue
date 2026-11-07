<template>
  <div class="createPost-container" v-loading="loading">
    <el-tabs>
      <el-tab-pane label="Editar">
        <el-form
          ref="postFromRef"
          label-position="top"
          :model="postForm"
          :rules="rules"
          class="form-container"
        >
          <!-- barra de acciones: estado y guardar; en móvil se apilan -->
          <div class="editor-actions">
            <el-form-item label="Estado de la publicación" prop="status" class="editor-actions__status">
              <el-radio-group v-model="postForm.status" :fill="theme">
                <el-radio-button value="draft">Borrador</el-radio-button>
                <el-radio-button value="published">Publicado</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-button
              :style="{backgroundColor: theme, borderColor: theme}"
              :loading="loading"
              type="primary"
              class="editor-actions__submit"
              @click="handleSubmit(postFromRef)"
            >
              {{ props.mode === 'edit' ? 'Actualizar' : 'Crear' }} publicacion
            </el-button>
          </div>
          <!-- móvil y tablet: una columna; desde lg: contenido a la izquierda y datos del post a la derecha -->
          <el-row :gutter="24">
            <el-col
              :xs="24"
              :lg="16"
              class="createPost-main-container"
            >
              <div>
                <el-row>
                  <el-col :span="24">
                    <el-form-item
                      label="Titulo"
                      prop="title"
                      style="margin-bottom: 40px"
                    >
                      <el-input
                        v-model="postForm.title"
                        clearable
                        placeholder="Ingresa un titulo"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="Resumen" prop="excerpt">
                  <el-input
                    class="article-textarea"
                    type="textarea"
                    v-model="postForm.excerpt"
                    :rows="1"
                    placeholder="Resumen breve del contenido"
                  />
                  <span v-show="contentShortLength" class="word-counter"
                    >{{ contentShortLength }} Palabras</span
                  >
                </el-form-item>
                <el-form-item
                  label="Contenido/Cuerpo de la publicación"
                  prop="body"
                  style="margin-bottom: 30px"
                >
                  <!-- Aquí podrías integrar un editor enriquecido como tiptap, Quill o v-md-editor -->
                  <Tinymce
                    ref="editor"
                    v-model="postForm.body"
                    :height="400"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="Embed / Iframe (opcional)" prop="iframe">
                  <el-input
                    v-model="postForm.iframe"
                    placeholder="URL embebida o iframe"
                    clearable
                  />
                </el-form-item>
              </div>
            </el-col>
            <el-col
              :xs="24"
              :lg="8"
              class="createPost-main-container createPost-side-container"
            >
              <el-form-item
                prop="published_at"
                label="Fecha de publicacion:"
              >
                <el-date-picker
                  v-model="postForm.published_at"
                  type="datetime"
                  placeholder="Fecha de publicacion"
                  :shortcuts="shortcuts"
                />
              </el-form-item>
              <el-form-item label="Categorías" prop="categories">
                <el-select
                  v-model="postForm.category_id"
                  placeholder="Selecciona categorías"
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="4"
                  allow-create
                  default-first-option
                  :reserve-keyword="false"
                >
                  <el-option
                    v-for="cat in categoryOptions"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Etiquetas" prop="tags">
                <el-select
                  v-model="postForm.tags"
                  multiple
                  filterable
                  placeholder="Selecciona Etiquetas"
                  collapse-tags
                  allow-create
                  collapse-tags-tooltip
                  default-first-option
                  :reserve-keyword="false"
                  :max-collapse-tags="4"
                >
                  <el-option
                    v-for="tag in tagOptions"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.id"
                  />
                </el-select>
              </el-form-item>
              <div>
                <div class="gallery-header">
                  <h3>Galeria de imagenes</h3>
                  <el-button @click="submitPhotos">Subir fotos</el-button>
                </div>
                <el-upload
                  class="upload-demo"
                  drag
                  name="photo"
                  ref="uploadRef"
                  :action="uploadUrl+postPhotoUrl"
                  :with-credentials="true"
                  multiple
                  :headers="uploadHeaders.headers"
                  :file-list="fileList"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-change="handleChange"
                  :auto-upload="false"
                  :on-error="handleError"
                  :limit="10"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                  :on-progress="handleProgress"
                  list-type="picture"
                >
                  <el-icon class="ep-icon--upload"><upload-filled /></el-icon>
                  <div class="ep-upload__text">
                    Arrastra las imagenes aqui o <em>haz click aqui para cargar imagenes</em>
                  </div>
                  <template #tip>
                    <div class="ep-upload__tip">
                      imagenes jpg/png con menos de 2 MB
                    </div>
                  </template>
                  <template #file="{ file }" >
                    <div class="upload-preview">
                      <img :src="getPreviewUrl(file)" class="upload-image cursor-pointer" @click="handlePictureCardPreview(file)"/>
                      <el-progress :percentage="file.percentage" status="success" />
                      <span class="upload-name">{{ file.name }}</span>
                      <span class="d-flex justify-center align-bottom pt-4 delete">
                        <el-icon @click="handleRemove(file)"><Delete/></el-icon>
                      </span>
                    </div>
                  </template>
                </el-upload>
                <h3>Cambia el orden de tus imagenes</h3>
                <draggable v-model="fileList" tag="ul" item-key="uid">
                  <template #item="{ element }">
                    <li class="upload-thumb">
                      <img :src="getPreviewUrl(element)" />
                      <span>{{ element.name }}</span>
                    </li>
                  </template>
                </draggable>
              </div>
              <AttachedFiles v-model="attached" class="mt-4" />
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Historial" v-if="props.mode === 'edit'">
        <PostHistory :postId="props.postId" />
      </el-tab-pane>
    </el-tabs>
  
  
  <el-dialog v-model="dialogVisible" :width="appStore.isMobile ? '95%' : '60%'" class="image-preview-dialog">
    <img :src="dialogImageUrl" alt="Vista previa de la imagen" />
  </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElImageViewer, ElMessage, ElNotification } from "element-plus";
import type { FormInstance, FormRules, UploadFile, UploadFiles, UploadInstance } from "element-plus";
import { useSettingsStore } from '~/stores/settings'
import { usePostsStore } from '~/stores/posts'
import { useAppStore } from '~/stores/app'
import Cookies from "js-cookie";
import draggable from 'vuedraggable'
import router from "~/router";
import { useRoute, useRouter } from 'vue-router'
import emitter from '~/utils/emitter'
import AttachedFiles from './Drive/AttachedFiles.vue'
import type { AttachedFile } from './Drive/AttachedFiles.vue'

const r = useRoute()
defineEmits(["update:modelValue"]);

const props = defineProps<{
    mode: 'create' | 'edit'
    postId?: string
}>()

const settingsStore = useSettingsStore()

const postsStore = usePostsStore()
const appStore = useAppStore()
const uploadRef = ref<UploadInstance>()
const uploadUrl = import.meta.env.VITE_API_BASE_URL
const uploadHeaders = ref({
  headers: {
      "X-XSRF-TOKEN": Cookies.get('XSRF-TOKEN')
  }
})
const theme = computed(() => settingsStore.theme);
const postPhotoUrl = ref('');
interface PostForm {
  title: string;
  excerpt: string;
  body: string;
  iframe: string;
  published_at: string;
  category_id: string;
  tags: number[];
  status: string;
  file_ids: number[];
}

const shortcuts = [
  {
    text: "Today",
    value: new Date(),
  },
  {
    text: "Tomorrow",
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    },
  },
  {
    text: "Next Week",
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
];

const loading = ref(false);
interface Option { id: number; name: string }
const categoryOptions = ref<Option[]>([]);
const tagOptions = ref<Option[]>([]);

const postFromRef = ref<FormInstance>();
const postForm = reactive<PostForm>({
  title: "",
  excerpt: "",
  body: "",
  iframe: "",
  published_at: "",
  category_id: "",
  tags: [],
  status: 'draft',
  file_ids: []
});

// Archivos del drive adjuntos (en orden); file_ids se deriva de aquí al enviar
const attached = ref<AttachedFile[]>([]);

const rules = reactive<FormRules<PostForm>>({
  title: [
    { required: true, message: "Título requerido", trigger: "blur", min: 3 },
  ],
  excerpt: [{ required: false, message: "Resumen requerido", trigger: "blur" }],
  body: [{ required: false, message: "Contenido requerido", trigger: "blur" }],
  published_at: [
    {
      type: "date",
      required: false,
      message: "Please pick a date",
      trigger: "change",
    },
  ],
  category_id: [
    {
      type: "string",
      required: false,
      message: "Selecciona al menos una categoría",
      trigger: "change",
    },
  ],
  tags: [
    {
      type: "array",
      required: false,
      message: "Selecciona al menos un tag",
      trigger: "change",
    },
  ],
});

const handleSubmit = async (formEl: FormInstance | undefined) => {
  
  if (!formEl) return;
  loading.value = true;
  await formEl.validate((valid, fields) => {
    if (valid) {
        postForm.file_ids = attached.value.map((f) => f.id);
        if(props.mode === 'edit' && props.postId) {
          
          postsStore.updatePost({postData: postForm, postId: props.postId})
          .then((res) => {
            if(fileList){
              ElMessage("Subiendo fotos... No salgas de esta pagina")
              postPhotoUrl.value = `/admin/posts/${props.postId}/photos`;
              submitPhotos();
            }
            loading.value = false;

          }).catch((err) => {
          loading.value = false;
          }).finally( () => {
            router.push({ name: 'PostsIndex'})
          })
        }else{
          postsStore.storePost(postForm)
          .then((res) => {
            ElMessage("Post guardado correctamente");
            if(res.data.id){
              if(fileList){
                
                ElMessage("Subiendo fotos... No salgas de esta pagina")
    
                postPhotoUrl.value = `/admin/posts/${res.data.url}/photos`;
                submitPhotos();
              }
            }
            loading.value = false;
          })
          .catch((err) => {
            loading.value = false;
          }).finally( () => {
            router.push({ name: 'PostsIndex'})
          })
        }
    } else {
      console.error("error submit!", fields);
      loading.value = false;
    }
  });
};

const resetForm = () => {
  postFromRef.value?.resetFields();
};

const getCategoriesAndTags = async () => {
  const { categories, tags } = await postsStore.fetchCategoriesAndTags();
  categoryOptions.value = categories;
  tagOptions.value = tags;
};

const contentShortLength = computed(() => {
  return postForm.excerpt.length;
});

//El upload 
// las fotos ya guardadas traen el id del backend; las nuevas todavía no
type EditorFile = UploadFile & { id?: number }
const fileList = ref<EditorFile[]>([])

const handlePreview = (file: UploadFile) => {
  ElImageViewer.open({ urlList: [file.url || file.raw], initialIndex: 0 })
}

const handleRemove = (file: EditorFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index === -1) return
  fileList.value.splice(index, 1)
  // una foto que aún no se subió solo se quita de la lista
  if (!file.id) return
  postsStore.deletePhoto(file.id)
    .then(() => ElMessage.success('Foto eliminada'))
    .catch(() => {
      fileList.value.splice(index, 0, file)
      ElMessage.error('No se pudo eliminar la foto')
    })
}

const handleChange = (file: UploadFile, files: UploadFile[]) => {
  fileList.value = files
}

const handleError = (error: Error,uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.error(error, uploadFile, uploadFiles);
}

const handleProgress = (event: { percent: number }, file: UploadFile, fileListRef: UploadFile[]) => {
  const target = fileList.value.find(f => f.uid === file.uid)
  if (target) target.percentage = Math.floor(event.percent)
}

const beforeUpload = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp']
  const maxSizeMb = 2

  const isTypeOk = validTypes.includes(file.type)
  const isSizeOk = file.size / 1024 / 1024 <= maxSizeMb

  if (!isTypeOk) ElMessage.error('Solo se permiten imágenes JPG o PNG')
  if (!isSizeOk) ElMessage.error('La imagen debe pesar menos de 2 MB')

  return isTypeOk && isSizeOk
}

const getPreviewUrl = (file: UploadFile): string => {
  return file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
}

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}

const submitPhotos = async () => {

  try {
    uploadRef.value!.submit()

    ElMessage.success('Galería subida');
    // router.push({ name: 'PostsIndex'});
  } catch (error) {
    ElMessage.error('Error al subir imágenes')
  }
}

onMounted(async () => {
  getCategoriesAndTags();
  if (props.mode === 'edit' && props.postId) {
    const {data} = await postsStore.editPost(props.postId)
    Object.assign(postForm, data);
    postForm.tags = data.tags.map((tag: Option) => tag.id)
    attached.value = data.files ?? []
    emitter.emit('updateBreadcrumbTitle', `Editando: "${data.title}"`)
    r.meta.title = `Editando: "${postForm.title}"`;
    fileList.value = data.photos.map((p: { id: number; full_url: string }) => ({
          // uid negativo: no choca con los que genera el upload (positivos) y sigue siendo numérico
          uid: -p.id,
          // solo el nombre del archivo: la URL completa desbordaba las tarjetas
          name: decodeURIComponent(p.full_url.split('/').pop() || `foto-${p.id}`),
          id: p.id,
          url: p.full_url,
          status: 'success'
      }))
  }
});

</script>
<style lang="scss" scoped>
@use "~/styles/mixin.scss";

.createPost-container {
  position: relative;
  max-width: 100%;
  margin: 0 auto;

  /* AppMain centra el texto de todo el admin; un formulario se lee mejor alineado a la izquierda */
  text-align: left;

  .createPost-main-container {
    padding-top: 8px;
  }

  .word-counter {
    width: 90px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.editor-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;

  .editor-actions__status {
    margin-bottom: 0;
  }
}

/* en pantallas anchas la columna lateral (fecha, categoría, etiquetas, fotos) se separa del contenido */
@media (min-width: 1200px) {
  .createPost-side-container {
    border-left: 1px solid var(--ep-border-color-lighter);
  }
}

@media (max-width: 575px) {
  .editor-actions__submit {
    width: 100%;
  }
}

.gallery-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 0 12px;

  h3 {
    margin: 0;
  }
}

.image-preview-dialog img {
  display: block;
  max-width: 100%;
  margin: 0 auto;
}
.ep-form-item {
  margin-bottom: 24px;
}

.ep-input,
.ep-select,
.ep-date-picker {
  width: 100%;
}

:deep(.article-textarea) {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}

.upload-thumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  min-width: 0;
  cursor: grab;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.upload-thumb img {
  flex: none;
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

/* proporción fija: las fotos verticales ya no estiran la tarjeta */
.upload-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  object-fit: cover;
}

.upload-preview {
  min-width: 0;
  width: 100%;
}

.upload-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
/* miniaturas en cuadrícula: tantas columnas como quepan (antes 27% fijo, ilegible en móvil) */
:deep(.ep-upload-list) {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

:deep(.ep-upload-list--picture .ep-upload-list__item) {
  width: auto;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

:deep(.ep-upload-dragger) {
  padding: 24px 12px;
}

.delete:hover {
  color: red;
  cursor: pointer;
}

</style>