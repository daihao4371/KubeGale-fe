<template>
  <div class="loadbalancer-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>负载均衡管理</span>
          <div class="header-buttons">
            <el-button type="primary" :icon="Plus">添加负载均衡</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-form">
        <el-input
          v-model="searchName"
          placeholder="请输入负载均衡名称搜索"
          class="search-input"
          :prefix-icon="Search"
          clearable
          style="width: 300px; margin-right: 10px;"
        />
        <el-button type="primary" :icon="Search">搜索</el-button>
        <el-button :icon="RefreshRight">重置</el-button>
      </div>

      <!-- 表格内容 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="负载均衡名称" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
              {{ row.status === 'running' ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vip" label="VIP" width="150" />
        <el-table-column prop="region" label="区域" width="120" />
        <el-table-column prop="provider" label="云厂商" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button :icon="Edit" size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button :icon="Delete" size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button :icon="Setting" size="small" link type="info" @click="handleConfig(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Search, RefreshRight, Edit, Delete, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'LoadBalancerManagement'
})

interface LoadBalancer {
  name: string
  type: string
  status: string
  vip: string
  region: string
  provider: string
  created_at: string
}

const searchName = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 模拟数据
const tableData = ref<LoadBalancer[]>([
  {
    name: 'lb-test-001',
    type: 'SLB',
    status: 'running',
    vip: '192.168.1.100',
    region: '华东1',
    provider: '阿里云',
    created_at: '2024-03-20 10:00:00'
  },
  {
    name: 'lb-test-002',
    type: 'CLB',
    status: 'running',
    vip: '192.168.1.101',
    region: '华南1',
    provider: '腾讯云',
    created_at: '2024-03-20 10:00:00'
  }
])

// 处理编辑
const handleEdit = (row: LoadBalancer) => {
  console.log('编辑负载均衡:', row)
  ElMessage.info('编辑功能开发中...')
}

// 处理删除
const handleDelete = (row: LoadBalancer) => {
  ElMessageBox.confirm(
    `确定要删除负载均衡 "${row.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    console.log('删除负载均衡:', row)
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理配置
const handleConfig = (row: LoadBalancer) => {
  console.log('配置负载均衡:', row)
  ElMessage.info('配置功能开发中...')
}
</script>

<style scoped>
.loadbalancer-container {
  padding: 20px;
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