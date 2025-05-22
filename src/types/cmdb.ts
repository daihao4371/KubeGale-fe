export interface Host {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  name: string
  port: number
  project: number
  username: string
  serverHost: string
  privateKey: string
  password: string
  labels: string
  note: string
  cpuModel: string
  cpuCount: string
  memory: string
  diskTotal: string
  diskInfo: string
  os: string
  osVersion: string
  osArch: string
  status: string
  publicIP: string
  privateIP: string
  CreatedBy: number
  UpdatedBy: number
  DeletedBy: number
} 