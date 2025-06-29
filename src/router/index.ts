import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/Admin/DashboardView.vue'
import AdminLayout from '@/layouts/Admin/Index.vue';
import FrontLayout from '@/components/FrontLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

export const constantRoutes = [
  // {
  //   path: '/redirect',
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: '/redirect/:path(.*)',
  //       component: () => import('../views/redirect/index.vue')
  //     }
  //   ]
  // },
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
    path: '/admin',
    hidden: true,
    component: AdminLayout,
    redirect: "/admin/dashboard",
    meta: { 
      requiresAuth: true, 
      icon: 'ep-icon-user',
      roles: ['admin']
    },
    children: [
      { 
        path: "dashboard", 
        name: "Dashboard", 
        component: DashboardView, 
        meta: {
          title: 'Dashboard', 
          icon: '<el-icon><House /></el-icon>',
          roles: ['admin']
          } 
      },
      { 
        path: "posts", 
        name: "AdminPosts", 
        component: () => import('../views/Admin/Post/index.vue'), 
        meta: {title: 'Mis Posts'} 
      },
      { 
        path: "about", 
        name: "about", 
        component: () => import('../views/AboutView.vue'), 
        meta: {title: 'Acerca de nosotros'} 
      },
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

export const asyncRoutes = [

  { path: '*', redirect: '/404', hidden: true }
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { left: 0, top: 500 };
  },
  routes: constantRoutes,
});

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior: () => ({ top: 0 }),
  });
  (router as any).matcher = (newRouter as any).matcher;
}

export default router
