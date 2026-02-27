import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/ProjectsListView.vue')
    },
    {
      path: '/cookies-policy',
      name: 'cookies-policy',
      component: () => import('@/views/CookiesPolicyView.vue')
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('@/views/PrivacyPolicyView.vue')
    },
    {
      path: '/what-is',
      name: 'what-is-this',
      component: () => import('@/views/WhatIsThisView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: () => import('@/views/UserDetailView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/projects',
      name: 'projects',
      redirect: { name: 'home' }
    },
    {
      path: '/projects/new',
      name: 'project-new',
      component: () => import('@/views/ProjectNewView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetailView.vue')
    },
    {
      path: '/projects/:id/edit',
      name: 'project-edit',
      component: () => import('@/views/ProjectEditView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/projects/:id/forum',
      name: 'project-forum',
      component: () => import('@/views/ForumView.vue')
    },
    {
      path: '/forum',
      name: 'forum-general',
      component: () => import('@/views/ForumView.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next()
    } else {
      alert('Necesitas iniciar sesión para acceder')
      next('/')
    }
  } else {
    next()
  }
})


export default router