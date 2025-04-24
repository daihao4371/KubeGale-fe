<template>
  <div class="menu-manager-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleAddMenu">添加菜单</el-button>
        </div>
      </template>
      
      <div class="empty-data">
        <el-empty description="菜单管理功能正在开发中..."></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

// 添加菜单
const handleAddMenu = () => {
  ElMessage.info('添加菜单功能正在开发中...')
}
</script>

<style scoped>
.menu-manager-container {
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