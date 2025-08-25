<template>
  <div class="post-preview" :class="{ dark: isDark }">
    <h2>{{ post.title || 'Sin título' }}</h2>
    <p>{{ post.excerpt }}</p>
    <div v-html="post.body" class="content"></div>

    <p v-if="post.iframe">Contenido embebido:</p>
    <div v-html="post.iframe"></div>

    <p>Publicado el: {{ formatDate(post.published_at) }}</p>
    <div class="post-tags">
      <el-tag v-for="tag in post.tags" :key="tag.id">{{ tag.name }}</el-tag>
      {{ post.category.name }}
    </div>
    <div class="post-images">
      <el-image
        v-for="photo in post.photos"
        :key="photo.id"
        :src="photo.full_url"
        style="width: 200px; margin-right: 10px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  post: Object
})

import dayjs from 'dayjs'
import { computed, ref } from 'vue'

const formatDate = (date: string | null) =>
  date ? dayjs(date).format('DD MMM YYYY HH:mm') : 'Sin fecha'
const isDark = ref(false);
const getPreview = (file: any) =>
  file.url || file.response?.url || URL.createObjectURL(file.raw)
</script>
<style scoped>
.preview-wrapper {
  padding: 24px;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 8px;
  max-width: 800px;
  margin: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.preview-wrapper.dark {
  background-color: #1e1e1e;
  color: #eee;
}
.post-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
}
.post-body {
  font-size: 1rem;
  line-height: 1.6;
}
.post-tags {
  margin-top: 24px;
}
.tag-chip {
  display: inline-block;
  background-color: #e0e0e0;
  color: #333;
  padding: 6px 12px;
  border-radius: 16px;
  margin-right: 8px;
  font-size: 0.875rem;
}
.preview-wrapper.dark .tag-chip {
  background-color: #333;
  color: #eee;
}
.post-images {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.post-image {
  width: 100%;
  max-width: 300px;
  border-radius: 6px;
  object-fit: cover;
}
</style>
