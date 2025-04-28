<template>
  <div class="operation-record-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">操作记录</span>
            <span class="header-subtitle">查看系统操作日志</span>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="operationState.searchForm" inline class="search-form">
        <el-form-item label="请求方法">
          <el-select v-model="operationState.searchForm.method" placeholder="请选择请求方法" clearable style="width: 220px">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求路径">
          <el-input v-model="operationState.searchForm.path" placeholder="请输入请求路径" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="状态码">
          <el-input v-model="operationState.searchForm.status" placeholder="请输入状态码" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="danger" :disabled="!operationState.selectedRows.length" @click="handleBatchDelete">
          批量删除
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="operationState.loading"
        :data="operationState.tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="operator_name" label="操作人" width="120" />
        <el-table-column prop="created_at" label="操作时间" width="180" />
        <el-table-column prop="status" label="状态码" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="请求IP" width="150" />
        <el-table-column prop="method" label="请求方法" width="100">
          <template #default="{ row }">
            <el-tag :type="getMethodType(row.method)">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="请求路径" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="operationState.currentPage"
          v-model:page-size="operationState.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="operationState.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="operationState.detailDialogVisible"
      title="操作详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作人">{{ operationState.currentDetail?.operator_name }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ operationState.currentDetail?.created_at }}</el-descriptions-item>
        <el-descriptions-item label="状态码">{{ operationState.currentDetail?.status }}</el-descriptions-item>
        <el-descriptions-item label="请求IP">{{ operationState.currentDetail?.ip }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ operationState.currentDetail?.method }}</el-descriptions-item>
        <el-descriptions-item label="请求路径">{{ operationState.currentDetail?.path }}</el-descriptions-item>
        <el-descriptions-item label="请求体" :span="2">
          <pre>{{ operationState.currentDetail?.body }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应体" :span="2">
          <pre>{{ operationState.currentDetail?.resp }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          <pre>{{ operationState.currentDetail?.error_message }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  operationState,
  fetchData,
  handleSearch,
  resetSearch,
  handleSelectionChange,
  handleDetail,
  handleDelete,
  handleBatchDelete,
  handleSizeChange,
  handleCurrentChange,
  getStatusType,
  getMethodType
} from './operationRecord'

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style src="./operationRecord.css" scoped></style>
