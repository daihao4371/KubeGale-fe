import request from '@/api/request'

// 角色信息接口
export interface Authority {
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  authorityId: number
  authorityName: string
  parentId: number
  dataAuthorityId: Authority[] | null
  children: Authority[] | null
  menus: any | null
  defaultRouter: string
}

// 获取角色列表
export const getAuthorityList = () => {
  return request({
    url: '/authority/getAuthorityList',
    method: 'post'
  })
}
