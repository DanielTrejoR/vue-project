// utils/visibleRoutes.ts
import type { RouteRecordRaw } from 'vue-router';

export function getVisibleRoutes(routes: RouteRecordRaw[]) {
  return routes.filter(route => !route.meta?.hidden);
}
