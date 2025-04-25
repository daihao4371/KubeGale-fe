import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuthorityList, createAuthority, updateAuthority, deleteAuthority } from '@/api/system/roles'

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

// 创建角色表单接口
export interface CreateRoleForm {
  authorityId: number
  authorityName: string
  parentId: number
  defaultRouter: string
}

// 角色列表数据
export const roleList = ref<Authority[]>([])
export const loading = ref(false)

// 创建角色对话框相关状态
export const createRoleDialogVisible = ref(false)
export const createRoleLoading = ref(false)
export const createRoleForm = reactive<CreateRoleForm>({
  authorityId: 0,
  authorityName: '',
  parentId: 0,
  defaultRouter: 'dashboard'
})

// 表单验证规则
export const createRoleRules = {
  authorityId: [
    { required: true, message: '请输入角色ID', trigger: 'blur' },
    { type: 'number', message: '角色ID必须为数字', trigger: 'blur' }
  ],
  authorityName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 编辑角色对话框相关状态
export const editRoleDialogVisible = ref(false)
export const editRoleLoading = ref(false)
export const editRoleForm = reactive<CreateRoleForm>({
  authorityId: 0,
  authorityName: '',
  parentId: 0,
  defaultRouter: 'dashboard'
})

// 处理角色列表数据
const processRoleData = (roles: Authority[]): Authority[] => {
  if (!Array.isArray(roles)) {
    console.error('角色数据格式错误:', roles)
    return []
  }
  return roles.map(role => ({
    ...role,
    children: role.children && Array.isArray(role.children) ? processRoleData(role.children) : []
  }))
}

// 获取角色列表
export const fetchRoleList = async () => {
  loading.value = true
  try {
    const res = await getAuthorityList()
    console.log('获取角色列表响应:', res)
    if (res.data?.code === 0 && Array.isArray(res.data.data)) {
      roleList.value = processRoleData(res.data.data)
    } else {
      ElMessage.error(res.data?.msg || '获取角色列表失败')
      roleList.value = []
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败，请稍后重试')
    roleList.value = []
  } finally {
    loading.value = false
  }
}

// 添加角色
export const handleAddRole = () => {
  createRoleDialogVisible.value = true
  // 重置表单
  Object.assign(createRoleForm, {
    authorityId: 0,
    authorityName: '',
    parentId: 0,
    defaultRouter: 'dashboard'
  })
}

// 提交创建角色表单
export const submitCreateRole = async () => {
  createRoleLoading.value = true
  try {
    const res = await createAuthority(createRoleForm)
    if (res.data && res.data.code === 0) {
      ElMessage.success('创建角色成功')
      createRoleDialogVisible.value = false
      // 刷新角色列表
      fetchRoleList()
    } else {
      ElMessage.error(res.data?.msg || '创建角色失败')
    }
  } catch (error) {
    console.error('创建角色失败:', error)
    ElMessage.error('创建角色失败，请稍后重试')
  } finally {
    createRoleLoading.value = false
  }
}

// 设置权限
export const handleSetPermission = (row: Authority) => {
  ElMessage.info('设置权限功能正在开发中...')
}

// 新增子角色
export const handleAddSubRole = (row: Authority) => {
  createRoleDialogVisible.value = true
  // 重置表单并设置父角色ID
  Object.assign(createRoleForm, {
    authorityId: 0,
    authorityName: '',
    parentId: row.authorityId,
    defaultRouter: 'dashboard'
  })
}

// 拷贝角色
export const handleCopyRole = (row: Authority) => {
  createRoleDialogVisible.value = true
  // 重置表单并设置父角色ID
  Object.assign(createRoleForm, {
    authorityId: 0,
    authorityName: `${row.authorityName}_copy`,
    parentId: row.parentId,
    defaultRouter: row.defaultRouter
  })
}

// 编辑角色
export const handleEditRole = (row: Authority) => {
  editRoleDialogVisible.value = true
  // 设置表单数据
  Object.assign(editRoleForm, {
    authorityId: row.authorityId,
    authorityName: row.authorityName,
    parentId: row.parentId,
    defaultRouter: row.defaultRouter
  })
}

// 提交编辑角色表单
export const submitEditRole = async () => {
  editRoleLoading.value = true
  try {
    const res = await updateAuthority(editRoleForm)
    if (res.data && res.data.code === 0) {
      ElMessage.success('更新角色成功')
      editRoleDialogVisible.value = false
      // 刷新角色列表
      fetchRoleList()
    } else {
      ElMessage.error(res.data?.msg || '更新角色失败')
    }
  } catch (error) {
    console.error('更新角色失败:', error)
    ElMessage.error('更新角色失败，请稍后重试')
  } finally {
    editRoleLoading.value = false
  }
}

// 删除角色
export const handleDeleteRole = (row: Authority) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${row.authorityName}" 吗？${row.children && row.children.length > 0 ? '该操作将同时删除所有子角色！' : ''}`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'role-delete-confirm'
    }
  ).then(async () => {
    try {
      const res = await deleteAuthority({ AuthorityId: row.authorityId })
      if (res.data && res.data.code === 0) {
        ElMessage.success(`角色 "${row.authorityName}" 已成功删除`)
        // 刷新角色列表
        fetchRoleList()
      } else {
        ElMessage.error(res.data?.msg || `删除角色 "${row.authorityName}" 失败`)
      }
    } catch (error) {
      console.error('删除角色失败:', error)
      ElMessage.error(`删除角色失败`)
    }
  }).catch(() => {
    // 用户取消操作，不做任何处理
  })
} 