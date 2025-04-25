<template>
  <div class="role-manager-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">角色管理</span>
            <span class="header-subtitle">管理系统角色和权限</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleAddRole">
              <el-icon class="el-icon--left"><Plus /></el-icon>添加角色
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="roleList"
        style="width: 100%"
        v-loading="loading"
        row-key="authorityId"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="authorityId" label="角色ID" min-width="120" />
        <el-table-column prop="authorityName" label="角色名称" min-width="120" />
        <el-table-column label="操作" min-width="400">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" text @click="handleSetPermission">
                <el-icon class="el-icon--left"><Setting /></el-icon>设置权限
              </el-button>
              <el-button size="small" type="primary" text @click="handleAddSubRole">
                <el-icon class="el-icon--left"><Plus /></el-icon>新增子角色
              </el-button>
              <el-button size="small" type="primary" text @click="handleCopyRole">
                <el-icon class="el-icon--left"><CopyDocument /></el-icon>拷贝
              </el-button>
              <el-button size="small" type="primary" text @click="handleEditRole">
                <el-icon class="el-icon--left"><Edit /></el-icon>编辑
              </el-button>
              <el-button size="small" type="danger" text @click="handleDeleteRole">
                <el-icon class="el-icon--left"><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Plus, Edit, Delete, Setting, CopyDocument } from '@element-plus/icons-vue'
import {
  roleList,
  loading,
  fetchRoleList,
  handleAddRole,
  handleSetPermission,
  handleAddSubRole,
  handleCopyRole,
  handleEditRole,
  handleDeleteRole
} from './roleManager'

// 页面加载时获取角色列表
onMounted(() => {
  fetchRoleList()
})
</script>

<style src="./roleManager.css" scoped></style>