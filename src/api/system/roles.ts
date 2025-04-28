import request from '@/api/request'
// 修改导入路径，使用正确的类型导入
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

// 获取基础菜单树
export const getBaseMenuTree = () => {
  return request({
    url: '/menu/getBaseMenuTree',
    method: 'post',
    data: {}
  })
}

// 获取角色菜单权限
export const getMenuAuthority = (data: { authorityId: number }) => {
  return request({
    url: '/menu/getMenuAuthority',
    method: 'post',
    data
  })
}

// 获取所有API
export const getAllApis = () => {
  return request({
    url: '/api/getAllApis',
    method: 'post',
    data: {}
  })
}

// 获取角色API权限
export const getPolicyPathByAuthorityId = (data: { authorityId: number }) => {
  return request({
    url: '/casbin/getPolicyPathByAuthorityId',
    method: 'post',
    data
  })
}

// 更新 Casbin 规则
export const updateCasbin = (data: {
  authorityId: number
  casbinInfos: Array<{
    path: string
    method: string
  }>
}) => {
  return request({
    url: '/casbin/updateCasbin',
    method: 'post',
    data
  })
}

// 设置数据权限
export const setDataAuthority = (data: {
  authorityId: number
  dataAuthorityId: Array<{
    authorityId: number
  }>
}) => {
  return request({
    url: '/authority/setDataAuthority',
    method: 'post',
    data
  })
}

// 设置菜单权限
export const addMenuAuthority = (data: {
  menus: Array<{
    ID: number
    path: string
    name: string
    component: string
    sort: number
    meta: {
      title: string
      icon: string
      keepAlive: boolean
    }
    parentId: number
    hidden: boolean
  }>
  authorityId: number
}) => {
  return request({
    url: '/menu/addMenuAuthority',
    method: 'post',
    data
  })
}

// 刷新 Casbin 规则
export const freshCasbin = () => {
  return request({
    url: '/api/freshCasbin',
    method: 'get'
  })
}
