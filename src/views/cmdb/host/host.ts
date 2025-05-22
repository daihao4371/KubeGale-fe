import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { Host } from './types'
import {
  getHostList,
  createHost,
  updateHost,
  deleteHost,
  batchDeleteHosts,
  getHostDetail
} from '@/api/cmdb/host'

export default function useHost() {
  // 状态管理
  const loading = ref(false)
  const tableData = ref<Host[]>([])
  const selectedHosts = ref<Host[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const detailVisible = ref(false)
  const detailData = ref<Host>({} as Host)
  const formRef = ref<FormInstance>()

  // 搜索表单
  const searchForm = reactive({
    name: '',
    serverHost: '',
    status: ''
  })

  // 表单数据
  const formData = reactive({
    id: 0,
    name: '',
    serverHost: '',
    port: 22,
    username: 'root',
    password: '',
    privateKey: '',
    authType: 'password',
    project: undefined as number | undefined,
    note: '',
    os: ''
  })

  // 表单验证规则
  const formRules = {
    name: [{ required: true, message: '请输入主机名称', trigger: 'blur' }],
    serverHost: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
    port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
    project: [{ required: true, message: '请选择所属项目', trigger: 'change' }]
  }

  // 项目选项（示例数据）
  const projectOptions = ref([
    { id: 1, name: '项目A' },
    { id: 2, name: '项目B' }
  ])

  // 获取主机列表
  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getHostList({
        page: currentPage.value,
        pageSize: pageSize.value,
        ...searchForm
      })
      if (res.code === 0) {
        tableData.value = res.data.list
        total.value = res.data.total
      }
    } catch (error) {
      console.error('获取主机列表失败:', error)
      ElMessage.error('获取主机列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    currentPage.value = 1
    fetchList()
  }

  // 重置
  const handleReset = () => {
    Object.keys(searchForm).forEach(key => {
      searchForm[key as keyof typeof searchForm] = ''
    })
    handleSearch()
  }

  // 表格选择
  const handleSelectionChange = (selection: Host[]) => {
    selectedHosts.value = selection
  }

  // 新建主机
  const handleAdd = () => {
    dialogType.value = 'add'
    formData.id = 0
    formData.name = ''
    formData.serverHost = ''
    formData.port = 22
    formData.username = 'root'
    formData.password = ''
    formData.privateKey = ''
    formData.authType = 'password'
    formData.project = undefined
    formData.note = ''
    formData.os = ''
    dialogVisible.value = true
  }

  // 编辑主机
  const handleEdit = (row: Host) => {
    dialogType.value = 'edit'
    Object.assign(formData, row)
    dialogVisible.value = true
  }

  // 查看详情
  const handleDetail = async (row: Host) => {
    try {
      const res = await getHostDetail(row.id)
      if (res.code === 0) {
        detailData.value = res.data
        detailVisible.value = true
      }
    } catch (error) {
      console.error('获取主机详情失败:', error)
      ElMessage.error('获取主机详情失败')
    }
  }

  // SSH认证
  const handleSSH = () => {
    // TODO: 实现SSH认证功能
    ElMessage.info('SSH认证功能开发中')
  }

  // 删除主机
  const handleDelete = (row: Host) => {
    ElMessageBox.confirm('确认删除该主机吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      try {
        const res = await deleteHost({ id: row.id })
        if (res.code === 0) {
          ElMessage.success('删除成功')
          fetchList()
        }
      } catch (error) {
        console.error('删除主机失败:', error)
        ElMessage.error('删除主机失败')
      }
    })
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedHosts.value.length === 0) {
      ElMessage.warning('请选择要删除的主机')
      return
    }
    ElMessageBox.confirm(`确认删除选中的 ${selectedHosts.value.length} 台主机吗？`, '提示', {
      type: 'warning'
    }).then(async () => {
      try {
        const res = await batchDeleteHosts({
          ids: selectedHosts.value.map(item => item.id)
        })
        if (res.code === 0) {
          ElMessage.success('批量删除成功')
          fetchList()
        }
      } catch (error) {
        console.error('批量删除主机失败:', error)
        ElMessage.error('批量删除主机失败')
      }
    })
  }

  // 导入成功
  const handleImportSuccess = () => {
    ElMessage.success('导入成功')
    fetchList()
  }

  // 导入失败
  const handleImportError = () => {
    ElMessage.error('导入失败')
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const api = dialogType.value === 'add' ? createHost : updateHost
          const submitData = {
            ...formData,
            project: formData.project || 0
          }
          const res = await api(submitData)
          if (res.code === 0) {
            ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
            dialogVisible.value = false
            fetchList()
          }
        } catch (error) {
          console.error(dialogType.value === 'add' ? '创建主机失败:' : '更新主机失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '创建主机失败' : '更新主机失败')
        }
      }
    })
  }

  // 分页
  const handleSizeChange = (val: number) => {
    pageSize.value = val
    fetchList()
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchList()
  }

  // 状态相关
  const getStatusType = (status?: string) => {
    const map: Record<string, string> = {
      online: 'success',
      offline: 'danger',
      maintenance: 'warning'
    }
    return map[status || ''] || 'info'
  }

  const getStatusText = (status?: string) => {
    const map: Record<string, string> = {
      online: '在线',
      offline: '离线',
      maintenance: '维护中'
    }
    return map[status || ''] || '未知'
  }

  // 初始化
  onMounted(() => {
    fetchList()
  })

  return {
    loading,
    tableData,
    selectedHosts,
    currentPage,
    pageSize,
    total,
    dialogVisible,
    dialogType,
    detailVisible,
    detailData,
    formRef,
    searchForm,
    formData,
    formRules,
    projectOptions,
    handleSearch,
    handleReset,
    handleSelectionChange,
    handleAdd,
    handleEdit,
    handleDetail,
    handleSSH,
    handleDelete,
    handleBatchDelete,
    handleImportSuccess,
    handleImportError,
    handleSubmit,
    handleSizeChange,
    handleCurrentChange,
    getStatusType,
    getStatusText
  }
}
