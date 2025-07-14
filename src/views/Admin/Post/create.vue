<template>
  <div class="createPost-container">
    <el-form
      ref="postFromRef"
      label-position="top"
      :model="postForm"
      :rules="rules"
      class="form-container"
    >
      <div class="">
        <el-button
          class="float-right"
          v-loading="loading"
          style="margin-left: 10px"
          type="primary"
          @click="handleSubmit(postFromRef)"
        >
          Crear publicacion
        </el-button>
      </div>
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
            <el-upload
              class="upload-demo"
              drag
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              multiple
              :auto-upload="false"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                Drop file here or <em>click to upload</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  jpg/png files with a size less than 500kb
                </div>
              </template>
            </el-upload>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { useStore } from "vuex";
defineEmits(["update:modelValue"]);
const store = useStore();

interface PostForm {
  title: string;
  excerpt: string;
  body: string;
  iframe: string;
  published_at: string;
  category_id: string;
  tags: number[];
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
      store
        .dispatch("posts/storePost", postForm)
        .then((res) => {
          ElMessage("Post guardado correctamente");
          loading.value = false;
        })
        .catch((err) => {
          loading.value = false;
        });
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
onMounted(() => {
  getCategoriesAndTags();
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
</style>