import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getLoadBalancerTree, syncLoadBalancer } from '@/api/cloudCmdb/cloud_load_balancer'

// 类型定义
export interface TreeNode {
  id: number
  label: string
  children: TreeNode[]
}

export interface SearchInfo {
  keyword: string
}

export default function useLoadBalancer() {
  // 状态定义
  const treeData = ref<TreeNode[]>([])
  const tableData = ref([])
  const loading = ref(false)
  const treeLoading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const currentProvider = ref('')
  const currentProviderId = ref(0)
  const searchInfo = ref<SearchInfo>({
    keyword: ''
  })

  // 获取树形数据
  const fetchTreeData = async () => {
    treeLoading.value = true
    try {
      const res = await getLoadBalancerTree()
      if (res.code === 0) {
        treeData.value = res.data.list.map(item => ({
          id: item.id,
          label: item.name,
          children: []
        }))
        if (treeData.value.length > 0) {
          handleTreeNodeClick(treeData.value[0])
        }
      } else {
        ElMessage.error(res.msg || '获取云厂商树失败')
      }
    } catch (error) {
      console.error('获取云厂商树失败:', error)
      ElMessage.error('获取云厂商树失败')
    } finally {
      treeLoading.value = false
    }
  }

  // 处理树节点点击
  const handleTreeNodeClick = (node: TreeNode) => {
    currentProvider.value = node.label
    currentProviderId.value = node.id
  }

  // 搜索相关方法
  const onSearch = () => {
    // TODO: 实现搜索逻辑
  }

  const onReset = () => {
    searchInfo.value.keyword = ''
  }

  // 同步相关方法
  const onSync = async () => {
    if (!currentProviderId.value) {
      ElMessage.warning('请先选择云厂商')
      return
    }

    try {
      loading.value = true
      const res = await syncLoadBalancer(currentProviderId.value)
      if (res.code === 0) {
        ElMessage.success(res.msg || '同步操作成功')
      } else {
        ElMessage.error(res.msg || '同步操作失败')
      }
    } catch (error) {
      console.error('同步操作失败:', error)
      ElMessage.error('同步操作失败')
    } finally {
      loading.value = false
    }
  }

  // 分页相关方法
  const handleSizeChange = (val: number) => {
    pageSize.value = val
  }

  const handleCurrentChange = (val: number) => {
    page.value = val
  }

  return {
    // 状态
    treeData,
    tableData,
    loading,
    treeLoading,
    total,
    page,
    pageSize,
    currentProvider,
    currentProviderId,
    searchInfo,
    // 方法
    fetchTreeData,
    handleTreeNodeClick,
    onSearch,
    onReset,
    onSync,
    handleSizeChange,
    handleCurrentChange
  }
}
