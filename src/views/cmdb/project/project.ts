import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 项目类型定义
export interface Project {
  id: number
  name: string
  principal: string
  note: string
  created_at: string
  updated_at: string
}

export default function useProject() {
  // 状态定义
  const tableData = ref<Project[]>([])
  const loading = ref(false)
  const searchForm = ref({
    name: '',
    note: ''
  })
  const pageSize = ref(10)
  const currentPage = ref(1)
  const total = ref(0)
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const dialogType = ref<'add' | 'edit'>('add')
  const selectedRows = ref<Project[]>([])
  const formData = ref<Partial<Project>>({
    name: '',
    principal: '',
    note: ''
  })

  // 表单校验规则
  const rules = {
    name: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    principal: [
      { required: true, message: '请输入项目负责人', trigger: 'blur' }
    ]
  }

  // 搜索
  const handleSearch = () => {
    currentPage.value = 1
    // TODO: 调用搜索接口
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.value = {
      name: '',
      note: ''
    }
    handleSearch()
  }

  // 新建项目
  const handleAdd = () => {
    dialogType.value = 'add'
    dialogTitle.value = '新建项目'
    formData.value = {
      name: '',
      principal: '',
      note: ''
    }
    dialogVisible.value = true
  }

  // 编辑项目
  const handleEdit = (row: Project) => {
    dialogType.value = 'edit'
    dialogTitle.value = '编辑项目'
    formData.value = { ...row }
    dialogVisible.value = true
  }

  // 删除项目
  const handleDelete = (row: Project) => {
    ElMessageBox.confirm(
      '确定要删除该项目吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // TODO: 调用删除接口
      ElMessage.success('删除成功')
    }).catch(() => {})
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的项目')
      return
    }
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个项目吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // TODO: 调用批量删除接口
      ElMessage.success('删除成功')
    }).catch(() => {})
  }

  // 提交表单
  const handleSubmit = () => {
    // TODO: 调用创建/更新接口
    dialogVisible.value = false
    ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
  }

  // 分页
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    // TODO: 重新加载数据
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    // TODO: 重新加载数据
  }

  return {
    tableData,
    loading,
    searchForm,
    pageSize,
    currentPage,
    total,
    dialogVisible,
    dialogTitle,
    formData,
    rules,
    selectedRows,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleBatchDelete,
    handleSubmit,
    handleCurrentChange,
    handleSizeChange
  }
}
