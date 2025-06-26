<template>
  <el-dialog v-model="newPost" :show-close="false">
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">Crea una nueva publicacion</h4>
        <el-button type="danger" @click="closeModal()">
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
          Cerrar
        </el-button>
      </div>
    </template>
    <el-form
        label-position="top"
        ref="ruleModalPostRef"
        :model="createPostForm"
        :rules="rules"
        status-icon
    >
        <el-form-item label="Titulo de la publicacion" prop="title">
            <el-input clearable v-model="createPostForm.title" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm('ruleModalPostRef')">
                Create
            </el-button>
        </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import store from '~/store/index.js';
export default {
    data: () => ({
        newPost: false,
        createPostForm: {
            title: ""
        },
        rules: {
            title: [
                { required: true, message: "El titulo es requerido", trigger: 'blur'},
                { min: 3, message: 'Longitud minima de 3 caracteres', trigger: 'blur' }
            ]
        }
    }),
    methods: {
        closeModal() {
            this.newPost = false
            this.createPostForm = {
                title: ""
            }
            this.emitter.emit("closeModal")
        },
        submitForm(formRef) {
            this.$refs[formRef].validate( (valid) => {
                if (valid) {
                    store.dispatch('base/createPost', this.createPostForm)
                    .then((result) => {
                        console.log(result.data.url);
                        ElMessage({
                            message: 'Se a creado correctamente la publicacion',
                            type: 'success',
                        });

                            this.closeModal();
                    }).catch((err) => {
                        console.log(err);
                    });
                } else {
                    ElNotification({
                        title: 'Error',
                        message: 'Hubo un error al crear la publicacion',
                        type: 'error',
                    })
                }
            })
        }
    },
    mounted() {
        this.emitter.on("openModal", () => {
            this.newPost = true
        })

    }
}
</script>

<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>