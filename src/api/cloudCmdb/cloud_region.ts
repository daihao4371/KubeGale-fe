import request from '@/utils/request'
import type { ApiResponse } from '@/types/cloudCmdb'

interface IdParams {
  id: number
}

export const syncRegion = (params: IdParams) => {
  return request<ApiResponse>({
    url: '/cloudcmdb/cloud_region/sync',
    method: 'post',
    data: params
  })
}
