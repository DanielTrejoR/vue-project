import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/Admin/DashboardView.vue'
import AdminLayout from '~/components/AdminLayout.vue';
import FrontLayout from '~/components/FrontLayout.vue';
// import store from "../store";
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import store from "../store";
import AuthLayout from '~/components/layouts/AuthLayout.vue';



const routes = [
  {
    path: '/admin',
    redirect: "/admin/dashboard",
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: "dashboard", name: "Dashboard", component: DashboardView },
      { path: "posts", name: "AdminPosts", component: () => import('../views/Admin/Post/index.vue') },
      { path: "about", name: "about", component: () => import('../views/AboutView.vue') },
      // { path: "/surveys/create", name: "SurveyCreate", component: SurveyView },
      // { path: "/surveys/:id", name: "SurveyView", component: SurveyView },
    ],
  },
  {
    path: '/',
    redirect: "/",
    component: FrontLayout,
    meta: { requiresAuth: false },
    children: [
      { path: "/", name: "Index", component: () => import('../views/IndexView.vue')},
      { path: "/blog", name: "Posts", component: () => import('../views/Post/index.vue')},
      // { path: "/surveys/create", name: "SurveyCreate", component: SurveyView },
      // { path: "/surveys/:id", name: "SurveyView", component: SurveyView },
    ],
  },
  {
    path: "/auth",
    redirect: "/login",
    name: "Auth",
    component: AuthLayout,
    meta: {isGuest: true},
    children: [
      {
        path: "/login",
        name: "Login",
        component: () => import('../views/Auth/AuthView.vue'),
      },
      {
        path: "/register",
        name: "Register",
        component: () => import('../views/Auth/AuthView.vue'),
      },
    ],
  },

];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { left: 0, top: 500 };
  },
  routes,
});

router.beforeResolve((to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
      // Start the route progress bar.
      NProgress.start()
  }
  next()
});

router.beforeEach((to, from, next) => {
  //     store.commit('setAuthenticated', true);

  const userAdmin = store.state.base.user_admin;
  
  if (to.meta.requiresAuth && !userAdmin) {
    store.dispatch('base/logout');
    next({ name: "Login" });
  }else if (to.meta.role && store.state.base?.role !== to.meta.role) {
    next('/login'); // Si el usuario no tiene permisos, enviarlo al inicio
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  
  NProgress.done()
});

// router.beforeEach((to, from, next) => {
//   if (to.meta.requiresAuth && !store.state.user.token) {
//     next({ name: "Login" });
//   } else if (store.state.user.token && to.meta.isGuest) {
//     next({ name: "Dashboard" });
//   } else {
//     next();
//   }
// });

export default router
