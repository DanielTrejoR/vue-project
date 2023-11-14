import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/Admin/DashboardView.vue'
import AdminLayout from '~/components/AdminLayout.vue';
import FrontLayout from '~/components/FrontLayout.vue';
// import store from "../store";
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

const routes = [
  {
    path: '/admin',
    redirect: "/admin/dashboard",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", name: "Dashboard", component: DashboardView },
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

router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
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
