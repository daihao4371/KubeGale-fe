import request from '@/api/request'

export interface LoginParams {
  username: string
  password: string
  captchaId: string
  captcha: string
}

export interface LoginResponse {
  code: number
  msg: string
  data: {
    expiresAt: number
    token: string
    user: {
      ID: number
      CreatedAt: string
      UpdatedAt: string
      authorities: Array<{
        CreatedAt: string
        UpdatedAt: string
        authorityId?: number
      }>
      email: string
      enable: number
      headerImg: string
      nickName: string
      originSetting: any
      phone: string
      userName: string
      uuid: string
    }
  }
}

export function login(data: LoginParams) {
  return request.post<LoginResponse>('/base/login', data)
}