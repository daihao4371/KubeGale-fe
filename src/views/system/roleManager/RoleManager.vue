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
        default-expand-all
      >
        <el-table-column prop="authorityId" label="角色ID" min-width="120" />
        <el-table-column prop="authorityName" label="角色名称" min-width="120" />
        <el-table-column label="操作" min-width="400" fixed="right">
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

    <!-- 创建角色对话框 -->
    <el-dialog
      v-model="createRoleDialogVisible"
      title="创建角色"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="createRoleFormRef"
        :model="createRoleForm"
        :rules="createRoleRules"
        label-width="100px"
        v-loading="createRoleLoading"
      >
        <el-form-item label="父级角色" prop="parentId">
          <el-input v-model="parentRoleName" disabled placeholder="根角色" />
        </el-form-item>
        <el-form-item label="角色ID" prop="authorityId">
          <el-input-number v-model="createRoleForm.authorityId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="角色名称" prop="authorityName">
          <el-input v-model="createRoleForm.authorityName" placeholder="请输入角色名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateRole" :loading="createRoleLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="editRoleDialogVisible"
      title="编辑角色"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        :rules="createRoleRules"
        label-width="100px"
        v-loading="editRoleLoading"
      >
        <el-form-item label="父级角色" prop="parentId">
          <el-input v-model="parentRoleName" disabled placeholder="根角色" />
        </el-form-item>
        <el-form-item label="角色ID" prop="authorityId">
          <el-input v-model="editRoleForm.authorityId" disabled />
        </el-form-item>
        <el-form-item label="角色名称" prop="authorityName">
          <el-input v-model="editRoleForm.authorityName" placeholder="请输入角色名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditRole" :loading="editRoleLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  handleDeleteRole,
  createRoleDialogVisible,
  createRoleLoading,
  createRoleForm,
  createRoleRules,
  submitCreateRole,
  editRoleDialogVisible,
  editRoleLoading,
  editRoleForm,
  submitEditRole
} from './roleManager'

// 表单引用
const createRoleFormRef = ref()
const editRoleFormRef = ref()
const parentRoleName = ref('根角色')

// 页面加载时获取角色列表
onMounted(() => {
  fetchRoleList()
})
</script>

<style src="./roleManager.css" scoped></style> 