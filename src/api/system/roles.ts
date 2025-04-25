import request from '@/api/request'

// 获取角色列表
export const getAuthorityList = () => {
  return request({
    url: '/authority/getAuthorityList',
    method: 'post'
  })
}
