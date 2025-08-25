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
          <div class="">
            <el-button
              :style="{backgroundColor: theme, borderColor: theme}"
              class="float-right"
              v-loading="loading"
              style="margin-left: 10px"
              type="primary"
              @click="handleSubmit(postFromRef)"
            >
              {{ props.mode === 'edit' ? 'Actualizar' : 'Crear' }} publicacion
            </el-button>
          </div>
          <el-form-item label="Estado de la publicación" prop="status">
            <el-radio-group v-model="postForm.status" :fill="theme">
              <el-radio-button value="draft">Borrador</el-radio-button>
              <el-radio-button value="published">Publicado</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-row class="">
            <el-col
              :xs="4"
              :sm="24"
              :md="20"
              :lg="13"
              :xl="12"
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
                  label="Contenido/Cuerpo de la publiacion"
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
              :xs="4"
              :sm="6"
              :md="15"
              :lg="11"
              :xl="12"
              class="createPost-main-container"
            >
              <div>
                <el-col :span="12">
                  <el-form-item
                    prop="published_at"
                    label="Fecha de publicacion:"
                    class="postInfo-container-item"
                  >
                    <el-date-picker
                      v-model="postForm.published_at"
                      type="datetime"
                      placeholder="Fecha de publicacion"
                      :shortcuts="shortcuts"
                    />
                  </el-form-item>
                </el-col>
              </div>
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
                <h3 class="pb-3 mb-2">Galeria de imagenes</h3>
                <el-button @click="submitPhotos">Subir fotos </el-button>
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
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Historial" v-if="props.mode === 'edit'">
        <PostHistory :postId="props.postId" />
      </el-tab-pane>
    </el-tabs>
  
  
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElImageViewer, ElMessage, ElNotification, FormInstance, FormRules, UploadFile, UploadFiles, UploadInstance } from "element-plus";
import { useStore } from "vuex";
import Cookies from "js-cookie";
import draggable from 'vuedraggable'
import router from "~/router";
import { useRoute, useRouter } from 'vue-router'
import emitter from '~/utils/emitter'

const r = useRoute()
defineEmits(["update:modelValue"]);

const props = defineProps<{
    mode: 'create' | 'edit'
    postId?: string
}>()

const store = useStore();
const uploadRef = ref<UploadInstance>()
const uploadUrl = import.meta.env.VITE_API_BASE_URL
const uploadHeaders = ref({
  headers: {
      "X-XSRF-TOKEN": Cookies.get('XSRF-TOKEN')
  }
})
const theme = computed(() => store.state.settings?.theme || '#1890ff');
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
const categoryOptions = ref([]);
const tagOptions = ref([]);

const postFromRef = ref<FormInstance>();
const postForm = reactive<PostForm>({
  title: "",
  excerpt: "",
  body: "",
  iframe: "",
  published_at: "",
  category_id: "",
  tags: [],
  status: 'draft'
});

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
        if(props.mode === 'edit' && props.postId) {
          
          store.dispatch("posts/updatePost", {postData: postForm, postId: props.postId})
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
          store
          .dispatch("posts/storePost", postForm)
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
      console.log("error submit!", fields);
      loading.value = false;
    }
  });
};

const resetForm = () => {
  postFromRef.value?.resetFields();
};

const getCategoriesAndTags = async () => {
  const { categories, tags } = await store.dispatch(
    "posts/fetchCategoriesAndTags"
  );
  categoryOptions.value = categories;
  tagOptions.value = tags;
};

const contentShortLength = computed(() => {
  return postForm.excerpt.length;
});

//El upload 
const fileList = ref([])

const handlePreview = (file: UploadFile) => {
  ElImageViewer.open({ urlList: [file.url || file.raw], initialIndex: 0 })
}

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    store.dispatch("posts/deletePhoto", file.id);
    ElMessage.success('Foto eliminada');
  }
}

const handleChange = (file: UploadFile, files: UploadFile[]) => {
  fileList.value = files
}

const handleError = (error: Error,uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log(error, uploadFile, uploadFiles);
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
  return file.url || URL.createObjectURL(file.raw)
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
    const {data} = await store.dispatch("posts/editPost", props.postId)
    Object.assign(postForm, data);
    postForm.tags = data.tags.map(tag => tag.id)
    emitter.emit('updateBreadcrumbTitle', `Editando: "${data.title}"`)
    r.meta.title = `Editando: "${postForm.title}"`;
    fileList.value = data.photos.map(p => ({
          uid: `pre-${p.id}`,
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

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @mixin clearfix {
        margin-bottom: 10px;
      }

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 90px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
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
}

.upload-thumb img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.upload-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
}
:deep(.ep-upload-list--picture .ep-upload-list__item){
  width: 27%;
}

:deep(.ep-upload-list) {
  display: flex !important;
}

.delete:hover {
  color: red;
  cursor: pointer;
}

</style>