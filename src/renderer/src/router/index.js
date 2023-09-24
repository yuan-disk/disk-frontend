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
      meta: {
        requireAuth: true
      },
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

router.beforeEach((to, from, next) => {
  if (to.matched.some((res) => res.meta.requireAuth)) {
    // 验证是否需要登陆
    var id = window.store.ipcRenderer.get('token')
    if (id) {
      next()
    } else {
      next({
        path: '/login', // 未登录则跳转至login页面
        redirect: to.fullPath // 登陆成功后回到当前页面，这里传值给login页面，to.fullPath为当前点击的页面
      })
    }
  } else {
    next()
  }
})

export default router
