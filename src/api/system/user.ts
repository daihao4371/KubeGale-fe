import request from '@/api/request'

// 获取用户列表
export const getUserList = (data: { page: number; pageSize: number }) => {
  return request({
    url: '/user/getUserList',
    method: 'post',
    data
  })
}

// 定义用户注册数据类型
export interface RegisterUserData {
  userName: string
  passWord: string
  nickName: string
  headerImg?: string
  authorityId: number
  enable: number
  authorityIds?: number[]
  phone: string
  email: string
}

// 添加用户
export const addUser = (data: RegisterUserData) => {
  return request({
    url: '/user/admin_register',
    method: 'post',
    data
  })
}

// 编辑用户
export const updateUser = (data: any) => {
  return request({
    url: '/user/setUserInfo',
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id: number) => {
  return request({
    url: '/user/deleteUser',
    method: 'delete',
    data: { id }
  })
}

// 重设密码
export const resetPassword = (data: { ID: number; newPassword: string }) => {
  return request({
    url: '/user/resetPassword',
    method: 'post',
    data
  })
}