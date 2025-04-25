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
              <el-button size="small" type="primary" text @click="handleSetPermission(scope.row)">
                <el-icon class="el-icon--left"><Setting /></el-icon>设置权限
              </el-button>
              <el-button size="small" type="primary" text @click="handleAddSubRole(scope.row)">
                <el-icon class="el-icon--left"><Plus /></el-icon>新增子角色
              </el-button>
              <el-button size="small" type="primary" text @click="handleCopyRole(scope.row)">
                <el-icon class="el-icon--left"><CopyDocument /></el-icon>拷贝
              </el-button>
              <el-button size="small" type="primary" text @click="handleEditRole(scope.row)">
                <el-icon class="el-icon--left"><Edit /></el-icon>编辑
              </el-button>
              <el-button size="small" type="danger" text @click="handleDeleteRole(scope.row)">
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, Setting, CopyDocument } from '@element-plus/icons-vue'
import { getAuthorityList, type Authority } from '@/api/system/roles'

// 角色列表数据
const roleList = ref<Authority[]>([])
const loading = ref(false)

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const res = await getAuthorityList()
    if (res.data && res.data.code === 0) {
      roleList.value = res.data.data
    } else {
      ElMessage.error(res.data?.msg || '获取角色列表失败')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 添加角色
const handleAddRole = () => {
  ElMessage.info('添加角色功能正在开发中...')
}

// 设置权限
const handleSetPermission = (row: Authority) => {
  ElMessage.info('设置权限功能正在开发中...')
}

// 新增子角色
const handleAddSubRole = (row: Authority) => {
  ElMessage.info('新增子角色功能正在开发中...')
}

// 拷贝角色
const handleCopyRole = (row: Authority) => {
  ElMessage.info('拷贝角色功能正在开发中...')
}

// 编辑角色
const handleEditRole = (row: Authority) => {
  ElMessage.info('编辑角色功能正在开发中...')
}

// 删除角色
const handleDeleteRole = (row: Authority) => {
  ElMessage.info('删除角色功能正在开发中...')
}

// 页面加载时获取角色列表
onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped>
.role-manager-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.header-subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.operation-buttons .el-button {
  padding: 6px 10px;
  font-size: 12px;
}
</style>