import request from '@/api/request'

// 创建钉钉通知
export const createDingTalk = (data: any) => {
  return request({
    url: '/notification/createDingTalk',
    method: 'post',
    data
  })
}

// 创建飞书通知
export const createFeiShu = (data: any) => {
  return request({
    url: '/notification/createFeiShu',
    method: 'post',
    data
  })
}

// 更新钉钉通知
export const updateDingTalk = (data: any) => {
  return request({
    url: '/notification/updateDingTalk',
    method: 'put',
    data
  })
}

// 更新飞书通知
export const updateFeiShu = (data: any) => {
  return request({
    url: '/notification/updateFeiShu',
    method: 'put',
    data
  })
}

// 删除通知配置
export const deleteNotification = (data: any) => {
  return request({
    url: '/notification/deleteNotification',
    method: 'delete',
    data
  })
}

// 测试通知发送
export const testNotification = (data: any) => {
  return request({
    url: '/notification/testNotification',
    method: 'post',
    data
  })
}

// 创建卡片内容
export const createCardContent = (data: any) => {
  return request({
    url: '/notification/createCardContent',
    method: 'post',
    data
  })
}

// 更新卡片内容
export const updateCardContent = (data: any) => {
  return request({
    url: '/notification/updateCardContent',
    method: 'put',
    data
  })
}

// 获取通知配置列表
export const getNotificationList = (data: any) => {
  return request({
    url: '/notification/getNotificationList',
    method: 'post',
    data
  })
}

// 根据ID获取通知配置
export const getNotificationById = (params: any) => {
  return request({
    url: '/notification/getNotificationById',
    method: 'get',
    params
  })
}

// 根据通知ID获取卡片内容
export const getCardContent = (params: any) => {
  return request({
    url: '/notification/getCardContent',
    method: 'get',
    params
  })
}

