<template>
  <div class="dashboard" v-loading="loading">
    <header class="dashboard__header">
      <div>
        <h1 class="dashboard__title">Inicio</h1>
        <p class="dashboard__subtitle">
          {{ data?.scope === 'own' ? 'Métricas de tus publicaciones' : 'Métricas de todo el sitio' }}
        </p>
      </div>
      <div class="dashboard__actions">
        <el-button :loading="loading" icon="Refresh" @click="load">Actualizar</el-button>
        <el-button type="primary" icon="Plus" @click="router.push({ name: 'postsCreate' })">Nuevo post</el-button>
      </div>
    </header>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4" />

    <template v-if="data">
      <!-- indicadores -->
      <section class="kpis">
        <el-card v-for="kpi in kpis" :key="kpi.label" shadow="never" class="kpi">
          <div class="kpi__label">
            <el-icon><component :is="kpi.icon" /></el-icon>
            {{ kpi.label }}
          </div>
          <div class="kpi__value">{{ kpi.value }}</div>
          <div class="kpi__hint" :class="kpi.trendClass">
            <el-icon v-if="kpi.trendIcon"><component :is="kpi.trendIcon" /></el-icon>
            {{ kpi.hint }}
          </div>
        </el-card>
      </section>

      <!-- tendencias: dos gráficas separadas (una medida por eje) -->
      <section class="grid grid--2">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>Publicaciones por mes</span>
              <span class="card-header__meta">últimos 12 meses · {{ sum('posts') }} en total</span>
            </div>
          </template>
          <EChart :option="postsOption" />
        </el-card>
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>Comentarios por mes</span>
              <span class="card-header__meta">últimos 12 meses · {{ sum('comments') }} en total</span>
            </div>
          </template>
          <EChart :option="commentsOption" />
        </el-card>
      </section>

      <section class="grid grid--3">
        <el-card shadow="never">
          <template #header><div class="card-header"><span>Posts por categoría</span></div></template>
          <EChart v-if="data.categories.length" :option="categoriesOption" :height="categoriesHeight" />
          <el-empty v-else description="Ningún post publicado tiene categoría" :image-size="64" />
        </el-card>

        <el-card shadow="never">
          <template #header><div class="card-header"><span>Más comentados</span></div></template>
          <ol v-if="data.top_commented.length" class="ranking">
            <li v-for="post in data.top_commented" :key="post.id">
              <a :href="publicUrl(post.url)" target="_blank" rel="noopener">{{ post.title }}</a>
              <span class="ranking__value">{{ post.comments_count }} <el-icon><ChatDotRound /></el-icon></span>
            </li>
          </ol>
          <el-empty v-else description="Todavía nadie ha comentado" :image-size="64" />
        </el-card>

        <el-card shadow="never">
          <template #header><div class="card-header"><span>Mejor puntuados</span></div></template>
          <ol v-if="data.top_rated.length" class="ranking">
            <li v-for="post in data.top_rated" :key="post.id">
              <a :href="publicUrl(post.url)" target="_blank" rel="noopener">{{ post.title }}</a>
              <span class="ranking__value">
                {{ Number(post.ratings_avg_rating).toFixed(1) }} <el-icon><StarFilled /></el-icon>
                <small>({{ post.ratings_count }})</small>
              </span>
            </li>
          </ol>
          <el-empty v-else description="Todavía nadie ha puntuado" :image-size="64" />
        </el-card>
      </section>

      <section class="grid grid--2">
        <el-card shadow="never">
          <template #header><div class="card-header"><span>Últimos comentarios</span></div></template>
          <ul v-if="data.recent_comments.length" class="feed">
            <li v-for="item in data.recent_comments" :key="item.id">
              <UserAvatar :size="32" :src="item.user?.avatar" :name="item.user?.name" />
              <div class="feed__body">
                <div class="feed__meta">
                  <strong>{{ item.user?.name || 'Usuario eliminado' }}</strong>
                  en
                  <a v-if="item.post" :href="publicUrl(item.post.url)" target="_blank" rel="noopener">{{ item.post.title }}</a>
                  · {{ item.created_at }}
                </div>
                <p class="feed__text">{{ item.comment }}</p>
              </div>
            </li>
          </ul>
          <el-empty v-else description="Sin comentarios por ahora" :image-size="64" />
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>Borradores pendientes</span>
              <el-button v-if="data.totals.drafts" link type="primary" @click="router.push({ name: 'PostsIndex' })">Ver todos</el-button>
            </div>
          </template>
          <ul v-if="data.drafts.length" class="drafts">
            <li v-for="post in data.drafts" :key="post.id">
              <div>
                <div class="drafts__title">{{ post.title }}</div>
                <div class="drafts__meta">Editado el {{ post.updated_at }}</div>
              </div>
              <el-button size="small" icon="Edit" @click="router.push({ name: 'EditPost', params: { url: post.url } })">Continuar</el-button>
            </li>
          </ul>
          <el-empty v-else description="No tienes borradores pendientes" :image-size="64" />
        </el-card>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'Dashboard' })
