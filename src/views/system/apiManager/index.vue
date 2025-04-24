<template>
  <div class="api-manager-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>API管理</span>
          <el-button type="primary" @click="handleAddApi">添加API</el-button>
        </div>
      </template>
      
      <div class="empty-data">
        <el-empty description="API管理功能正在开发中..."></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

// 添加API
const handleAddApi = () => {
  ElMessage.info('添加API功能正在开发中...')
}
</script>

<style scoped>
.api-manager-container {
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