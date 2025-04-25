import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAuthorityList } from '@/api/system/roles'

// 角色信息接口
export interface Authority {
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  authorityId: number
  authorityName: string
  parentId: number
  dataAuthorityId: Authority[] | null
  children: Authority[] | null
  menus: Record<string, unknown> | null
  defaultRouter: string
}

// 角色列表数据
export const roleList = ref<Authority[]>([])
export const loading = ref(false)

// 获取角色列表
export const fetchRoleList = async () => {
  loading.value = true
  try {
    const res = await getAuthorityList()
    if (res.data && res.data.code === 0) {
      roleList.value = res.data.data
    } else {
      ElMessage.error(res.data?.msg || '获取角色列表失败')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 添加角色
export const handleAddRole = () => {
  ElMessage.info('添加角色功能正在开发中...')
}

// 设置权限
export const handleSetPermission = () => {
  ElMessage.info('设置权限功能正在开发中...')
}

// 新增子角色
export const handleAddSubRole = () => {
  ElMessage.info('新增子角色功能正在开发中...')
}

// 拷贝角色
export const handleCopyRole = () => {
  ElMessage.info('拷贝角色功能正在开发中...')
}

// 编辑角色
export const handleEditRole = () => {
  ElMessage.info('编辑角色功能正在开发中...')
}

// 删除角色
export const handleDeleteRole = () => {
  ElMessage.info('删除角色功能正在开发中...')
} 