import UserAvatar from '~/components/UserAvatar/UserAvatar.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document, EditPen, Timer, ChatDotRound, StarFilled, User, Top, Bottom, Minus,
} from '@element-plus/icons-vue'
import { usePostsStore } from '~/stores/posts'
import { isDark } from '~/composables/useRadialThemeToggle'
import EChart from '~/components/Charts/EChart.vue'

type Dashboard = Record<string, any>

const router = useRouter()
const postsStore = usePostsStore()

const data = ref<Dashboard | null>(null)
const loading = ref(false)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    data.value = await postsStore.getDashboard()
  } catch {
    error.value = 'No se pudieron cargar las métricas.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const publicUrl = (url: string) => router.resolve({ name: 'ViewPost', params: { url } }).href
const sum = (key: 'posts' | 'comments') => (data.value?.monthly || []).reduce((total: number, m: any) => total + m[key], 0)

// comentarios de los últimos 30 días contra los 30 anteriores: flecha + texto, nunca solo color
const commentsTrend = computed(() => {
  const t = data.value?.totals
  if (!t) return null
  const diff = t.comments_last_30 - t.comments_prev_30
  if (diff > 0) return { icon: Top, cls: 'is-up', text: `${t.comments_last_30} en 30 días (+${diff})` }
  if (diff < 0) return { icon: Bottom, cls: 'is-down', text: `${t.comments_last_30} en 30 días (${diff})` }
  return { icon: Minus, cls: '', text: `${t.comments_last_30} en 30 días (igual que antes)` }
})

const kpis = computed(() => {
  const t = data.value?.totals
  if (!t) return []
  const list = [
    { label: 'Publicados', value: t.published, icon: Document, hint: 'visibles en el blog' },
    { label: 'Borradores', value: t.drafts, icon: EditPen, hint: t.drafts ? 'esperando a terminarse' : 'nada pendiente' },
    { label: 'Programados', value: t.scheduled, icon: Timer, hint: 'con fecha futura' },
    {
      label: 'Comentarios', value: t.comments, icon: ChatDotRound,
      hint: commentsTrend.value?.text, trendIcon: commentsTrend.value?.icon, trendClass: commentsTrend.value?.cls,
    },
    {
      label: 'Puntuación media', value: t.ratings ? t.ratings_avg.toFixed(1) : '—', icon: StarFilled,
      hint: `${t.ratings} ${t.ratings === 1 ? 'voto' : 'votos'}`,
    },
  ]
  if (t.users !== null) list.push({ label: 'Usuarios', value: t.users, icon: User, hint: 'registrados en el sitio' })
  return list
})

// colores validados para daltonismo (azul y aqua del set de referencia), un paso por modo
const colors = computed(() => isDark.value
  ? { posts: '#3987e5', comments: '#199e70', grid: 'rgba(255,255,255,0.08)' }
  : { posts: '#2a78d6', comments: '#1baf7a', grid: 'rgba(0,0,0,0.06)' })

const months = computed(() => (data.value?.monthly || []).map((m: any) => m.label))

const baseAxes = () => ({
  grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  xAxis: { type: 'category', data: months.value, axisTick: { show: false }, axisLabel: { hideOverlap: true } },
  yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: colors.value.grid } } },
})

