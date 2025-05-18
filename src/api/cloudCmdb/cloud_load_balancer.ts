import request from '@/utils/request'

// 负载均衡接口参数类型
interface LoadBalancerParams {
  page?: number
  pageSize?: number
  name?: string
  provider?: string
}

// 负载均衡表单数据类型
interface LoadBalancerForm {
  name: string
  provider: string
  region: string
}

// 负载均衡列表响应类型
interface LoadBalancerListResponse {
  code: number
  msg: string
  data: {
    list: Array<{
      id: number
      name: string
      provider: string
      region: string | null
      created_at?: string
    }>
    total: number
  }
}

// 负载均衡树形结构响应类型
export interface LoadBalancerTreeResponse {
  code: number
  data: {
    list: Array<{
      id: number
      name: string
      region: string | null
    }>
    total: number
    page: number
    pageSize: number
  }
  msg: string
}

// 同步响应类型
export interface SyncResponse {
  code: number
  data: Record<string, never>
  msg: string
}

// 获取负载均衡列表
export const getLoadBalancerList = (params: LoadBalancerParams) => {
  return request<LoadBalancerListResponse>({
    url: '/api/v1/cloud/loadbalancer/list',
    method: 'get',
    params
  })
}

// 获取负载均衡树形结构
export function getLoadBalancerTree() {
  return request<LoadBalancerTreeResponse>({
    url: '/loadBalancer/tree',
    method: 'post'
  })
}

// 创建负载均衡
export const createLoadBalancer = (data: LoadBalancerForm) => {
  return request({
    url: '/api/v1/cloud/loadbalancer',
    method: 'post',
    data
  })
}

// 更新负载均衡
export const updateLoadBalancer = (id: number, data: LoadBalancerForm) => {
  return request({
    url: `/api/v1/cloud/loadbalancer/${id}`,
    method: 'put',
    data
  })
}

// 删除负载均衡
export const deleteLoadBalancer = (id: number) => {
  return request({
    url: `/api/v1/cloud/loadbalancer/${id}`,
    method: 'delete'
  })
}

// 批量删除负载均衡
export const batchDeleteLoadBalancer = (ids: number[]) => {
  return request({
    url: '/api/v1/cloud/loadbalancer/batch',
    method: 'delete',
    data: { ids }
  })
}

// 同步负载均衡数据
export const syncLoadBalancer = (id: number) => {
  return request<SyncResponse>({
    url: '/loadBalancer/sync',
    method: 'post',
    data: { id }
  })
}
