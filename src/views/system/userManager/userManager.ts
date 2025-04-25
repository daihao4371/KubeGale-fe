import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, addUser, updateUser, deleteUser, getUserInfo, setUserAuthorities } from '@/api/system/user'
import { handleResetPassword } from './passwordManager'
import { getAuthorityList } from '@/api/system/roles'
import type { Authority, UserInfo, UserDetailInfo, RegisterUserData } from '@/types/system'

// 分页参数
export const currentPage = ref(1)
export const pageSize = ref(10)
export const total = ref(0)
export const loading = ref(false)

// 用户列表数据
export const userList = ref<UserInfo[]>([])

// 角色列表数据
export const roleList = ref<Authority[]>([])
export const roleLoading = ref(false)

// 获取角色列表
export const fetchRoleList = async () => {
  roleLoading.value = true
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
    roleLoading.value = false
  }
}

// 处理角色选择变化
export const handleRoleChange = async (value: number[], row: UserInfo) => {
  try {
    const res = await setUserAuthorities({
      ID: row.ID,
      authorityIds: value
    })
    
    if (res.data && res.data.code === 0) {
      ElMessage.success('设置用户角色成功')
      // 更新本地数据
      row.authorityId = value[0] // 更新主角色ID，用于显示
      row.authorityIds = value // 保存所有选中的角色ID
    } else {
      ElMessage.error(res.data?.msg || '设置用户角色失败')
    }
  } catch (error) {
    console.error('设置用户角色失败:', error)
    ElMessage.error('设置用户角色失败，请稍后重试')
  }
}

// 格式化角色选项
export const formatRoleOptions = (roles: Authority[]): Array<{
  value: number
  label: string
  children?: Array<{
    value: number
    label: string
    children?: Array<{
      value: number
      label: string
    }>
  }>
}> => {
  return roles.map(role => ({
    value: role.authorityId,
    label: role.authorityName,
    children: role.children ? formatRoleOptions(role.children) : undefined
  }))
}

// 获取角色选项
export const roleOptions = computed(() => formatRoleOptions(roleList.value))

// 获取用户当前选中的角色ID列表
export const getUserRoleIds = (row: UserInfo): number[] => {
  return row.authorityIds || [row.authorityId]
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
        let res;
        // 根据对话框标题判断是添加还是编辑操作
        if (dialogTitle.value === '添加用户') {
          res = await addUser(userForm)
        } else {
          // 编辑用户时调用updateUser接口
          // 编辑时不传递userName字段，确保不会修改用户名
          res = await updateUser({
            ID: userForm.ID,
            nickName: userForm.nickName,
            phone: userForm.phone,
            email: userForm.email,
            headerImg: userForm.headerImg,
            authorityIds: [userForm.authorityId], // 将单个角色ID转换为数组
            enable: userForm.enable
          })
        }
        
        if (res.data && res.data.code === 0) {
          ElMessage.success(dialogTitle.value === '添加用户' ? '添加用户成功' : '编辑用户成功')
          dialogVisible.value = false
          fetchUserList() // 刷新用户列表
        } else {
          ElMessage.error(res.data?.msg || (dialogTitle.value === '添加用户' ? '添加用户失败' : '编辑用户失败'))
        }
      } catch (error) {
        console.error(dialogTitle.value === '添加用户' ? '添加用户出错:' : '编辑用户出错:', error)
        ElMessage.error((dialogTitle.value === '添加用户' ? '添加用户' : '编辑用户') + '失败，请稍后重试')
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
    ID: row.ID, // 保存用户ID，用于编辑操作
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
  
  // 移除密码字段的验证规则
  if (formRef.value) {
    formRef.value.clearValidate('passWord')
  }
}

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

// 用户详细信息
export const userDetailInfo = ref<UserDetailInfo | null>(null)
export const userInfoDialogVisible = ref(false)
export const userInfoLoading = ref(false)

// 用户信息表单数据
export interface UserInfoForm {
  phone: string
  email: string
}

export const userInfoForm = reactive<UserInfoForm>({
  phone: '',
  email: ''
})

// 用户信息表单验证规则
export const userInfoFormRules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 用户信息表单引用
export const userInfoFormRef = ref()

// 提交用户信息表单
export const submitUserInfoForm = async () => {
  if (!userInfoFormRef.value) return
  
  await userInfoFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      userInfoLoading.value = true
      try {
        // 确保保留原有的昵称和启用状态
        const updateData = {
          ID: userDetailInfo.value?.ID,
          nickName: userDetailInfo.value?.nickName,  // 保留原有昵称
          phone: userInfoForm.phone,
          email: userInfoForm.email,
          enable: userDetailInfo.value?.enable,      // 保留原有启用状态
          headerImg: userDetailInfo.value?.headerImg, // 保留头像
          authorityIds: userDetailInfo.value?.authorities?.map(auth => auth.authorityId) || [] // 保留权限
        }
        
        const res = await updateUser(updateData)
        
        if (res.data && res.data.code === 0) {
          ElMessage.success('个人信息更新成功')
          userInfoDialogVisible.value = false
          // 更新本地用户信息
          if (userDetailInfo.value) {
            userDetailInfo.value.phone = userInfoForm.phone
            userDetailInfo.value.email = userInfoForm.email
          }
        } else {
          ElMessage.error(res.data?.msg || '个人信息更新失败')
        }
      } catch (error) {
        console.error('更新个人信息失败:', error)
        ElMessage.error('更新个人信息失败，请稍后重试')
      } finally {
        userInfoLoading.value = false
      }
    }
  })
}

// 获取用户详细信息
export const fetchUserInfo = async () => {
  userInfoLoading.value = true
  try {
    const res = await getUserInfo()
    if (res.data && res.data.code === 0) {
      userDetailInfo.value = res.data.data.userInfo
      // 初始化表单数据
      userInfoForm.phone = userDetailInfo.value?.phone || ''
      userInfoForm.email = userDetailInfo.value?.email || ''
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

// 处理启用状态变化
export const handleEnableChange = async (row: UserInfo) => {
  try {
    const res = await updateUser({
      ID: row.ID,
      enable: row.enable,
      nickName: row.nickName,
      phone: row.phone,
      email: row.email,
      headerImg: row.headerImg,
      authorityIds: [row.authorityId]
    })
    
    if (res.data && res.data.code === 0) {
      ElMessage.success(`用户${row.enable === 1 ? '启用' : '禁用'}成功`)
    } else {
      // 如果更新失败，恢复原来的状态
      row.enable = row.enable === 1 ? 2 : 1
      ElMessage.error(res.data?.msg || '更新用户状态失败')
    }
  } catch (error) {
    // 如果发生错误，恢复原来的状态
    row.enable = row.enable === 1 ? 2 : 1
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新用户状态失败，请稍后重试')
  }
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