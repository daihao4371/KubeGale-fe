// 钉钉通知卡片内容
export interface DingTalkCardContent {
  alert_level: string
  alert_name: string
  notification_policy: string
  alert_content: string
  notified_users: string
  last_similar_alert: string
  alert_handler: string
  claim_alert: boolean
  resolve_alert: boolean
  mute_alert: boolean
  unresolved_alert: boolean
}

// 飞书通知卡片内容
export interface FeiShuCardContent {
  alert_level: string
  alert_name: string
  alert_content: string
  notified_users: string
  alert_handler: string
}

// 创建钉钉通知请求参数
export interface CreateDingTalkParams {
  name: string
  notification_policy: string
  send_daily_stats: boolean
  signature_key: string
  robot_url: string
  card_content: DingTalkCardContent
}

// 创建飞书通知请求参数
export interface CreateFeiShuParams {
  name: string
  notification_policy: string
  send_daily_stats: boolean
  robot_url: string
  card_content: FeiShuCardContent
}

// 更新通知请求参数
export interface UpdateNotificationParams {
  id: number
  name?: string
  notification_policy?: string
  send_daily_stats?: boolean
  signature_key?: string
  robot_url?: string
  app_id?: string
  app_secret?: string
  card_content?: DingTalkCardContent
}

// 删除通知请求参数
export interface DeleteNotificationParams {
  id: number
}

// 测试通知请求参数
export interface TestNotificationParams {
  id: number
  test_content?: string
}

// 卡片内容请求参数
export interface CardContentParams {
  notification_id: number
  card_content: DingTalkCardContent
}

// 获取通知列表请求参数
export interface GetNotificationListParams {
  page?: number
  page_size?: number
  name?: string
  type?: string
}

// 获取通知详情请求参数
export interface GetNotificationDetailParams {
  id: number
}

// 通知列表项
export interface NotificationItem {
  id: number
  name: string
  type: string
  notification_policy: string
  send_daily_stats: boolean
  created_at: string
  updated_at: string
  robot_url?: string
  signature_key?: string
  app_id?: string
  app_secret?: string
}

// 通知列表响应
export interface NotificationListResponse {
  total: number
  items: NotificationItem[]
}

// 创建/更新响应
export interface CreateUpdateResponse {
  id: number
}

// 通用响应格式
export interface ApiResponse<T = Record<string, never>> {
  code: number
  data: T
  msg: string
}
