<template>
  <!-- contenido del ElNotification que avisa de algo nuevo (ver NotificationsBell) -->
  <div class="live-toast">
    <UserAvatar :size="36" :src="item.actor?.avatar" :name="item.actor?.name" />
    <div class="live-toast__body">
      <p class="live-toast__text">{{ item.text }}</p>
      <p v-if="item.excerpt" class="live-toast__excerpt">«{{ item.excerpt }}»</p>
      <span class="live-toast__action">Ver</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '~/components/UserAvatar/UserAvatar.vue'
import type { NotificationItem } from '~/composables/useLiveNotifications'

defineProps<{ item: NotificationItem }>()
</script>

<style scoped>
.live-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}

.live-toast__body {
  min-width: 0;
}

.live-toast__text {
  margin: 0;
  color: var(--ep-text-color-primary);
  font-size: 14px;
  line-height: 1.4;
}

.live-toast__excerpt {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--ep-text-color-secondary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-toast__action {
  display: inline-block;
  margin-top: 4px;
  color: var(--ep-color-primary);
  font-size: 13px;
}
</style>
