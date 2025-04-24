<template>
  <div class="role-manager-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAddRole">添加角色</el-button>
        </div>
      </template>
      
      <div class="empty-data">
        <el-empty description="角色管理功能正在开发中..."></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

// 添加角色
const handleAddRole = () => {
  ElMessage.info('添加角色功能正在开发中...')
}
</script>

<style scoped>
.role-manager-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-data {
  margin: 40px 0;
}
</style>