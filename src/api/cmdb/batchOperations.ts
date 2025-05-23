import request from '@/utils/request'; // Assuming standard request utility
import type { ApiResponse } from '@/types/global'; // Assuming a global ApiResponse type

// Based on Go struct:
// type HostExecResult struct {
//  Host   string `json:"host"`
//  Output string `json:"output"`
//  Error  string `json:"error"`
// }
export interface HostExecResult {
  host: string;
  output: string;
  error: string;
}

// Based on Go struct:
// type ExecuteRequest struct {
//  Hosts    []string `json:"hosts"`    // 目标主机IP列表
//  Commands []string `json:"commands"` // 要执行的命令列表
//  Language string   `json:"language"` // "shell" 或 "python"
//  UserId   uint     `json:"userId"`   // 执行用户ID
//  Users    []string `json:"users"`    // 目标机器上的用户名，用于提权或特定用户执行
//  Ports    []int    `json:"ports"`    // 目标端口，用于特定端口操作
// }
export interface ExecuteRequest {
  hosts: string[];
  commands: string[];
  language: string;
  userId: number; // uint in Go maps to number in TS
  users?: string[]; // Optional as per current UI
  ports?: number[];   // Optional as per current UI
}

// Based on Go struct:
// type ExecuteResponse struct {
//  AllHosts      []string         `json:"allHosts"`
//  SuccessHosts  []string         `json:"successHosts"`
//  FailureHosts  []string         `json:"failureHosts"`
//  ExecutionLogs []HostExecResult `json:"executionLogs"`
//  Status        string           `json:"status"` // e.g., "Success", "Partial Failure", "Failed"
// }
export interface ExecuteResponse {
  allHosts: string[];
  successHosts: string[];
  failureHosts: string[];
  executionLogs: HostExecResult[];
  status: string;
}

// API service function for executing commands
export const executeBatchCommands = (data: ExecuteRequest): Promise<ApiResponse<ExecuteResponse>> => {
  return request<ApiResponse<ExecuteResponse>>({
    url: '/cmdb/batchOperations/execute', // Standardized endpoint
    method: 'post',
    data
  });
};

// ---- Batch Execution Logs ----

// Based on Go struct:
// type CommandExecutionLog struct {
//  gorm.Model
//  UserID         uint   `json:"userId"`
//  User           User   `json:"user" gorm:"foreignKey:UserID"` // For preloading username
//  Command        string `json:"command" gorm:"type:text"`
//  AllHosts       string `json:"allHosts" gorm:"type:text"`    // JSON array of host IPs/IDs
//  SuccessHosts   string `json:"successHosts" gorm:"type:text"` // JSON array
//  FailureHosts   string `json:"failureHosts" gorm:"type:text"` // JSON array
//  ExecutionLogs  string `json:"executionLogs" gorm:"type:longtext"` // JSON array of HostExecResult
//  Status         string `json:"status"` // Success, Partial Failure, Failed
// }
// Note: gorm.Model includes ID, CreatedAt, UpdatedAt, DeletedAt
export interface CommandExecutionLog {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null; // GORM Soft Delete
  userId: number; // Renamed from UserID for JS/TS convention
  user?: { Username: string; NickName?: string }; // Assuming User might be preloaded with Username
  command: string;
  allHosts: string; // Serialized JSON array of strings
  successHosts: string; // Serialized JSON array of strings
  failureHosts: string; // Serialized JSON array of strings
  executionLogs: string; // Serialized JSON array of HostExecResult
  status: string;
}

// Parameters for fetching batch execution logs
export interface BatchLogListParams {
  page?: number;
  pageSize?: number;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  userId?: string;    // User ID or username for filtering
  status?: string;
  // Add other potential filter fields as needed
}

// Response structure for a list of logs (assuming a generic ListResponse structure)
// If ApiResponse<T> includes { list: T[], total: number, page: number, pageSize: number } in its data field,
// then ListResponse<T> might not be needed separately here.
// For now, let's assume ApiResponse expects data to be the direct object with list, total etc.
export interface BatchLogListResponseData {
  list: CommandExecutionLog[];
  total: number;
  page: number;
  pageSize: number;
}

// API service function for fetching batch execution logs
export const getBatchExecutionLogs = (params: BatchLogListParams): Promise<ApiResponse<BatchLogListResponseData>> => {
  return request<ApiResponse<BatchLogListResponseData>>({
    url: '/cmdb/batchOperations/execLogs', // Standardized endpoint
    method: 'get', // Typically GET for listing/filtering
    params // GET requests use 'params' for query parameters
  });
};
