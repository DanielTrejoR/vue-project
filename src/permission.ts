import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
    NProgress.start();
    
    document.title = getPageTitle(to.meta.title)
    await store.dispatch('auth/fetchUser');
    const isAuth = store.getters.isAuthenticated;
    if(isAuth) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page
            if(store.state.auth.roles.includes('admin')){
                next({ path: '/admin' })
                NProgress.done()
            }else{
                next({path: '/'})
                NProgress.done()
            }

        }else{
            const hasRoles = store.getters.roles && store.getters.roles.length > 0;
            if (hasRoles) {
                next()
            } else {
                try {
                    const { roles } = store.getters.user
                    const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
                    console.log(accessRoutes, 'rutasAcessibles')
                    // dynamically add accessible routes
                    router.addRoute(accessRoutes)
                    next({ ...to, replace: true })
                } catch (error) {
                    ElMessage.error(error || 'Has Error')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            }
        }
    }else {

        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})