import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, addUser, updateUser, deleteUser, resetPassword, getUserInfo } from '@/api/system/user'

// 基础用户信息接口
export interface BaseUserInfo {
  userName: string
  nickName: string
  phone: string
  email: string
  headerImg: string
  enable: number
  authorityId: number
}

// 用户注册数据类型
export interface RegisterUserData extends BaseUserInfo {
  passWord: string
  authorityIds?: number[]
}

// 用户数据类型
export interface UserInfo extends BaseUserInfo {
  ID: number
  authority?: {
    CreatedAt: string
    UpdatedAt: string
  }
  originSetting?: any
}

// 用户详细信息类型
export interface UserDetailInfo extends UserInfo {
  CreatedAt: string
  UpdatedAt: string
  authorities: Array<{
    CreatedAt: string
    UpdatedAt: string
    authorityId: number
    authorityName: string
    children: any
    dataAuthorityId: any
    defaultRouter: string
    menus: any
    parentId: number
  }>
  uuid: string
  msg: string
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

// 用户表单数据
export const userForm = reactive<RegisterUserData>({
  userName: '',
  passWord: '',
  nickName: '',
  headerImg: '',
  authorityId: 888, // 默认为管理员
  enable: 1, // 默认启用
  authorityIds: [],
  phone: '',
  email: ''
})

// 表单验证规则
export const userFormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  passWord: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  authorityId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 对话框可见性
export const dialogVisible = ref(false)
export const dialogTitle = ref('添加用户')
export const dialogLoading = ref(false)
export const formRef = ref()

// 重置表单
export const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(userForm, {
    userName: '',
    passWord: '',
    nickName: '',
    headerImg: '',
    authorityId: 888,
    enable: 1,
    authorityIds: [],
    phone: '',
    email: ''
  })
}

// 添加用户
export const handleAddUser = () => {
  dialogTitle.value = '添加用户'
  dialogVisible.value = true
  resetForm()
}

// 提交表单
export const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      dialogLoading.value = true
      try {
        const res = await addUser(userForm)
        if (res.data && res.data.code === 0) {
          ElMessage.success('添加用户成功')
          dialogVisible.value = false
          fetchUserList() // 刷新用户列表
        } else {
          ElMessage.error(res.data?.msg || '添加用户失败')
        }
      } catch (error) {
        console.error('添加用户出错:', error)
        ElMessage.error('添加用户失败，请稍后重试')
      } finally {
        dialogLoading.value = false
      }
    }
  })
}

// 编辑用户
export const handleEdit = (row: UserInfo) => {
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  resetForm()
  
  // 填充表单数据
  Object.assign(userForm, {
    userName: row.userName,
    nickName: row.nickName,
    headerImg: row.headerImg,
    authorityId: row.authorityId,
    enable: row.enable,
    phone: row.phone,
    email: row.email
  })
  // 编辑时不需要填写密码
  userForm.passWord = ''
}

// 重设密码
export const handleResetPassword = (row: UserInfo) => {
  ElMessageBox.confirm(
    '是否将此用户密码重置为123456?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
    }
  )
    .then(async () => {
      try {
        const response = await resetPassword({ 
          ID: row.ID, 
          newPassword: '123456' 
        });
        
        if (response.data && response.data.code === 0) {
          ElMessage({
            message: '密码重置成功',
            type: 'success'
          });
        } else {
          ElMessage({
            message: response.data?.msg || '密码重置失败',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('密码重置失败:', error);
        ElMessage({
          message: '密码重置失败，请重试',
          type: 'error'
        });
      }
    })
    .catch(() => {
      // 用户取消操作，不做任何处理
    });
};

// 删除用户
export const handleDelete = (row: UserInfo) => {
  ElMessageBox.confirm('确定要删除该用户吗？此操作不可逆', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true
  }).then(async () => {
    try {
      const res = await deleteUser(row.ID);
      
      if (res.data && res.data.code === 0) {
        ElMessage({
          message: '删除用户成功',
          type: 'success'
        });
        fetchUserList(); // 刷新用户列表
      } else {
        ElMessage({
          message: res.data?.msg || '删除用户失败',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      ElMessage({
        message: '删除用户失败，请稍后重试',
        type: 'error'
      });
    }
  }).catch(() => {
    // 用户取消操作，不做任何处理
  });
}

// 定义用户详细信息类型
export interface UserDetailInfo {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  authorities: Array<{
    CreatedAt: string
    UpdatedAt: string
    authorityId: number
    authorityName: string
    children: any
    dataAuthorityId: any
    defaultRouter: string
    menus: any
    parentId: number
  }>
  authority: {
    CreatedAt: string
    UpdatedAt: string
    authorityId: number
  }
  email: string
  enable: number
  headerImg: string
  nickName: string
  originSetting: any
  phone: string
  userName: string
  uuid: string
  msg: string
}

// 用户详细信息
export const userDetailInfo = ref<UserDetailInfo | null>(null)
export const userInfoDialogVisible = ref(false)
export const userInfoLoading = ref(false)

// 获取用户详细信息
export const fetchUserInfo = async () => {
  userInfoLoading.value = true
  try {
    const res = await getUserInfo()
    if (res.data && res.data.code === 0) {
      userDetailInfo.value = res.data.data.userInfo
      userInfoDialogVisible.value = true
    } else {
      ElMessage.error(res.data?.msg || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
    ElMessage.error('获取用户信息失败，请稍后重试')
  } finally {
    userInfoLoading.value = false
  }
}

// 查看用户详细信息
export const handleViewUserInfo = (row: UserInfo) => {
  ElMessageBox.confirm(
    '是否查看该用户的详细信息?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
      draggable: true,
    }
  )
    .then(async () => {
      try {
        userInfoLoading.value = true
        // 这里模拟获取用户详情，实际项目中应该调用后端接口获取特定用户的详情
        // 由于后端接口只能获取当前登录用户的信息，这里仅作为示例
        const res = await getUserInfo()
        
        if (res.data && res.data.code === 0) {
          userDetailInfo.value = res.data.data.userInfo
          userInfoDialogVisible.value = true
        } else {
          ElMessage({
            message: res.data?.msg || '获取用户信息失败',
            type: 'error'
          })
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage({
          message: '获取用户信息失败，请稍后重试',
          type: 'error'
        })
      } finally {
        userInfoLoading.value = false
      }
    })
    .catch(() => {
      // 用户取消操作，不做任何处理
    })
}