import router from './router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

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
            // if is logged in, redirect to the home page
            
            if(store.state.auth.roles.includes('admin')){
                next({ path: '/admin' })
                NProgress.done()
            }else{
                NProgress.done()
                next({path: '/'})
            }
        }

        const hasRoles = store.getters.roles && store.getters.roles.length > 0;
        if (hasRoles) {
            next()
        } else{
            
            try {
                await store.dispatch('auth/fetchUser')
                const { roles, permissions } = store.getters.user || {};
                if (!roles || roles.length === 0) {
                    ElMessage.warning('Tu cuenta no tiene permisos asignados');
                    // IMPORTANTE: no redirigir si ya estás en login
                    return next('/login');
                }
                const accessRoutes = await store.dispatch('permission/generateRoutes', {roles, permissions})
                accessRoutes.forEach(route => router.addRoute(route));
                next({ ...to, replace: true });
                
            } catch (error) {
                console.log('Error en fetchUser', error);
                ElMessage.error(error || 'Has Error')
                if (to.path !== '/login') {
                    next(`/login?redirect=${to.path}`);
                } else {
                    next();
                }
            }
        }
            
})

router.afterEach(() => {
  // finish progress bar
NProgress.done()
})