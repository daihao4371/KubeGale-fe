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