const postsOption = computed(() => ({
  ...baseAxes(),
  series: [{
    name: 'Publicaciones',
    type: 'bar',
    data: (data.value?.monthly || []).map((m: any) => m.posts),
    itemStyle: { color: colors.value.posts, borderRadius: [4, 4, 0, 0] },
    barMaxWidth: 24,
  }],
}))

const commentsOption = computed(() => ({
  ...baseAxes(),
  tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
  series: [{
    name: 'Comentarios',
    type: 'line',
    data: (data.value?.monthly || []).map((m: any) => m.comments),
    // sin suavizado: la curva bajaba de cero entre meses y un conteo nunca es negativo
    smooth: false,
    symbolSize: 8,
    lineStyle: { width: 2, color: colors.value.comments },
    itemStyle: { color: colors.value.comments },
    areaStyle: { color: colors.value.comments, opacity: 0.12 },
    // el aqua queda bajo 3:1 sobre fondo claro: los meses con comentarios llevan su número visible
    label: { show: true, position: 'top', formatter: (p: any) => (p.value ? p.value : '') },
  }],
}))

// barras horizontales ordenadas: se comparan mejor que un pastel y caben nombres largos
const categoriesHeight = computed(() => Math.max(160, (data.value?.categories.length || 0) * 36 + 40))
const categoriesOption = computed(() => {
  const list = [...(data.value?.categories || [])].reverse()
  return {
    grid: { left: 8, right: 32, top: 8, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: colors.value.grid } } },
    yAxis: { type: 'category', data: list.map((c: any) => c.name), axisTick: { show: false } },
    series: [{
      name: 'Posts',
      type: 'bar',
      data: list.map((c: any) => c.posts),
      itemStyle: { color: colors.value.posts, borderRadius: [0, 4, 4, 0] },
      barMaxWidth: 20,
      label: { show: true, position: 'right' },
    }],
  }
})
</script>

<style scoped>
.dashboard {
  text-align: left;
}

.dashboard__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.dashboard__title {
  margin: 0;
  font-size: 1.6rem;
}

.dashboard__subtitle {
  margin: 4px 0 0;
  color: var(--ep-text-color-secondary);
}

.dashboard__actions {
  display: flex;
  gap: 8px;
}

.dashboard__actions .ep-button + .ep-button {
  margin-left: 0;
}

.kpis {
  display: grid;
  /* 140px: en el teléfono caben dos indicadores por fila */
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 575px) {
  .kpis {
    gap: 10px;
  }

  .kpi__value {
    font-size: 1.6rem;
  }
}

.kpi__label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ep-text-color-secondary);
  font-size: 13px;
}

.kpi__value {
  margin: 8px 0 4px;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--ep-text-color-primary);
}

.kpi__hint {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}

.kpi__hint.is-up {
  color: var(--ep-color-success);
}

.kpi__hint.is-down {
  color: var(--ep-color-danger);
}

.grid {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}

.grid--2 {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
}

.grid--3 {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

.card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
}

.card-header__meta {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.ranking {
  margin: 0;
  padding-left: 1.2em;
}

.ranking li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--ep-border-color-lighter);
}

.ranking li:last-child {
  border-bottom: none;
}

.ranking a,
.feed a {
  color: var(--ep-color-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking__value {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
  color: var(--ep-text-color-regular);
  font-variant-numeric: tabular-nums;
}

.feed,
.drafts {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feed li {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ep-border-color-lighter);
}

.feed li:last-child,
.drafts li:last-child {
  border-bottom: none;
}

.feed__body {
  min-width: 0;
}

.feed__meta {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}

.feed__text {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}

.drafts li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ep-border-color-lighter);
}

.drafts__title {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.drafts__meta {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}
</style>
