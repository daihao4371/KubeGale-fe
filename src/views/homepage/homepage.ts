import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/login/login'

interface MenuItem {
  id: string
  title: string
  icon: string
  path: string
}

export default function useHomepage() {
  const router = useRouter()
  const activeMenu = ref('system')

  const menuItems: MenuItem[] = reactive([
    { id: 'system', title: '系统管理', icon: 'Setting', path: '/homepage/system' },
    { id: 'cmdb', title: 'CMDB资产管理', icon: 'Document', path: '/homepage/cmdb' },
    { id: 'kubernetes', title: 'k8s管理', icon: 'Ship', path: '/homepage/kubernetes' },
    { id: 'prometheus', title: 'Prometheus监控管理', icon: 'Monitor', path: '/homepage/prometheus' },
    { id: 'config', title: '配置中心', icon: 'Tools', path: '/homepage/config' },
    { id: 'docker', title: 'docker管理', icon: 'Box', path: '/homepage/docker' },
    { id: 'cicd', title: 'CICD', icon: 'Connection', path: '/homepage/cicd' }
  ])

  const selectMenu = (menuId: string) => {
    activeMenu.value = menuId
    const selectedMenu = menuItems.find(item => item.id === menuId)
    if (selectedMenu) {
      router.push(selectedMenu.path)
    }
  }

  const username = ref('Admin')
  const currentTime = ref(new Date().toLocaleString())

  // 更新时间
  setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)

  // 退出登录方法
  const handleLogout = async () => {
    try {
      const res = await logout()
      if (res.data.code === 0) {
        ElMessage.success('退出登录成功')
        // 清除本地存储的token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 跳转到登录页
        router.push('/login')
      } else {
        ElMessage.error(res.data.msg || '退出登录失败')
      }
    } catch (error) {
      ElMessage.error('退出登录失败，请稍后重试')
    }
  }

  return {
    menuItems,
    activeMenu,
    selectMenu,
    username,
    currentTime,
    handleLogout
  }
}