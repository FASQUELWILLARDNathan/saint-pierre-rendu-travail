import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import LoginPage from './pages/LoginPage.vue'
import HomePage from './pages/HomePage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import ForgotPasswordPage from './pages/ForgotPasswordPage.vue'
import ResetPasswordPage from './pages/ResetPasswordPage.vue'
import ProfilePage from './pages/ProfilPage.vue'
import EleveGestionPage from './pages/EleveGestionPage.vue'
import ClassesPage from './pages/ClassesPage.vue'
import MessageriePage from './pages/MessageriePage.vue'
import { useAuthStore } from './stores/auth.store'
import { useOnboardingStore } from './stores/onboarding.store'
import MatierePage from './pages/MatierePage.vue'
import CoursPage from './pages/CoursPage.vue'
import DevoirsPage from './pages/DevoirsPage.vue'
import NotesPage from './pages/NotesPage.vue'
import MentionLegalesPage from './pages/MentionLegalesPage.vue'
import CguPage from './pages/CguPage.vue'
import PolitiquedeConfidentialite from './pages/PolitiquedeConfidentialite.vue'
import RgpdPage from './pages/RgpdPage.vue'
import ProfGestionPage from './pages/ProfGestionPage.vue'
import { useApi } from './composables/useApi.ts'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profil',
  CALENDAR: '/calendrier',
  ELEVE_GESTION: '/gestion-eleves',
  CLASSES: '/classes',
  MESSAGERIE: '/messagerie',
  CATEGORIE: '/categorie/:id',
  MATIERE: '/categorie/:id',
  COURS: '/cours',
  DEVOIRS: '/devoirs',
  NOTES: '/notes',
  MENTIONS_LEGALES: '/mentions-legales',
  CGU: '/cgu',
  POLITIQUE_DE_CONFIDENTIALITE: '/politique-de-confidentialite',
  RGPD: '/rgpd',
  PROF_GESTION: '/gestion-prof',
} as const

const routes = [
  {
    path: ROUTES.HOME,
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.CALENDAR,
    component: CalendarPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.LOGIN,
    component: LoginPage,
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
    meta: { requiresAuth: true, role: 'administrateur' },
  },
  {
    path: ROUTES.PROF_GESTION,
    component: ProfGestionPage,
    meta: { requiresAuth: true, role: 'administrateur' },
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
    path: '/categorie/:id',
    alias: '/matiere/:id',
    component: MatierePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/cours',
    component: CoursPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/devoirs',
    component: DevoirsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/notes',
    component: NotesPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.MENTIONS_LEGALES,
    component: MentionLegalesPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.CGU,
    component: CguPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.POLITIQUE_DE_CONFIDENTIALITE,
    component: PolitiquedeConfidentialite,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.RGPD,
    component: RgpdPage,
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

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const onboardingStore = useOnboardingStore()

  if (to.meta.requiresAuth && !authStore.isAuth) {
    return ROUTES.LOGIN
  }

  if (authStore.isAuth && to.path === ROUTES.LOGIN) {
    return ROUTES.HOME
  }

  const requiredRole = to.meta.role as string | undefined

  if (requiredRole) {
    if (authStore.user?.role !== requiredRole) {
      return ROUTES.HOME
    }
  }

  // Only check onboarding if user is authenticated
  if (authStore.isAuth) {
    const api = useApi()
    try {
      const status = (await api.request('/api/profile/onboarding-status')) as any
      if (status.needs_onboarding) {
        onboardingStore.setShowModal(true)
        if (to.path !== ROUTES.HOME) {
          return ROUTES.HOME
        }
      }
    } catch {
      // silencieux
    }
  }

  return true
})

export default router
