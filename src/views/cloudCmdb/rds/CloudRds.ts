import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getRdsList,
  syncRds,
} from '@/api/cloudCmdb/cloud_rds'
import type { RdsInstance } from '@/types/cloudCmdb'
import type { PlatformRegionTreeItem, RegionNode } from '@/api/cloudCmdb/cloud_rds'

// 状态定义
export const loading = ref(false)
export const currentPage = ref(1)
export const total = ref(0)
export const pageSize = ref(10)
export const tableData = ref<RdsInstance[]>([])
// selectedPlatformId will be replaced by searchForm.platformId
export const detailVisible = ref(false)
export const currentInstance = ref<RdsInstance | null>(null)

// 搜索表单
export const searchForm = reactive({
  name: '',
  instanceId: '',
  platformId: null as number | null, // Added
  region: null as string | null,     // Added
})

// 日期格式化函数
export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 获取状态类型
export const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    '可用': 'success',
    '不可用': 'danger',
    '创建中': 'info',
    '已删除': 'info'
  }
  return types[status] || 'info'
}

// 加载数据
export const loadData = async () => {
  loading.value = true
  try {
    const params: any = { // Using 'any' temporarily for params, will match RdsListParams
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.name || undefined,
      instance_id: searchForm.instanceId || undefined,
      region: searchForm.region || undefined, // Added region for filtering
      // platform_id: searchForm.platformId || undefined, // API currently does not support platform_id for list
    }

    const res = await getRdsList(params)

    if (res.code === 0) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '加载数据失败')
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
export const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索
export const handleResetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    instanceId: '',
    platformId: null, // Clear platformId
    region: null,     // Clear region
  })
  currentPage.value = 1
  loadData()
}

// 处理同步
export const handleSync = async () => {
  if (!searchForm.platformId) { // Use searchForm.platformId
    ElMessage.warning('请先选择云平台')
    return
  }
  try {
    loading.value = true // Consider renaming to syncing or using a separate syncing ref
    const res = await syncRds({ id: searchForm.platformId }) // Use searchForm.platformId
    if (res.code === 0) {
      ElMessage.success(res.msg || '同步成功')
      loadData()
    } else {
      ElMessage.error(res.msg || '同步失败')
    }
  } catch (error) {
    console.error('同步失败:', error)
    ElMessage.error('同步失败')
  } finally {
    loading.value = false
  }
}

// 处理云平台选择
export const handlePlatformSelect = ({ platform, region }: { platform: PlatformRegionTreeItem; region: RegionNode | null }) => {
  if (region) {
    // 选中区域节点
    searchForm.platformId = platform.id; // Assuming platform context is needed even when region is selected
    searchForm.region = region.region_id; // Use region_id as per RdsListParams and typical API design
  } else if (platform) {
    // 选中平台节点 (no specific region)
    searchForm.platformId = platform.id;
    searchForm.region = null; // Clear any previous region selection
  } else {
    // No selection or cleared selection
    searchForm.platformId = null;
    searchForm.region = null;
  }
  currentPage.value = 1; // Reset to first page on filter change
  loadData();
}

// 处理详情
export const handleView = (row: RdsInstance) => {
  currentInstance.value = row
  detailVisible.value = true
}

// 处理分页大小变化
export const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadData()
}

// 处理页码变化
export const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}
