import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('../views/login.vue')
    },
    {
      path: '/registry',
      component: () => import('../views/registry.vue')
    },
    {
      path: '/',
      component: () => import('../views/index/index.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/index/save.vue')
        },
        {
          path: 'index/translate',
          component: () => import('../views/index/translate.vue')
        }
      ]
    }
  ]
})

export default router
