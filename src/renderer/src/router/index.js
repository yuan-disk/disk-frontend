import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {  path: '/1',  component: import('../views/Home1.vue')},
    {  path: '/2',  component: import('../views/Home2.vue')} // route level code-splitting  // this generates a separate chunk (About.[hash].js) for this route  // which is lazy-loaded when the route is visited.}
  ]
})

export default router
