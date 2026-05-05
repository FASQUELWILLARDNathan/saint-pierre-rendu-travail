import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import HomePage from './pages/HomePage.vue'
import ForgotPasswordPage from './pages/ForgotPasswordPage.vue'
import ResetPasswordPage from './pages/ResetPasswordPage.vue'
import { useAuthStore } from './stores/auth.store'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const

const routes = [
  {
    path: ROUTES.HOME,
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.LOGIN,
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.REGISTER,
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    component: ForgotPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.RESET_PASSWORD,
    component: ResetPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.LOGOUT,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
      const authStore = useAuthStore()
      authStore.logout()
      return ROUTES.LOGIN
    },
    component: { template: '<div></div>' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (authStore.isAuth && (to.path === ROUTES.LOGIN || to.path === ROUTES.REGISTER)) {
    return ROUTES.HOME
  }

  if (to.meta.requiresAuth && !authStore.isAuth) {
    return ROUTES.LOGIN
  }

  return true
})

export default router
