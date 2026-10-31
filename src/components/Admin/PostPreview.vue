<template>
  <article class="post-preview">
    <header class="post-preview__header">
      <h2 class="post-preview__title">{{ post.title || 'Sin título' }}</h2>
      <div class="post-preview__meta">
        <el-tag :type="post.status === 'published' ? 'success' : 'info'" size="small" disable-transitions>
          {{ post.status === 'published' ? 'Publicado' : 'Borrador' }}
        </el-tag>
        <span v-if="post.category">· {{ post.category.name }}</span>
        <!-- el backend ya manda las fechas formateadas ("01 Jun 2026, 11:06 PM") -->
        <span>· {{ post.published_at ? `Publicado el ${post.published_at}` : 'Sin fecha de publicación' }}</span>
        <span v-if="post.updated_at">· Actualizado el {{ post.updated_at }}</span>
      </div>
    </header>

    <p v-if="post.excerpt" class="post-preview__excerpt">{{ post.excerpt }}</p>

    <div v-if="post.photos?.length" class="post-preview__images">
      <el-image
        v-for="(photo, index) in post.photos"
        :key="photo.id"
        :src="photo.full_url"
        :preview-src-list="post.photos.map((p: any) => p.full_url)"
        :initial-index="Number(index)"
        preview-teleported
        fit="cover"
        class="post-preview__image"
      />
    </div>

    <!-- el cuerpo llega purificado por el backend (Purifier) -->
    <div v-if="post.body" v-html="post.body" class="post-preview__body"></div>
    <p v-else class="post-preview__empty">Este post todavía no tiene contenido.</p>

    <p v-if="post.iframe" class="post-preview__embed">
      Contenido embebido:
      <a :href="post.iframe" target="_blank" rel="noopener noreferrer">{{ post.iframe }}</a>
    </p>

    <footer v-if="post.tags?.length" class="post-preview__tags">
      <el-tag v-for="tag in post.tags" :key="tag.id" effect="plain" round>#{{ tag.name }}</el-tag>
    </footer>
  </article>
</template>

<script setup lang="ts">
defineProps({
  // un post del listado del admin (/api/admin/posts): trae category, tags y photos
  post: { type: Object as () => Record<string, any>, required: true }
})
</script>

<style scoped>
.post-preview {
  color: var(--ep-text-color-primary);
  /* AppMain centra todo el texto del admin (#app); un artículo se lee mejor alineado a la izquierda */
  text-align: left;
}

.post-preview__title {
  margin: 0 0 8px;
  font-size: 1.6rem;
  overflow-wrap: anywhere;
}

.post-preview__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--ep-text-color-secondary);
  font-size: 13px;
}

.post-preview__excerpt {
  margin: 16px 0;
  color: var(--ep-text-color-regular);
  font-style: italic;
}

.post-preview__images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}

.post-preview__image {
  width: 160px;
  height: 110px;
  border-radius: 6px;
}

.post-preview__body {
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.post-preview__body :deep(img) {
  max-width: 100%;
  height: auto;
}

.post-preview__empty {
  color: var(--ep-text-color-secondary);
}

.post-preview__embed {
  margin-top: 16px;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.post-preview__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}
</style>
