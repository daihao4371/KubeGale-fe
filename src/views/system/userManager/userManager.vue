<template>
  <div class="user-manager-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">用户管理</span>
            <span class="header-subtitle">管理系统用户信息和权限</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="fetchUserInfo">
              <el-icon class="el-icon--left"><User /></el-icon>个人信息
            </el-button>
            <el-button type="primary" @click="handleAddUser">
              <el-icon class="el-icon--left"><Plus /></el-icon>添加用户
            </el-button>
          </div>
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
      
      <!-- 添加/编辑用户对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <el-form
          ref="formRef"
          :model="userForm"
          :rules="userFormRules"
          label-width="100px"
          v-loading="dialogLoading"
        >
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="userForm.userName" placeholder="请输入用户名" :disabled="dialogTitle === '编辑用户'" />
          </el-form-item>
          <el-form-item label="密码" prop="passWord" v-if="dialogTitle === '添加用户'">
            <el-input v-model="userForm.passWord" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model="userForm.nickName" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="角色" prop="authorityId">
            <el-select v-model="userForm.authorityId" placeholder="请选择角色">
              <el-option
                v-for="(name, id) in roleMap"
                :key="id"
                :label="name"
                :value="Number(id)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="enable">
            <el-switch
              v-model="userForm.enable"
              :active-value="1"
              :inactive-value="0"
              :active-color="'#13ce66'"
              :inactive-color="'#ff4949'"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="dialogLoading">确定</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 用户详细信息对话框 -->
      <el-dialog
        v-model="userInfoDialogVisible"
        title="用户详细信息"
        width="600px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <div v-loading="userInfoLoading">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">{{ userDetailInfo?.ID }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ userDetailInfo?.userName }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userDetailInfo?.nickName }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userDetailInfo?.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userDetailInfo?.email }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-for="(auth, index) in userDetailInfo?.authorities" :key="index" type="info" effect="plain" class="auth-tag">
                {{ auth.authorityName }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userDetailInfo?.enable === 1 ? 'success' : 'danger'">
                {{ userDetailInfo?.enable === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="头像">
              <el-image 
                style="width: 100px; height: 100px" 
                :src="userDetailInfo?.headerImg" 
                fit="cover"
                :preview-src-list="userDetailInfo?.headerImg ? [userDetailInfo.headerImg] : []"
              />
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ userDetailInfo?.CreatedAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ userDetailInfo?.UpdatedAt }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="userInfoDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Delete, Key, User } from '@element-plus/icons-vue'
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
  handleDelete,
  // 新增导入
  dialogVisible,
  dialogTitle,
  dialogLoading,
  userForm,
  userFormRules,
  formRef,
  submitForm,
  roleMap,
  // 用户详情相关
  userDetailInfo,
  userInfoDialogVisible,
  userInfoLoading,
  fetchUserInfo
} from './userManager'

// 页面加载时获取用户列表
fetchUserList()
</script>

<style src="./userManager.css" scoped></style>