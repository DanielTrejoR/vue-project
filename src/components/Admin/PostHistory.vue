<template>
  <el-card class="box-card" shadow="hover">
    <div slot="header" class="clearfix">
      <span>Historial de Edición</span>
    </div>

    <el-timeline>
      <el-timeline-item
        v-for="activity in activities"
        :key="activity.id"
        :timestamp="formatDate(activity.created_at)"
        placement="top"
      >
        <div>
          <strong>{{ activity.description }}</strong><br />
          <small>Por: {{ activity.causer?.name || 'Sistema' }}</small>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { usePostsStore } from '~/stores/posts'

const postsStore = usePostsStore()

const props = defineProps({
  // el editor pasa la url del post (clave de ruta en el backend)
  postId: [String, Number]
})

const activities = ref([])

const formatDate = date => new Date(date).toLocaleString()

onMounted(async () => {
  const { data } = await postsStore.getHistory(props.postId);
  activities.value = data
})
</script>

<style scoped>
.box-card {
  margin-top: 20px;
}
</style>
