<template>
    <el-dialog v-model="showModal" :show-close="false" width="500" align-center>
        <template #header="{ close, titleId, titleClass }">
        <div class="my-header">
            <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
            <el-button type="danger" @click="close">
            <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
            Cerrar
            </el-button>
        </div>
        </template>
        <slot></slot>
    </el-dialog>
</template>

<script>
export default {
    name: 'BaseModal',
    data() {
        return {
            showModal: this.isOpen ?? false,
            data: null,
            title: ''
        };
    },
    methods: {
        closeModal() {
            this.emitter.emit('closeBaseModal');
        }
    },
    mounted() {
        this.emitter.on("openBaseModal", (data) => {
            this.showModal = true
            this.data = data;
            this.title = data.title
        })
    }
};

</script>

<style scoped>
.my-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
}
</style>