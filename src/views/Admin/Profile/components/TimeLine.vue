<template>
    <div class="timeline">
        <el-timeline v-if="items.length">
            <el-timeline-item
                v-for="item in items"
                :key="item.id"
                :timestamp="fromNow(item.created_at)"
                :color="kinds[item.kind]?.color"
                :icon="kinds[item.kind]?.icon"
                size="large"
                placement="top"
            >
                <div class="timeline__entry" :title="fullDate(item.created_at)">
                    <div class="timeline__text">
                        <!-- el post solo se enlaza si sigue existiendo -->
                        <a v-if="item.post_url" :href="postHref(item.post_url)" target="_blank" rel="noopener">{{ item.text }}</a>
                        <span v-else>{{ item.text }}</span>
                    </div>
                    <p v-if="item.detail" class="timeline__detail">{{ item.detail }}</p>
                </div>
            </el-timeline-item>
        </el-timeline>

        <el-skeleton v-if="loading" :rows="3" animated class="timeline__skeleton" />

        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false">
            <el-button size="small" @click="loadMore">Reintentar</el-button>
        </el-alert>

        <el-empty v-if="done && !items.length" description="Todavía no hay acciones registradas" />
        <p v-else-if="done" class="timeline__end">No hay más acciones</p>

        <!-- al entrar en pantalla pide la siguiente tanda -->
        <div ref="sentinel" class="timeline__sentinel"></div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import {
    Document, ChatDotRound, StarFilled, PictureFilled, Pointer, User, More,
} from '@element-plus/icons-vue'
import { useAuthStore } from '~/stores/auth'
import { useInfiniteList } from '~/composables/useInfiniteList'
import { fromNow, fullDate } from '~/utils/dates'

interface TimelineItem {
    id: number
    kind: string
    text: string
    detail: string | null
    post_url: string | null
    created_at: string
}

const auth = useAuthStore()
const router = useRouter()

// cada tipo de acción con su ícono y color en la línea
const kinds: Record<string, { icon: any, color: string }> = {
    post: { icon: markRaw(Document), color: '#2a78d6' },
    comment: { icon: markRaw(ChatDotRound), color: '#1baf7a' },
    rating: { icon: markRaw(StarFilled), color: '#eda100' },
    status: { icon: markRaw(PictureFilled), color: '#6250d6' },
    like: { icon: markRaw(Pointer), color: '#e87ba4' },
    account: { icon: markRaw(User), color: '#52514e' },
    other: { icon: markRaw(More), color: '#898781' },
}

const postHref = (url: string) => router.resolve({ name: 'ViewPost', params: { url } }).href

const { items, loading, done, error, sentinel, loadMore } = useInfiniteList<TimelineItem>(cursor => auth.getActivities(cursor))

onMounted(loadMore)
</script>

<style scoped>
.timeline {
    text-align: left;
    padding-top: 8px;
}

.timeline__text a {
    color: var(--ep-color-primary);
    text-decoration: none;
}

.timeline__text a:hover {
    text-decoration: underline;
}

.timeline__detail {
    margin: 4px 0 0;
    padding: 8px 12px;
    border-radius: 6px;
    background: var(--ep-fill-color-light);
    color: var(--ep-text-color-regular);
    font-size: 13px;
    overflow-wrap: anywhere;
}

.timeline__skeleton {
    margin-top: 12px;
}

.timeline__end {
    margin: 8px 0 0;
    text-align: center;
    color: var(--ep-text-color-secondary);
    font-size: 13px;
}

.timeline__sentinel {
    height: 1px;
}
</style>
