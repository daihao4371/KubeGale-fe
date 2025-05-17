export interface Region {
  id: number
  name: string
}

export interface CloudProvider {
  id: number
  name: string
  platform: string
  access_key_id: string
  access_key_secret: string
  created_at?: string
  updated_at?: string
}

export interface CloudProviderState {
  loading: boolean
  providerList: CloudProvider[]
  total: number
  pageSize: number
  currentPage: number
  dialogVisible: boolean
  dialogTitle: string
  dialogType: 'create' | 'edit'
  formLoading: boolean
  searchForm: {
    name: string
    type: string
    status: string
  }
  filteredProviderList: CloudProvider[]
}

export interface CloudProviderForm {
  id?: number
  name: string
  platform: string
  access_key_id: string
  access_key_secret: string
}

export const defaultCloudProviderForm: CloudProviderForm = {
  name: '',
  platform: '',
  access_key_id: '',
  access_key_secret: ''
}

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface CloudProviderListResponse {
  list: CloudProvider[]
  total: number
  page: number
  pageSize: number
}

export interface CloudProviderDetailResponse {
  cloud_platform: CloudProvider
  regions: Region[]
}

export interface CloudProviderCreateResponse {
  code: number
  data: Record<string, never>
  msg: string
} 