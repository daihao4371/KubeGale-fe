import request from '@/utils/request'
import type {
  ApiResponse,
  CreateFeiShuParams,
  UpdateNotificationParams,
  DeleteNotificationParams,
  TestNotificationParams,
  CardContentParams,
  GetNotificationListParams,
  GetNotificationDetailParams,
  NotificationListResponse,
  CreateUpdateResponse,
  NotificationItem,
  DingTalkCardContent,
  NotificationCardContent
} from '@/types/im'

// 创建飞书通知
export const createFeiShu = (data: CreateFeiShuParams) => {
  return request<ApiResponse<CreateUpdateResponse>>({
    url: '/notification/createFeiShu',
    method: 'post',
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
export const getCardContent = (params: { notification_id: number }) => {
  return request<ApiResponse<NotificationCardContent>>({
    url: '/notification/getCardContent',
    method: 'get',
    params
  })
}

// ---- DingTalk Specific Types and Functions ----

// Matches Go struct: im.DingTalkConfig (simplified for request/response focus)
// gorm.Model implies ID, CreatedAt, UpdatedAt, DeletedAt
export interface DingTalkConfig {
  ID: number; // This is the ID of the DingTalkConfig record itself
  notification_id: number; // Foreign key to the general NotificationItem
  webhook_url: string;
  secret?: string; // Optional
  CreatedAt: string;
  UpdatedAt: string;
}

// Matches Go struct: request.CreateDingTalkRequest
export interface CreateDingTalkRequest {
  name: string;
  webhook_url: string;
  secret?: string; // Optional
  notify_events: string[];
  send_daily_stats: boolean;
  notification_type: 'dingtalk'; // Fixed value
}

// Matches Go struct: request.UpdateDingTalkRequest
// Assuming 'id' here refers to the general NotificationItem ID for simplicity,
// and backend handles finding/updating the associated DingTalkConfig.
// CardContent is kept from FeiShu for now, may need DingTalk specific version.
export interface UpdateDingTalkRequest {
  id: number; // General NotificationItem ID
  name?: string;
  webhook_url?: string;
  secret?: string;
  notification_policy?: string; // Comma-separated string from notify_events
  send_daily_stats?: boolean;
  card_content?: FeiShuCardContent; // Re-evaluate if DingTalk has different card content structure
}

// Create DingTalk Notification
export const createDingTalkNotification = (data: CreateDingTalkRequest) => {
  return request<ApiResponse<CreateUpdateResponse>>({ // Assuming CreateUpdateResponse is generic
    url: '/notification/createDingTalk',
    method: 'post',
    data
  });
}

// Update DingTalk Notification
export const updateDingTalkNotification = (data: UpdateDingTalkRequest) => {
  return request<ApiResponse<CreateUpdateResponse>>({ // Assuming CreateUpdateResponse is generic
    url: '/notification/updateDingTalk', // As per backend router
    method: 'put', // Typically PUT for updates
    data
  });
}