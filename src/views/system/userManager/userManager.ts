import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/system/user'

// 定义用户数据类型
export interface UserInfo {
  uuid: string
  userName: string
  nickName: string
  phone: string
  email: string
  authorityId: number
  enable: number
  headerImg: string
  authority?: {
    CreatedAt: string
    UpdatedAt: string
  }
  originSetting?: any
}

// 分页参数
export const currentPage = ref(1)
export const pageSize = ref(10)
export const total = ref(0)
export const loading = ref(false)

// 用户列表数据
export const userList = ref<UserInfo[]>([])

// 角色映射
export const roleMap: Record<number, string> = {
  888: '管理员',
  999: '普通用户',
  // 可以根据实际情况添加更多角色
}

// 获取角色名称
export const getRoleName = (authorityId: number) => {
  return roleMap[authorityId] || '未知角色'
}

// 获取用户列表
export const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (res.data && res.data.code === 0) {
      userList.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    } else {
      ElMessage.error(res.data?.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表出错:', error)
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
export const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUserList()
}

// 处理每页条数变化
export const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUserList()
}

// 添加用户
export const handleAddUser = () => {
  ElMessage.info('添加用户功能正在开发中...')
}

// 编辑用户
export const handleEdit = (row: UserInfo) => {
  ElMessage.info('编辑用户功能正在开发中...')
}

// 重设密码
export const handleResetPassword = (row: UserInfo) => {
  ElMessage.info('重设密码功能正在开发中...')
}

// 删除用户
export const handleDelete = (row: UserInfo) => {
  ElMessage.info('删除用户功能正在开发中...')
}