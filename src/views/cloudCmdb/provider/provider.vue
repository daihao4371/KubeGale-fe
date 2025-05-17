<template>
  <div class="provider-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>云厂商管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="openDialog">
              <el-icon><Plus /></el-icon>添加云厂商
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="厂商名称">
          <el-input v-model="searchInfo.name" placeholder="请输入厂商名称" clearable />
        </el-form-item>
        <el-form-item label="厂商类型">
          <el-select v-model="searchInfo.type" placeholder="请选择厂商类型" clearable style="width: 160px">
            <el-option label="阿里云" value="aliyun" />
            <el-option label="腾讯云" value="tencent" />
            <el-option label="华为云" value="huawei" />
            <el-option label="AWS" value="aws" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="onReset">
            <el-icon><RefreshRight /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="厂商名称" min-width="120" />
        <el-table-column prop="platform" label="厂商类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getPlatformLabel(row.platform) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleUpdate(row)">
              <el-icon><Edit /></el-icon>变更
            </el-button>
            <el-button type="info" link @click="handleUpdateRegion(row)">
              <el-icon><Setting /></el-icon>Region同步
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑云厂商对话框 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="title"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="厂商名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入厂商名称" />
        </el-form-item>
        <el-form-item label="厂商类型" prop="platform">
          <el-select v-model="form.platform" placeholder="请选择厂商类型" style="width: 100%">
            <el-option label="阿里云" value="aliyun" />
            <el-option label="腾讯云" value="tencent" />
            <el-option label="华为云" value="huawei" />
            <el-option label="AWS" value="aws" />
          </el-select>
        </el-form-item>
        <el-form-item label="AccessKey ID" prop="access_key_id">
          <el-input
            v-model="form.access_key_id"
            placeholder="请输入AccessKey ID"
          />
        </el-form-item>
        <el-form-item label="AccessKey Secret" prop="access_key_secret">
          <el-input
            v-model="form.access_key_secret"
            type="password"
            placeholder="请输入AccessKey Secret"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  RefreshRight, 
  Setting
} from '@element-plus/icons-vue'
import { 
  cloudplatformlist, 
  cloudplatformById, 
  cloudplatformCreate, 
  cloudplatformUpdate, 
  cloudplatformDelete
} from '@/api/cloudCmdb/cloud_platform'
import { syncRegion } from '@/api/cloudCmdb/cloud_region'
import type { 
  CloudProvider, 
  CloudProviderForm
} from '@/types/cloudCmdb'

defineOptions({
  name: 'ProviderManagerView'
})

// 状态定义
const loading = ref(false)
const formLoading = ref(false)
const formRef = ref<FormInstance>()
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref<CloudProvider[]>([])
const title = ref('')
const searchInfo = ref({
  name: '',
  type: ''
})
const dialogFormVisible = ref(false)
const type = ref('')
const form = ref<CloudProviderForm>({
  name: '',
  platform: '',
  access_key_id: '',
  access_key_secret: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入厂商名称', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择厂商类型', trigger: 'change' }
  ],
  access_key_id: [
    { required: true, message: '请输入AccessKey ID', trigger: 'blur' }
  ],
  access_key_secret: [
    { required: true, message: '请输入AccessKey Secret', trigger: 'blur' }
  ]
}

// 获取平台标签
const getPlatformLabel = (platform: string) => {
  const platformMap: Record<string, string> = {
    aliyun: '阿里云',
    tencent: '腾讯云',
    huawei: '华为云',
    aws: 'AWS'
  }
  return platformMap[platform] || platform
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    const response = await cloudplatformlist({ 
      page: page.value, 
      pageSize: pageSize.value, 
      name: searchInfo.value.name,
      type: searchInfo.value.type
    })
    if (response.code === 0 && response.data) {
      const { list, total: t, page: p, pageSize: ps } = response.data
      tableData.value = list || []
      total.value = t || 0
      page.value = p || 1
      pageSize.value = ps || 10
    } else {
      ElMessage.error(response.msg || '获取云厂商列表失败')
    }
  } catch (error) {
    console.error('获取云厂商列表失败:', error)
    ElMessage.error('获取云厂商列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索相关方法
const onReset = () => {
  searchInfo.value = {
    name: '',
    type: ''
  }
  page.value = 1
  pageSize.value = 10
  getTableData()
}

const onSubmit = () => {
  page.value = 1
  pageSize.value = 10
  getTableData()
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  getTableData()
}

// 编辑相关方法
const handleUpdate = async (row: CloudProvider) => {
  try {
    const response = await cloudplatformById({ id: row.id })
    if (response.code === 0 && response.data) {
      const { cloud_platform } = response.data
      type.value = 'update'
      title.value = '编辑云厂商'
      form.value = {
        id: cloud_platform.id,
        name: cloud_platform.name,
        platform: cloud_platform.platform,
        access_key_id: cloud_platform.access_key_id,
        access_key_secret: cloud_platform.access_key_secret
      }
      dialogFormVisible.value = true
    } else {
      ElMessage.error(response.msg || '获取云厂商详情失败')
    }
  } catch (error) {
    console.error('获取云厂商详情失败:', error)
    ElMessage.error('获取云厂商详情失败')
  }
}

// 同步区域
const handleUpdateRegion = async (row: CloudProvider) => {
  try {
    const response = await syncRegion({ id: row.id })
    if (response.code === 0) {
      ElMessage.success('同步区域成功')
      getTableData()
    } else {
      ElMessage.error(response.msg || '同步区域失败')
    }
  } catch (error) {
    console.error('同步区域失败:', error)
    ElMessage.error('同步区域失败')
  }
}

// 删除相关方法
const handleDelete = async (row: CloudProvider) => {
  try {
    const response = await cloudplatformDelete({ id: row.id })
    if (response.code === 0) {
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--
      }
      getTableData()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除云厂商失败:', error)
    ElMessage.error('删除云厂商失败')
  }
}

// 对话框相关方法
const openDialog = () => {
  type.value = 'create'
  title.value = '创建云厂商'
  form.value = {
    name: '',
    platform: '',
    access_key_id: '',
    access_key_secret: ''
  }
  dialogFormVisible.value = true
}

const closeDialog: () => void = () => {
  dialogFormVisible.value = false
  form.value = {
    name: '',
    platform: '',
    access_key_id: '',
    access_key_secret: ''
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      formLoading.value = true
      try {
        let response
        if (type.value === 'create') {
          const submitData = {
            name: form.value.name,
            platform: form.value.platform,
            access_key_id: form.value.access_key_id,
            access_key_secret: form.value.access_key_secret
          }
          response = await cloudplatformCreate(submitData)
        } else {
          if (!form.value.id) {
            ElMessage.error('缺少云厂商ID')
            return
          }
          const submitData = {
            id: form.value.id,
            name: form.value.name,
            platform: form.value.platform,
            access_key_id: form.value.access_key_id,
            access_key_secret: form.value.access_key_secret
          }
          response = await cloudplatformUpdate(submitData)
        }

        if (response.code === 0) {
          ElMessage.success(response.msg || (type.value === 'create' ? '创建成功' : '更新成功'))
          dialogFormVisible.value = false
          getTableData()
        } else {
          ElMessage.error(response.msg || '操作失败')
        }
      } catch (error) {
        console.error('提交表单失败:', error)
        ElMessage.error('提交表单失败')
      } finally {
        formLoading.value = false
      }
    }
  })
}

// 初始化
onMounted(() => {
  getTableData()
})
</script>

<style src="./provider.css" scoped></style>
