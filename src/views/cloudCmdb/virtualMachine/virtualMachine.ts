import { ref, watch } from 'vue'
import { virtualMachineList, syncMachine, type VirtualMachine } from '@/api/cloudCmdb/cloud_virtual_machine'
import type { PlatformRegionTreeItem, RegionNode } from '@/api/cloudCmdb/cloud_rds' // Assuming this type is still relevant for tree
import { ElMessage } from 'element-plus'

// Search form state, now including platform and region
export const searchForm = ref({
  name: '',
  instanceId: '',
  platformId: null as number | null,
  regionId: null as string | null,
})

export function useVirtualMachineManager() {
  // State
  const tableData = ref<VirtualMachine[]>([])
  const loading = ref(false)
  const syncing = ref(false)
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  // selectedPlatformId is now searchForm.platformId
  const dialogVisible = ref(false)
  const currentVM = ref<VirtualMachine | null>(null)

  // Methods
  const fetchData = async () => {
    loading.value = true
    try {
      // Note: API signature for virtualMachineList will need to be updated
      // in src/api/cloudCmdb/cloud_virtual_machine.ts to accept these new params.
      // The backend would also need to support filtering by these.
      const res = await virtualMachineList({
        page: page.value,
        pageSize: pageSize.value,
        name: searchForm.value.name,
        instance_id: searchForm.value.instanceId,
        platform_id: searchForm.value.platformId, // New parameter
        region_id: searchForm.value.regionId,     // New parameter
      })
      if (res.code === 0 && res.data) {
        tableData.value = res.data.list || []
        total.value = res.data.total || 0
      } else {
        ElMessage.error(res.msg || '获取虚拟机列表失败')
        tableData.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('获取虚拟机列表失败:', error)
      ElMessage.error('获取虚拟机列表失败')
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const handleSync = async () => {
    if (!searchForm.value.platformId) {
      ElMessage.warning('请先选择云平台')
      return
    }
    syncing.value = true
    try {
      const res = await syncMachine({ id: searchForm.value.platformId }) // Assuming API expects id for platformId
      if (res.code === 0) {
        ElMessage.success(res.msg || '同步成功, 数据后台处理中, 请稍后刷新')
        // Optionally trigger fetchData after a delay or user action, as sync is async
      } else {
        ElMessage.error(res.msg || '同步失败')
      }
    } catch (error) {
      console.error('同步失败:', error)
      ElMessage.error('同步失败')
    } finally {
      syncing.value = false
    }
  }

  const handlePlatformSelect = (payload: { platform: PlatformRegionTreeItem, region: RegionNode | null }) => {
    searchForm.value.platformId = payload.platform.id
    searchForm.value.regionId = payload.region ? payload.region.id : null // Assuming region node has an 'id' property
    page.value = 1 // Reset page when filter changes
    fetchData()
  }
  
  const handleSizeChange = (val: number) => {
    pageSize.value = val
    page.value = 1 // Typically reset to page 1 when page size changes
    fetchData()
  }

  const handlePageChange = (val: number) => {
    page.value = val
    fetchData()
  }

  const handleViewDetails = (row: VirtualMachine) => {
    currentVM.value = row
    dialogVisible.value = true
  }

  // Search and Reset Search (integrated from previous structure)
  const handleSearch = () => { // Renamed from onSearch for consistency
    page.value = 1
    fetchData()
  }

  const handleResetSearch = () => { // Renamed from onResetSearch
    searchForm.value.name = ''
    searchForm.value.instanceId = ''
    searchForm.value.platformId = null // Clear platform filter
    searchForm.value.regionId = null   // Clear region filter
    page.value = 1
    fetchData()
    // Note: This will clear the filter but won't visually deselect the tree node.
    // Deselecting the tree node would require emitting an event from here or other complex state management.
  }
  
  // Watchers for pagination (can be kept if direct page/pageSize manipulation is expected outside functions)
  // However, usually fetchData is called by page change handlers directly.
  // watch([page, pageSize], fetchData); // This might cause double fetch if handleSizeChange/handlePageChange also call fetchData.
                                     // It's often better to call fetchData explicitly in handlers.

  return {
    searchForm, // Exporting searchForm itself
    tableData,
    loading,
    syncing,
    page,
    pageSize,
    total,
    dialogVisible,
    currentVM,
    fetchData, // Export fetchData for initial load if needed from vue component
    handleSync,
    handlePlatformSelect,
    handleSizeChange,
    handlePageChange,
    handleViewDetails,
    handleSearch,
    handleResetSearch,
  }
}
