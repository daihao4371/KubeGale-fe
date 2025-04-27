import request from '@/api/request'
import type { CreateAuthorityParams, UpdateAuthorityParams, DeleteAuthorityParams, CopyAuthorityRequest } from '@/views/system/roleManager/roleManager'

// 获取角色列表
export const getAuthorityList = () => {
  return request({
    url: '/authority/getAuthorityList',
    method: 'post',
    data: {}
  })
}

// 创建角色
export const createAuthority = (data: CreateAuthorityParams) => {
  return request({
    url: '/authority/createAuthority',
    method: 'post',
    data
  })
}

// 更新角色
export const updateAuthority = (data: UpdateAuthorityParams) => {
  return request({
    url: '/authority/updateAuthority',
    method: 'put',
    data
  })
}

// 删除角色
export const deleteAuthority = (data: DeleteAuthorityParams) => {
  return request({
    url: '/authority/deleteAuthority',
    method: 'post',
    data
  })
}

// 拷贝角色
export const copyAuthority = (data: CopyAuthorityRequest) => {
  return request({
    url: '/authority/copyAuthority',
    method: 'post',
    data
  })
}
