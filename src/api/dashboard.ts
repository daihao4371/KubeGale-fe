import request from '@/utils/request'; // Assuming standard request utility

// If you have a global ApiResponse type, import it instead.
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// Based on Go struct:
// type ResourceCounts struct {
//  VirtualMachines int64 `json:"virtual_machines,omitempty"`
//  RDSInstances    int64 `json:"rds_instances,omitempty"`
//  LoadBalancers   int64 `json:"load_balancers,omitempty"`
// }
export interface ResourceCounts {
  virtual_machines?: number; // Was int64, using number
  rds_instances?: number;
  load_balancers?: number;
}

// Based on Go struct:
// type ProviderResourceCount struct {
//  ProviderID    uint           `json:"provider_id"`
//  ProviderName  string         `json:"provider_name"`
//  ProviderType  string         `json:"provider_type"` // e.g., "aliyun", "aws"
//  ResourceCounts ResourceCounts `json:"resource_counts"`
// }
export interface ProviderResourceCount {
  provider_id: number; // Was uint
  provider_name: string;
  provider_type: string; // e.g., 'aliyun', 'aws'
  resource_counts: ResourceCounts;
}

// API service function to get CMDB stats
// The backend is expected to return an array of the new ProviderResourceCount objects.
export const getCmdbStats = (params?: { resource_types?: string; provider_ids?: string }): Promise<ApiResponse<ProviderResourceCount[]>> => {
  return request<ApiResponse<ProviderResourceCount[]>>({
    url: '/cloudCmdb/stats/countsByProvider', // Endpoint as specified
    method: 'get',
    params // Query parameters for filtering
  });
};
