import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/Admin/Index.vue';
import FrontLayout from '@/components/FrontLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

export const constantRoutes = [
  {
    path: '/redirect',
    component: AdminLayout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('../views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/',
    redirect: "/",
    component: FrontLayout,
    meta: { requiresAuth: false },
    hidden: true,
    children: [
      { 
        path: "/", 
        name: "Index", 
        meta: {
          title: "Inicio"
        },
        component: () => import('../views/IndexView.vue')
      },
      { 
        path: "/blog", 
        name: "Posts", 
        meta: {
          title: "Listado de Posts"
        },
        component: () => import('../views/Post/index.vue')
      },
      // { path: "/surveys/create", name: "SurveyCreate", component: SurveyView },
      // { path: "/surveys/:id", name: "SurveyView", component: SurveyView },
    ],
  },
  {
    path: '/admin',
    hidden: false,
    component: AdminLayout,
    redirect: "/admin/dashboard",
    meta: { 
      requiresAuth: true, 
      icon: 'House',
      roles: ['admin'],
      title: "Inicio"
    },
    children: [
      { 
        path: "dashboard", 
        name: "Dashboard", 
        component: () => import('~/views/Admin/DashboardView.vue'), 
        meta: {
          title: 'Dashboard',
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
    hidden: true,
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
  {
    path: '/404',
    name: 'NotFound',
    hidden:true,
    component: () => import('~/views/errors-page/404.vue'),
    meta: { title: '404', hidden: true }
  },
];

export const asyncRoutes = [
  { 
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
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
