<template>
  <div class="notification-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>通知管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAddDingTalk">
              <el-icon><Plus /></el-icon>添加钉钉通知
            </el-button>
            <el-button type="success" @click="handleAddFeishu">
              <el-icon><Bell /></el-icon>添加飞书通知
            </el-button>
          </div>
        </div>
      </template>
      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form" @submit.prevent>
        <el-form-item label="名称">
          <el-input v-model="searchName" placeholder="请输入名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="filteredData" style="width: 100%;" height="100%" border empty-text="暂无数据">
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="300" />
        <el-table-column prop="type" label="类型" min-width="120" />
        <el-table-column prop="strategy" label="通知策略" min-width="180" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" min-width="160" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete, Search, RefreshRight, Plus, Bell } from '@element-plus/icons-vue'
import {
  searchName,
  handleSearch,
  handleReset,
  filteredData,
  handleEdit,
  handleDelete,
  handleAddDingTalk,
  handleAddFeishu
} from './notificationManage'
</script>

<style src="./notificationManage.css"></style>

