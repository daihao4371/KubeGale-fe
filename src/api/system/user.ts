import request from '@/api/request'

// 获取用户列表
export const getUserList = (data: { page: number; pageSize: number }) => {
  return request({
    url: '/user/getUserList',
    method: 'post',
    data
  })
}

// 添加用户
export const addUser = (data: any) => {
  return request({
    url: '/user/register',
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
export const deleteUser = (data: { id: string }) => {
  return request({
    url: '/user/deleteUser',
    method: 'delete',
    data
  })
}

// 重设密码
export const resetPassword = (data: { id: string; newPassword: string }) => {
  return request({
    url: '/user/resetPassword',
    method: 'post',
    data
  })
}