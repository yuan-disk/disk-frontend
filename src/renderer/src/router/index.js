import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: import('../views/login/index.vue')
    },
    {
      path: '/login',
      component: import('../views/login/index.vue')
    },
    {
      path: '/registry',
      component: import('../views/registry/index.vue')
    },
    {
      path: '/',
      component: import('../views/index/index.vue')
    },
    {
      path: '/index',
      component: import('../views/index/index.vue'),
      children: [
        {
          path: '',
          component: import('../views/index/pages/file.vue')
        },
        {
          path: 'file2',
          component: import('../views/index/pages/file2.vue')
        }
      ]
    }
  ]
})

export default router
