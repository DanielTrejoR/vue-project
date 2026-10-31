import router from './router'
import type { RouteRecordRaw } from 'vue-router'
import { pinia } from '~/stores'
import { useAuthStore } from '~/stores/auth'
import { usePermissionStore } from '~/stores/permission'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
import { setPageMeta } from '@/utils/seo'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/forgot-password', '/reset-password', '/404', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
    NProgress.start();
    
    document.title = getPageTitle(to.meta.title)
    // el guard corre fuera de componentes: los stores se piden con la instancia de pinia
    const auth = useAuthStore(pinia)
    const permissionStore = usePermissionStore(pinia)
    const isAuth = auth.isAuthenticated;

    if (to.meta.requiresAuth === false) {
        NProgress.done()
        return next()
    }

    if (!isAuth) {

        if (whiteList.includes(to.path)) {
            return next();
        }
        NProgress.done()
        return next(`/login`);
    }
    if (to.path === '/login') {
        // si ya inició sesión, no tiene sentido mostrar el login
        NProgress.done()
        return next(auth.isAdmin ? { path: '/admin' } : { path: '/' })
    }

    // las rutas dinámicas se generan una sola vez por sesión (resetRouter las quita al cerrar sesión)
    if (permissionStore.routesReady) {
        return next()
    }

    try {
        const { roles, permissions } = await auth.fetchUser();
        if (!roles || roles.length === 0) {
            ElMessage.warning('Tu cuenta no tiene permisos asignados');
            NProgress.done()
            return next('/');
        }
        const accessRoutes = permissionStore.generateRoutes({roles, permissions})
        accessRoutes.forEach((route: RouteRecordRaw) => router.addRoute(route));
        return next({ ...to, replace: true });

    } catch (error: any) {
        console.error('Error en fetchUser', error);
        ElMessage.error(error?.message || 'Error al verificar la sesión')
        NProgress.done()
        return next(`/login?redirect=${to.path}`);
    }
})

router.afterEach(to => {
  // finish progress bar
NProgress.done()
  // descripción y URL canónica por defecto; el post, la categoría y la etiqueta las cambian al cargar sus datos
  setPageMeta({ title: to.meta.title as string | undefined })
})