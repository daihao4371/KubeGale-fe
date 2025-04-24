import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/login/login'

interface MenuItem {
  id: string
  title: string
  icon: string
  path: string
  children?: MenuItem[]
}

export default function useHomepage() {
  const router = useRouter()
  const activeMenu = ref('dashboard')  // 修改默认激活菜单为仪表盘

  const menuItems: MenuItem[] = reactive([
    { id: 'dashboard', title: '仪表盘', icon: 'HomeFilled', path: '/dashboard' },

    { 
      id: 'system', 
      title: '系统管理', 
      icon: 'Setting', 
      path: '/system',
      children: [
        { id: 'system-user', title: '用户管理', icon: 'User', path: '/system/userManager' },
        { id: 'system-role', title: '角色管理', icon: 'UserFilled', path: '/system/roleManager' },
        { id: 'system-menu', title: '菜单管理', icon: 'Menu', path: '/system/menuManager' },
        { id: 'system-api', title: 'API管理', icon: 'Connection', path: '/system/apiManager' }
      ]
    },
    { id: 'cmdb', title: 'CMDB资产管理', icon: 'DataAnalysis', path: '/homepage/cmdb' },
    { id: 'kubernetes', title: 'k8s管理', icon: 'Ship', path: '/homepage/kubernetes' },
    { id: 'prometheus', title: 'Prometheus监控管理', icon: 'Monitor', path: '/homepage/prometheus' },
    { id: 'config', title: '配置中心', icon: 'Tools', path: '/homepage/config' },
    { id: 'docker', title: 'docker管理', icon: 'Box', path: '/homepage/docker' },
    { id: 'cicd', title: 'CICD', icon: 'Connection', path: '/homepage/cicd' }
  ])

  const expandedMenus = ref<string[]>(['system']) // 默认展开系统管理菜单
  
  // 初始化时导航到仪表盘
  router.push('/dashboard')
  
  const selectMenu = (menuId: string) => {
    // 查找当前菜单项
    const selectedMenu = findMenuItem(menuId, menuItems)
    
    if (selectedMenu) {
      // 如果有子菜单，则切换展开/收起状态
      if (selectedMenu.children && selectedMenu.children.length > 0) {
        if (expandedMenus.value.includes(menuId)) {
          expandedMenus.value = expandedMenus.value.filter(id => id !== menuId)
        } else {
          expandedMenus.value.push(menuId)
        }
        // 如果是父菜单项，设置为激活状态
        activeMenu.value = menuId
      } else {
        // 如果没有子菜单，则导航到对应路径
        activeMenu.value = menuId
        router.push(selectedMenu.path)
      }
    }
  }
  
  // 检查菜单项是否有激活的子菜单
  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false
    
    return item.children.some(child => child.id === activeMenu.value) || 
           (expandedMenus.value.includes(item.id) && item.id === activeMenu.value)
  }
  
  // 递归查找菜单项
  const findMenuItem = (id: string, items: MenuItem[]): MenuItem | undefined => {
    for (const item of items) {
      if (item.id === id) {
        return item
      }
      if (item.children && item.children.length > 0) {
        const found = findMenuItem(id, item.children)
        if (found) {
          return found
        }
      }
    }
    return undefined
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
    expandedMenus,
    selectMenu,
    username,
    currentTime,
    handleLogout,
    hasActiveChild
  }
}