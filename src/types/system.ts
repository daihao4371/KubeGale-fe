// 基础时间接口
export interface BaseTime {
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
}

// 基础菜单接口
export interface BaseMenu {
  menuId: number
  menuName: string
  path: string
  component: string
  parentId: number
}

// 基础角色接口
export interface BaseAuthority {
  authorityId: number
  authorityName: string
  parentId: number
  defaultRouter: string
}

// 角色信息接口
export interface Authority extends BaseAuthority, BaseTime {
  dataAuthorityId: Authority[] | null
  children: Authority[] | null
  menus: Record<string, unknown> | null
}

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
  ID?: number
}

// 用户数据类型
export interface UserInfo extends BaseUserInfo {
  ID: number
  authority?: BaseTime
  originSetting?: Record<string, unknown>
  authorityIds?: number[]
}

// 用户详细信息类型
export interface UserDetailInfo extends UserInfo, BaseTime {
  authorities: Array<Authority>
  uuid: string
  msg: string
}

// 以下为 API 相关类型
export interface Api {
  ID: number
  path: string
  description: string
  apiGroup: string
  method: string
  createdAt: string
  updatedAt: string
}

export interface ApiState {
  loading: boolean
  apiList: Api[]
  total: number
  pageSize: number
  currentPage: number
  dialogVisible: boolean
  dialogTitle: string
  dialogType: 'create' | 'edit'
  formLoading: boolean
  apiGroups: string[]
  searchForm: {
    path: string
    description: string
    apiGroup: string
    method: string
  }
  filteredApiList: Api[]
}

export interface ApiForm {
  ID?: number
  path: string
  description: string
  apiGroup: string
  method: string
}

export const defaultApiForm: ApiForm = {
  path: '',
  description: '',
  apiGroup: '',
  method: 'GET'
}

// 角色管理相关接口
export interface CreateRoleForm {
  authorityId: number
  authorityName: string
  parentId: number
  defaultRouter: string
}

export interface CopyRoleForm {
  authorityId: number
  authorityName: string
  parentId: number
  oldAuthorityId: number
  oldAuthorityName: string
}

export interface CopyAuthorityRequest {
  authority: {
    authorityId: number
    authorityName: string
    parentId: number
    defaultRouter: string
  }
  oldAuthorityId: number
}

export interface DeleteAuthorityParams {
  AuthorityId: number
}

// 角色管理状态接口
export interface RoleState {
  roleList: Authority[]
  loading: boolean
  createRoleDialogVisible: boolean
  createRoleLoading: boolean
  createRoleForm: CreateRoleForm
  editRoleDialogVisible: boolean
  editRoleLoading: boolean
  editRoleForm: CreateRoleForm
  copyRoleDialogVisible: boolean
  copyRoleLoading: boolean
  copyRoleForm: CopyRoleForm
  permissionDialogVisible: boolean
  currentRole: Authority | null
}

// 角色管理表单验证规则
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

// 默认角色表单数据
export const defaultCreateRoleForm: CreateRoleForm = {
  authorityId: 0,
  authorityName: '',
  parentId: 0,
  defaultRouter: 'dashboard'
}

export const defaultCopyRoleForm: CopyRoleForm = {
  authorityId: 0,
  authorityName: '',
  parentId: 0,
  oldAuthorityId: 0,
  oldAuthorityName: ''
}

// 操作记录相关接口
export interface User {
  id: number
  username: string
  realName?: string
  nickname?: string
}

export interface SysOperationRecord {
  id: number
  created_at: string
  updated_at: string
  ip: string
  method: string
  path: string
  status: number
  latency: string | number
  agent: string
  error_message: string
  body: string
  resp: string
  user_id: number
  user: User
  operator_name?: string
  operator_real_name?: string
  ID?: number
  CreatedAt?: string
  UpdatedAt?: string
}

export interface OperationRecordParams {
  page?: number
  pageSize?: number
  path?: string
  method?: string
  status?: number
  ip?: string
  userId?: number
  startTime?: string
  endTime?: string
}

export interface OperationRecordState {
  loading: boolean
  operationList: SysOperationRecord[]
  total: number
  pageSize: number
  currentPage: number
  searchForm: OperationRecordParams
} 