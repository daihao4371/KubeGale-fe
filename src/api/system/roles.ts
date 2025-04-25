import request from '@/api/request'

// 获取角色列表
export const getAuthorityList = () => {
  return request({
    url: '/authority/getAuthorityList',
    method: 'post'
  })
}

// 创建角色
export const createAuthority = (data: {
  authorityId: number
  authorityName: string
  parentId: number
  defaultRouter?: string
}) => {
  return request({
    url: '/authority/createAuthority',
    method: 'post',
    data
  })
}
