<template>
  <div class="virtual-machine-container">
    <div class="platform-tree">
      <CloudPlatformTree @select="handlePlatformSelect" />
    </div>
    <div class="virtual-machine-list">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>云服务器管理</span>
            <div class="header-buttons">
              <el-button 
                type="primary" 
                :loading="syncing" 
                :disabled="!selectedPlatformId"
                @click="handleSync"
              >
                <el-icon><Refresh /></el-icon>同步数据
              </el-button>
            </div>
          </div>
        </template>

        <!-- 搜索栏 -->
        <el-form :inline="true" :model="searchForm" class="search-form" style="margin-bottom: 20px;">
          <el-form-item label="实例名称">
            <el-input v-model="searchForm.name" placeholder="请输入实例名称" clearable />
          </el-form-item>
          <el-form-item label="实例ID">
            <el-input v-model="searchForm.instanceId" placeholder="请输入实例ID" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">
              搜索
            </el-button>
            <el-button @click="onResetSearch">
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <div class="table-container">
          <el-table :data="tableData" v-loading="loading" height="100%" style="width: 100%">
            <el-table-column prop="instance_id" label="实例ID/名称" min-width="180">
              <template #default="scope">
                <div>
                  <div>{{ scope.row.instance_id }}</div>
                  <div class="vm-name">{{ scope.row.name }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="100" />
            <el-table-column prop="os" label="操作系统" min-width="120" />
            <el-table-column prop="region_name" label="可用区" min-width="120" />
            <el-table-column label="配置" min-width="120">
              <template #default="scope">
                <span>{{ scope.row.cpu }}核/{{ (scope.row.memory / 1024).toFixed(2) }}GB</span>
              </template>
            </el-table-column>
            <el-table-column label="IP地址" min-width="160">
              <template #default="scope">
                <div>内网：{{ scope.row.private_addr }}</div>
                <div>公网：{{ scope.row.public_addr }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  @click="handleViewDetails(scope.row)"
                >
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="虚拟机详情"
      width="60%"
      destroy-on-close
    >
      <template v-if="currentVM">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="实例ID">{{ currentVM.instance_id }}</el-descriptions-item>
          <el-descriptions-item label="名称">{{ currentVM.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentVM.status }}</el-descriptions-item>
          <el-descriptions-item label="操作系统">{{ currentVM.os }}</el-descriptions-item>
          <el-descriptions-item label="可用区">{{ currentVM.region_name }}</el-descriptions-item>
          <el-descriptions-item label="配置">
            {{ currentVM.cpu }}核/{{ (currentVM.memory / 1024).toFixed(2) }}GB
          </el-descriptions-item>
          <el-descriptions-item label="内网IP">{{ currentVM.private_addr }}</el-descriptions-item>
          <el-descriptions-item label="公网IP">{{ currentVM.public_addr }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
<template>
  <div class="virtual-machine-container">
    <div class="platform-tree">
      <CloudPlatformTree @select="handlePlatformSelect" />
    </div>
    <div class="virtual-machine-list">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>云服务器管理</span>
            <div class="header-buttons">
              <el-button 
                type="primary" 
                :loading="syncing" 
                :disabled="!searchForm.platformId" <!-- Updated to use searchForm.platformId -->
                @click="handleSync"
              >
                <el-icon><Refresh /></el-icon>同步数据
              </el-button>
            </div>
          </div>
        </template>

        <!-- 搜索栏 -->
        <el-form :inline="true" :model="searchForm" class="search-form" style="margin-bottom: 20px;">
          <el-form-item label="实例名称">
            <el-input v-model="searchForm.name" placeholder="请输入实例名称" clearable />
          </el-form-item>
          <el-form-item label="实例ID">
            <el-input v-model="searchForm.instanceId" placeholder="请输入实例ID" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"> <!-- Mapped to handleSearch from composable -->
              搜索
            </el-button>
            <el-button @click="handleResetSearch"> <!-- Mapped to handleResetSearch from composable -->
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <div class="table-container">
          <el-table :data="tableData" v-loading="loading" height="100%" style="width: 100%">
            <el-table-column prop="instance_id" label="实例ID/名称" min-width="180">
              <template #default="scope">
                <div>
                  <div>{{ scope.row.instance_id }}</div>
                  <div class="vm-name">{{ scope.row.name }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="100" />
            <el-table-column prop="os" label="操作系统" min-width="120" />
            <el-table-column prop="region_name" label="可用区" min-width="120" />
            <el-table-column label="配置" min-width="120">
              <template #default="scope">
                <span>{{ scope.row.cpu }}核/{{ (scope.row.memory / 1024).toFixed(2) }}GB</span>
              </template>
            </el-table-column>
            <el-table-column label="IP地址" min-width="160">
              <template #default="scope">
                <div>内网：{{ scope.row.private_addr }}</div>
                <div>公网：{{ scope.row.public_addr }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  @click="handleViewDetails(scope.row)"
                >
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="虚拟机详情"
      width="60%"
      destroy-on-close
    >
      <template v-if="currentVM">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="实例ID">{{ currentVM.instance_id }}</el-descriptions-item>
          <el-descriptions-item label="名称">{{ currentVM.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentVM.status }}</el-descriptions-item>
          <el-descriptions-item label="操作系统">{{ currentVM.os }}</el-descriptions-item>
          <el-descriptions-item label="可用区">{{ currentVM.region_name }}</el-descriptions-item>
          <el-descriptions-item label="配置">
            {{ currentVM.cpu }}核/{{ (currentVM.memory / 1024).toFixed(2) }}GB
          </el-descriptions-item>
          <el-descriptions-item label="内网IP">{{ currentVM.private_addr }}</el-descriptions-item>
          <el-descriptions-item label="公网IP">{{ currentVM.public_addr }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// Removed local state and direct API imports
import CloudPlatformTree from '@/views/cloudCmdb/rds/components/CloudPlatformTree.vue'
// type { PlatformRegionTreeItem, RegionNode } // Keep if needed by template, but handlePlatformSelect is now in composable
// import { ElMessage } // ElMessage is now handled within the composable
import { Refresh, View } from '@element-plus/icons-vue' // Icons are still needed
import { useVirtualMachineManager } from './virtualMachine' // Import the composable

const {
  searchForm, // Now from composable
  tableData,
  loading,
  syncing,
  page,
  pageSize,
  total,
  dialogVisible,
  currentVM,
  fetchData,
  handleSync,
  handlePlatformSelect,
  handleSizeChange,
  handlePageChange,
  handleViewDetails,
  handleSearch,       // Mapped from onSearch
  handleResetSearch,  // Mapped from onResetSearch
} = useVirtualMachineManager()

onMounted(fetchData)
// watch([page, pageSize], fetchData) // Removed, handled by change handlers in composable
</script>

<style scoped>
@import './virtualMachine.css';
</style>
