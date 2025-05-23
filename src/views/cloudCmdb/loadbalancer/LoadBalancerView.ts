import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { syncLoadBalancer, getLoadBalancerList } from '@/api/cloudCmdb/cloud_load_balancer'
import type { LoadBalancerItem } from '@/api/cloudCmdb/cloud_load_balancer'
import type { PlatformRegionTreeItem, RegionNode } from '@/api/cloudCmdb/cloud_rds'

// 类型定义
export interface SearchInfo {
  keyword: string
  platformId: number | null // Added
  region: string | null     // Added
}

export default function useLoadBalancer() {
  // 状态定义
  const tableData = ref<LoadBalancerItem[]>([])
  const loading = ref(false)
  // currentProviderId is replaced by searchInfo.platformId
  const searchInfo = ref<SearchInfo>({ 
    keyword: '',
    platformId: null,
    region: null,
  })
  const pageSize = ref(10)
  const currentPage = ref(1)
  const total = ref(0)
  const detailDialogVisible = ref(false)
  const currentDetail = ref<LoadBalancerItem | null>(null)

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true
    try {
      const params: any = { // Using any temporarily to add platform_id
        loadBalancer: {
          name: searchInfo.value.keyword || undefined, // Use undefined if empty
          instanceId: searchInfo.value.keyword || undefined, // Use undefined if empty
          region: searchInfo.value.region || undefined, // Added region from searchInfo
        },
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchInfo.value.keyword || undefined,
        field: '', // Consider removing if not used
        orderKey: 'id' as const,
        desc: false,
        platform_id: searchInfo.value.platformId || undefined, // Added platform_id
      }
      const res = await getLoadBalancerList(params)
      if (res.code === 0) {
        tableData.value = res.data.list
        total.value = res.data.total
      } else {
        ElMessage.error(res.msg || '获取列表失败')
      }
    } catch (error) {
      ElMessage.error('获取列表失败')
    } finally {
      loading.value = false
    }
  }

  // 初始化
  const init = () => {
    fetchList()
  }

  // 处理平台选择
  const handlePlatformSelect = (payload: { platform: PlatformRegionTreeItem, region: RegionNode | null }) => {
    if (payload.region) {
      searchInfo.value.platformId = payload.platform.id; // Assuming platform context is passed with region
      searchInfo.value.region = payload.region.region_id; // Use region_id for consistency
    } else if (payload.platform) {
      searchInfo.value.platformId = payload.platform.id;
      searchInfo.value.region = null; // Clear region if only platform is selected
    } else {
      searchInfo.value.platformId = null;
      searchInfo.value.region = null;
    }
    currentPage.value = 1;
    fetchList();
  }

  // 搜索
  const onSearch = () => {
    currentPage.value = 1; // Reset page on new search
    fetchList();
  }

  const onReset = () => {
    searchInfo.value.keyword = '';
    searchInfo.value.platformId = null; // Reset platformId
    searchInfo.value.region = null;     // Reset region
    currentPage.value = 1;
    fetchList();
  }

  // 分页
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    fetchList()
  }
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    fetchList()
  }

  // 同步
  const onSync = async () => {
    if (!searchInfo.value.platformId) { // Use searchInfo.platformId
      ElMessage.warning('请先选择云厂商')
      return
    }
    loading.value = true // Consider a separate syncing ref if needed
    try {
      const res = await syncLoadBalancer(searchInfo.value.platformId) // Use searchInfo.platformId
      if (res.code === 0) {
        ElMessage.success(res.msg || '同步操作成功')
        fetchList()
      } else {
        ElMessage.error(res.msg || '同步操作失败')
      }
    } catch (error) {
      ElMessage.error('同步操作失败')
    } finally {
      loading.value = false
    }
  }

  // 详情
  const handleDetail = (row: LoadBalancerItem) => {
    currentDetail.value = row
    detailDialogVisible.value = true
  }

  return {
    tableData,
    loading,
    // currentProviderId, // Removed
    searchInfo, // Now includes platformId and region
    pageSize,
    currentPage,
    total,
    detailDialogVisible,
    currentDetail,
    init,
    handlePlatformSelect,
    onSearch,
    onReset,
    onSync,
    handleCurrentChange,
    handleSizeChange,
    handleDetail
  }
}
