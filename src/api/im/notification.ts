import request from '@/utils/request'
import type {
  ApiResponse,
  CreateDingTalkParams,
  CreateFeiShuParams,
  UpdateNotificationParams,
  DeleteNotificationParams,
  TestNotificationParams,
  CardContentParams,
  GetNotificationListParams,
  GetNotificationDetailParams,
  NotificationListResponse,
  CreateUpdateResponse,
  DingTalkCardContent,
  NotificationItem
} from '@/types/im'

// 创建钉钉通知
export const createDingTalk = (data: CreateDingTalkParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/createDingTalk',
    method: 'post',
    data
  })
}

// 创建飞书通知
export const createFeiShu = (data: CreateFeiShuParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/createFeiShu',
    method: 'post',
    data
  })
}

// 更新钉钉通知
export const updateDingTalk = (data: UpdateNotificationParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/updateDingTalk',
    method: 'put',
    data
  })
}

// 更新飞书通知
export const updateFeiShu = (data: UpdateNotificationParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/updateFeiShu',
    method: 'put',
    data
  })
}

// 删除通知配置
export const deleteNotification = (params: DeleteNotificationParams) => {
  return request<ApiResponse>({
    url: '/notification/deleteNotification',
    method: 'delete',
    params
  })
}

// 测试通知发送
export const testNotification = (data: TestNotificationParams) => {
  return request<ApiResponse>({
    url: '/notification/testNotification',
    method: 'post',
    data
  })
}

// 创建卡片内容
export const createCardContent = (data: CardContentParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/createCardContent',
    method: 'post',
    data
  })
}

// 更新卡片内容
export const updateCardContent = (data: CardContentParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/updateCardContent',
    method: 'put',
    data
  })
}

// 获取通知配置列表
export const getNotificationList = (data: GetNotificationListParams) => {
  return request<ApiResponse<NotificationListResponse>>({
    url: '/notification/getNotificationList',
    method: 'post',
    data
  })
}

// 根据ID获取通知配置
export const getNotificationById = (params: GetNotificationDetailParams) => {
  return request<ApiResponse<NotificationItem>>({
    url: '/notification/getNotificationById',
    method: 'get',
    params
  })
}

// 根据通知ID获取卡片内容
export const getCardContent = (params: GetNotificationDetailParams) => {
  return request<ApiResponse<DingTalkCardContent>>({
    url: '/notification/getCardContent',
    method: 'get',
    params
  })
}

