<template>
  <div class="loadbalancer-layout">
    <!-- 左侧树形目录 -->
    <div class="sidebar">
      <el-card>
        <div class="sidebar-title">资源分布</div>
        <el-tree
          :data="treeData"
          node-key="id"
          :default-expand-all="true"
          :highlight-current="true"
          @node-click="handleTreeNodeClick"
          :props="{ label: 'label' }"
          v-loading="treeLoading"
          class="el-tree"
        />
      </el-card>
    </div>
    <!-- 右侧表格内容 -->
    <div class="main-content">
      <el-card>
        <!-- 搜索栏 -->
        <el-form :inline="true" :model="searchInfo" class="search-form">
          <el-form-item label="识别搜索">
            <el-input v-model="searchInfo.keyword" placeholder="请输入搜索关键词" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
            <el-button type="primary" @click="onSync">同步</el-button>
          </el-form-item>
        </el-form>
        <!-- 实例表格 -->
        <el-table :data="tableData" v-loading="loading" class="table-container">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="实例ID / 名称" min-width="180" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="region" label="可用区" width="120" />
          <el-table-column prop="ip" label="IP地址" width="140" />
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button type="primary" link size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination-container"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import useLoadBalancer from './loadbalancer'
import './loadbalancer.css'

const {
  treeData,
  tableData,
  loading,
  treeLoading,
  total,
  page,
  pageSize,
  searchInfo,
  fetchTreeData,
  handleTreeNodeClick,
  onSearch,
  onReset,
  onSync,
  handleSizeChange,
  handleCurrentChange
} = useLoadBalancer()

// 初始化
onMounted(() => {
  fetchTreeData()
})
</script>

<style scoped>
.loadbalancer-layout {
  display: flex;
  height: 100%;
  gap: 20px;
  padding: 20px;
}

.sidebar {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: var(--el-box-shadow-light);
}

.el-tree {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

:deep(.el-tree-node__content) {
  height: 40px;
  border-radius: 4px;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-8);
}

.main-content {
  flex: 1;
  min-width: 0;
}

.search-form {
  margin-bottom: 16px;
}
</style> 