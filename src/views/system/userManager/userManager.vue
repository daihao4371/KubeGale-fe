<template>
  <div class="user-manager-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">用户管理</span>
            <span class="header-subtitle">管理系统用户信息和权限</span>
          </div>
          <el-button type="primary" @click="handleAddUser">
            <el-icon class="el-icon--left"><Plus /></el-icon>添加用户
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="userList" 
        style="width: 100%" 
        v-loading="loading"
        border
        stripe
        highlight-current-row
        :header-cell-style="{backgroundColor: '#f5f7fa', color: '#606266'}"
      >
        <el-table-column prop="ID" label="ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户名" min-width="120" />
        <el-table-column prop="nickName" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="authorityId" label="用户角色" min-width="100">
          <template #default="scope">
            <el-tag 
              type="info" 
              effect="plain"
              size="small"
            >
              {{ getRoleName(scope.row.authorityId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enable" label="启用" min-width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enable"
              :active-value="1"
              :inactive-value="0"
              disabled
              :active-color="'#13ce66'"
              :inactive-color="'#ff4949'"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="280">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" text @click="handleEdit(scope.row)">
                <el-icon class="el-icon--left"><Edit /></el-icon>编辑
              </el-button>
              <el-button size="small" type="primary" text @click="handleResetPassword(scope.row)">
                <el-icon class="el-icon--left"><Key /></el-icon>重设密码
              </el-button>
              <el-button size="small" type="danger" text @click="handleDelete(scope.row)">
                <el-icon class="el-icon--left"><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import { 
  currentPage, 
  pageSize, 
  total, 
  loading, 
  userList, 
  getRoleName, 
  fetchUserList, 
  handleCurrentChange, 
  handleSizeChange, 
  handleAddUser, 
  handleEdit, 
  handleResetPassword, 
  handleDelete 
} from './userManager'

// 页面加载时获取用户列表
fetchUserList()
</script>

<style src="./userManager.css" scoped></style>