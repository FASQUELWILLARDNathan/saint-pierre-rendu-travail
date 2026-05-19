import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import HomePage from './pages/HomePage.vue'
import ForgotPasswordPage from './pages/ForgotPasswordPage.vue'
import ResetPasswordPage from './pages/ResetPasswordPage.vue'
import ProfilePage from './pages/ProfilPage.vue'
import EleveGestionPage from './pages/EleveGestionPage.vue'
import ClassesPage from './pages/ClassesPage.vue'
import MessageriePage from './pages/MessageriePage.vue'
import { useAuthStore } from './stores/auth.store'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profil',
  ELEVE_GESTION: '/gestion-eleves',
  CLASSES: '/classes',
  MESSAGERIE: '/messagerie',
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
    path: '/profil',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.ELEVE_GESTION,
    component: EleveGestionPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.CLASSES,
    component: ClassesPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.MESSAGERIE,
    component: MessageriePage,
    meta: { requiresAuth: true },
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
