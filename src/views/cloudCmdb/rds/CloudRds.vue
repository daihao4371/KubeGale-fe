<template>
  <div class="rds-manager-container">
    <div class="rds-layout">
      <!-- 左侧云平台树 -->
      <div class="platform-tree">
        <CloudPlatformTree @select="handlePlatformSelect" />
      </div>
      
      <!-- 右侧内容区 -->
      <div class="content-area">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>云数据库管理</span>
              <div class="header-buttons">
                <el-button type="success" @click="handleSync">
                  <el-icon><Refresh /></el-icon>同步数据
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- 搜索栏 -->
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="实例名称">
              <el-input v-model="searchForm.name" placeholder="请输入实例名称" clearable />
            </el-form-item>
            <el-form-item label="实例ID">
              <el-input v-model="searchForm.instance_id" placeholder="请输入实例ID" clearable />
            </el-form-item>
            <el-form-item label="区域">
              <RegionTreeSelect
                v-model="searchForm.region"
                placeholder="请选择区域"
                ref="regionSelectRef"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px">
                <el-option label="运行中" value="running" />
                <el-option label="已停止" value="stopped" />
                <el-option label="创建中" value="creating" />
                <el-option label="已删除" value="deleted" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button @click="handleResetSearch">
                <el-icon><RefreshRight /></el-icon>重置
              </el-button>
            </el-form-item>
          </el-form>
          
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="loading"
            border
          >
            <el-table-column prop="name" label="实例名称" min-width="150" />
            <el-table-column prop="instance_id" label="实例ID" min-width="150" />
            <el-table-column prop="private_addr" label="私有地址" min-width="200" />
            <el-table-column prop="public_addr" label="公网地址" min-width="200">
              <template #default="{ row }">
                {{ row.public_addr || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="region_name" label="区域" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="creation_time" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.creation_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="expired_time" label="过期时间" width="180">
              <template #default="{ row }">
                {{ row.expired_time || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleView(row)">
                  <el-icon><View /></el-icon>详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="实例详情"
      width="800px"
    >
      <el-descriptions
        v-if="currentInstance"
        :column="2"
        border
      >
        <el-descriptions-item label="实例名称" :span="2">
          {{ currentInstance.name }}
        </el-descriptions-item>
        <el-descriptions-item label="实例ID" :span="2">
          {{ currentInstance.instance_id }}
        </el-descriptions-item>
        <el-descriptions-item label="私有地址" :span="2">
          {{ currentInstance.private_addr }}
        </el-descriptions-item>
        <el-descriptions-item label="公网地址" :span="2">
          {{ currentInstance.public_addr || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="区域">
          {{ currentInstance.region_name }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentInstance.status)">
            {{ currentInstance.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(currentInstance.creation_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="过期时间" :span="2">
          {{ currentInstance.expired_time || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="云平台" :span="2">
          {{ currentInstance.cloud_platform?.name || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  View,
  Search, 
  Refresh, 
  RefreshRight
} from '@element-plus/icons-vue'
import { 
  getRdsList,
  syncRds,
} from '@/api/cloudCmdb/cloud_rds'
import type { RdsInstance } from '@/types/cloudCmdb'
import CloudPlatformTree from './components/CloudPlatformTree.vue'
import RegionTreeSelect from './components/RegionTreeSelect.vue'
import type { PlatformRegionTreeItem, RegionNode } from '@/api/cloudCmdb/cloud_rds'

defineOptions({
  name: 'RdsManagerView'
})

// 状态定义
const loading = ref(false)
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref<RdsInstance[]>([])
const regionSelectRef = ref()
const selectedPlatformId = ref<number | null>(null)
const detailVisible = ref(false)
const currentInstance = ref<RdsInstance | null>(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  instance_id: '',
  region: '',
  status: '',
  cloud_platform_id: 0
})

// 日期格式化函数
const formatDateTime = (dateStr: string) => {
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
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    '可用': 'success',
    '不可用': 'danger',
    '创建中': 'info',
    '已删除': 'info'
  }
  return types[status] || 'info'
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRdsList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '加载数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    instance_id: '',
    region: '',
    status: '',
    cloud_platform_id: 0
  })
  handleSearch()
}

// 处理同步
const handleSync = async () => {
  if (!selectedPlatformId.value) {
    ElMessage.warning('请先选择云平台')
    return
  }
  try {
    loading.value = true
    const res = await syncRds({ id: selectedPlatformId.value })
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
const handlePlatformSelect = ({ platform, region }: { platform: PlatformRegionTreeItem; region: RegionNode | null }) => {
  if (platform && !region) {
    // 选中平台节点
    selectedPlatformId.value = platform.id
    searchForm.cloud_platform_id = platform.id
    searchForm.region = ''
    loadData()
  } else if (platform && region) {
    // 选中区域节点
    selectedPlatformId.value = null
    searchForm.cloud_platform_id = platform.id
    searchForm.region = region.region_id
    loadData()
  }
}

// 处理详情
const handleView = (row: RdsInstance) => {
  currentInstance.value = row
  detailVisible.value = true
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.rds-manager-container {
  height: 100%;
  padding: 20px;
}

.rds-layout {
  display: flex;
  height: 100%;
  gap: 20px;
}

.platform-tree {
  width: 240px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-area {
  flex: 1;
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
