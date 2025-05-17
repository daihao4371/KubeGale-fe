import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CloudProvider, CloudProviderState, CloudProviderForm } from '../../../types/cloudCmdb'
import { defaultCloudProviderForm } from '../../../types/cloudCmdb'

export default function useProviderManager() {
  const state = reactive<CloudProviderState>({
    loading: false,
    providerList: [],
    total: 0,
    pageSize: 10,
    currentPage: 1,
    dialogVisible: false,
    dialogTitle: '',
    dialogType: 'create',
    formLoading: false,
    searchForm: {
      name: '',
      type: '',
      status: ''
    },
    filteredProviderList: []
  })

  const form = ref<CloudProviderForm>({ ...defaultCloudProviderForm })

  // 获取状态类型对应的标签样式
  const getStatusType = (status: string) => {
    const types: Record<string, string> = {
      active: 'success',
      inactive: 'danger'
    }
    return types[status] || 'info'
  }

  // 加载云厂商列表
  const loadProviderList = async () => {
    state.loading = true
    try {
      state.total = state.providerList.length
      state.filteredProviderList = state.providerList
    } catch (error) {
      console.error('获取云厂商列表失败:', error)
      ElMessage.error('获取云厂商列表失败')
    } finally {
      state.loading = false
    }
  }

  // 处理页码变化
  const handleCurrentChange = (page: number) => {
    state.currentPage = page
  }

  // 处理每页条数变化
  const handleSizeChange = (size: number) => {
    state.pageSize = size
    state.currentPage = 1
  }

  // 打开创建对话框
  const handleAddProvider = () => {
    state.dialogType = 'create'
    state.dialogTitle = '添加云厂商'
    state.dialogVisible = true
    form.value = { ...defaultCloudProviderForm }
  }

  // 打开编辑对话框
  const handleEdit = (row: CloudProvider) => {
    state.dialogType = 'edit'
    state.dialogTitle = '编辑云厂商'
    state.dialogVisible = true
    form.value = {
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      access_key_id: row.access_key_id,
      access_key_secret: row.access_key_secret
    }
  }

  // 处理删除
  const handleDelete = async (row: CloudProvider) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除云厂商 "${row.name}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 模拟删除成功
      ElMessage.success('删除成功')
      loadProviderList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除云厂商失败:', error)
        ElMessage.error('删除云厂商失败')
      }
    }
  }

  // 处理配置
  const handleConfig = (row: CloudProvider) => {
    console.log('配置云厂商:', row)
    ElMessage.info('配置功能开发中...')
  }

  // 提交表单
  const handleSubmit = async () => {
    state.formLoading = true
    try {
      if (state.dialogType === 'create') {
        // TODO: 替换为实际的API调用
        // const res = await createProvider(form.value)
        // if (res.data?.code === 0) {
        //   ElMessage.success('创建成功')
        //   state.dialogVisible = false
        //   loadProviderList()
        // } else {
        //   ElMessage.error(res.data?.msg || '创建失败')
        // }

        // 模拟创建成功
        ElMessage.success('创建成功')
        state.dialogVisible = false
        loadProviderList()
      } else {
        if (!form.value.id) {
          ElMessage.error('更新失败：缺少ID')
          return
        }
        // TODO: 替换为实际的API调用
        // const res = await updateProvider(form.value)
        // if (res.data?.code === 0) {
        //   ElMessage.success('更新成功')
        //   state.dialogVisible = false
        //   loadProviderList()
        // } else {
        //   ElMessage.error(res.data?.msg || '更新失败')
        // }

        // 模拟更新成功
        ElMessage.success('更新成功')
        state.dialogVisible = false
        loadProviderList()
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    } finally {
      state.formLoading = false
    }
  }

  // 搜索方法
  const handleSearch = () => {
    let filtered = state.providerList
    if (state.searchForm.name) {
      filtered = filtered.filter(provider => provider.name.includes(state.searchForm.name))
    }
    if (state.searchForm.type) {
      filtered = filtered.filter(provider => provider.type === state.searchForm.type)
    }
    if (state.searchForm.status) {
      filtered = filtered.filter(provider => provider.status === state.searchForm.status)
    }
    state.filteredProviderList = filtered
    state.total = filtered.length
    state.currentPage = 1
  }

  // 重置搜索
  const handleResetSearch = () => {
    state.searchForm = { name: '', type: '', status: '' }
    state.filteredProviderList = state.providerList
    state.total = state.providerList.length
    state.currentPage = 1
  }

  return {
    state,
    form,
    getStatusType,
    loadProviderList,
    handleCurrentChange,
    handleSizeChange,
    handleAddProvider,
    handleEdit,
    handleDelete,
    handleConfig,
    handleSubmit,
    handleSearch,
    handleResetSearch
  }
} 