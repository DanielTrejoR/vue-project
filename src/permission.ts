import router from './router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/404', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
    NProgress.start();
    
    document.title = getPageTitle(to.meta.title)
    const isAuth = store.getters.isAuthenticated;

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
        return next(store.getters.roles.includes('Admin') ? { path: '/admin' } : { path: '/' })
    }

    // las rutas dinámicas se generan una sola vez por sesión (resetRouter las quita al cerrar sesión)
    const routesReady = store.state.permission.addRoutes.length > 0;
    if (routesReady) {
        return next()
    }

    try {
        await store.dispatch('auth/fetchUser')
        const { roles, permissions } = store.getters.user || {};
        if (!roles || roles.length === 0) {
            ElMessage.warning('Tu cuenta no tiene permisos asignados');
            NProgress.done()
            return next('/');
        }
        const accessRoutes = await store.dispatch('permission/generateRoutes', {roles, permissions})
        accessRoutes.forEach(route => router.addRoute(route));
        return next({ ...to, replace: true });

    } catch (error: any) {
        console.log('Error en fetchUser', error);
        ElMessage.error(error?.message || 'Error al verificar la sesión')
        NProgress.done()
        return next(`/login?redirect=${to.path}`);
    }
})

router.afterEach(() => {
  // finish progress bar
NProgress.done()
})