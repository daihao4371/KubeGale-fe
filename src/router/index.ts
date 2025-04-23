import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  }
  // 注意：这里删除了重复的登录路由
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - KubeGale` : 'KubeGale'
  
  // 暂时注释掉登录验证逻辑，直接放行所有路由
  next()
  
  /* 等登录功能完成后再启用
  // 检查是否需要登录验证
  if (to.matched.some(record => record.meta.requiresAuth !== false)) {
    // 这里添加登录验证逻辑
    const isLoggedIn = localStorage.getItem('token')
    if (!isLoggedIn) {
      next({ path: '/login' })
    } else {
      next()
    }
  } else {
    next()
  }
  */
})

export default router
