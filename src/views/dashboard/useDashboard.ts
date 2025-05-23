import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getCmdbStats, type ProviderResourceCount } from '@/api/dashboard'; // Adjust path as necessary

// Helper to get provider icon path - uses provider_type
const getProviderIcon = (providerType: string): string => {
  const type = providerType.toLowerCase();
  if (type === 'aliyun') return 'src/assets/images/aliyun.png';
  if (type === 'tencent') return 'src/assets/images/tencent.png';
  if (type === 'aws') return 'src/assets/images/aws.png';
  if (type === 'huawei') return 'src/assets/images/huawei.png';
  return 'src/assets/images/default-cloud.png'; // Fallback icon for other types
};

// Helper to get provider-specific color - uses provider_type
const getProviderColor = (providerType: string): string => {
  const type = providerType.toLowerCase();
  if (type === 'aliyun') return '#FF6A00';
  if (type === 'tencent') return '#00A4FF';
  if (type === 'aws') return '#FF9900';
  if (type === 'huawei') return '#E31F2E';
  return '#303133'; // Default color
};

// Updated TotalStats to reflect only cloud resources
export interface TotalStats {
  cloudServers: number; // 'virtual_machines' from API
  cloudDatabases: number; // 'rds_instances' from API
  cloudLoadBalancers: number; // 'load_balancers' from API
}

// Updated PerProviderStatItem to align with new API structure
export interface PerProviderStatItem {
  provider_id: number;
  provider_name: string; // Renamed from 'provider' to match API
  provider_type: string;
  icon?: string;
  color?: string;
  vms: number;  // Corresponds to virtual_machines
  rds: number;  // Corresponds to rds_instances
  lbs: number;  // Corresponds to load_balancers
}

export default function useDashboard() {
  const loading = ref(false);
  const totalStats = reactive<TotalStats>({
    cloudServers: 0,
    cloudDatabases: 0,
    cloudLoadBalancers: 0,
  });
  const perProviderStats = ref<PerProviderStatItem[]>([]);

  const fetchDashboardStats = async () => {
    loading.value = true;
    // Reset stats before fetching
    Object.assign(totalStats, { cloudServers: 0, cloudDatabases: 0, cloudLoadBalancers: 0 });
    perProviderStats.value = [];

    try {
      // API call - resource_types filter might not be needed if backend returns all cloud types by default
      const response = await getCmdbStats(); // No specific resource_types needed as per new API structure focus
      
      if (response.code === 0 && response.data) {
        const responseData: ProviderResourceCount[] = response.data;

        // Initialize totals
        let currentCloudServers = 0;
        let currentCloudDatabases = 0;
        let currentCloudLoadBalancers = 0;
        
        responseData.forEach(item => {
          // Summing for totalStats
          currentCloudServers += item.resource_counts.virtual_machines || 0;
          currentCloudDatabases += item.resource_counts.rds_instances || 0;
          currentCloudLoadBalancers += item.resource_counts.load_balancers || 0;
        });

        totalStats.cloudServers = currentCloudServers;
        totalStats.cloudDatabases = currentCloudDatabases;
        totalStats.cloudLoadBalancers = currentCloudLoadBalancers;

        // Mapping for perProviderStats
        perProviderStats.value = responseData.map(item => ({
          provider_id: item.provider_id,
          provider_name: item.provider_name,
          provider_type: item.provider_type,
          icon: getProviderIcon(item.provider_type),
          color: getProviderColor(item.provider_type),
          vms: item.resource_counts.virtual_machines || 0,
          rds: item.resource_counts.rds_instances || 0,
          lbs: item.resource_counts.load_balancers || 0,
        }));

      } else {
        ElMessage.error(response.msg || '获取CMDB统计数据失败');
      }
    } catch (error) {
      console.error('获取CMDB统计数据失败:', error);
      ElMessage.error('获取CMDB统计数据失败');
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    totalStats,
    perProviderStats,
    fetchDashboardStats,
  };
}
