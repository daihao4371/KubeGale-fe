<template>
  <div class="host-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="主机名称">
          <el-input v-model="searchForm.name" placeholder="请输入主机名称" clearable />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="searchForm.serverHost" placeholder="请输入IP地址" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建主机
        </el-button>
        <el-button type="danger" :disabled="!selectedHosts.length" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-upload
          class="upload-btn"
          action="/api/cmdb/hosts/import"
          :show-file-list="false"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
        >
          <el-button type="success">
            <el-icon><Upload /></el-icon>
            导入主机
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 主机列表 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="主机名称" min-width="120" />
      <el-table-column prop="serverHost" label="IP地址" min-width="120" />
      <el-table-column prop="os" label="操作系统" min-width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="project" label="所属项目" min-width="120" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="success" link @click="handleSSH">
              <el-icon><Connection /></el-icon>
              SSH
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 主机表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建主机' : '编辑主机'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="主机名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入主机名称" />
        </el-form-item>
        <el-form-item label="IP地址" prop="serverHost">
          <el-input v-model="formData.serverHost" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="formData.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="操作系统" prop="os">
          <el-input v-model="formData.os" placeholder="请输入操作系统" />
        </el-form-item>
        <el-form-item label="认证方式" prop="authType">
          <el-radio-group v-model="formData.authType">
            <el-radio label="password">密码</el-radio>
            <el-radio label="privateKey">密钥</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.authType === 'password'" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item v-else label="私钥" prop="privateKey">
          <el-input
            v-model="formData.privateKey"
            type="textarea"
            :rows="4"
            placeholder="请输入私钥内容"
          />
        </el-form-item>
        <el-form-item label="所属项目" prop="project">
          <el-select v-model="formData.project" placeholder="请选择项目">
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="formData.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 主机详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="主机详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="主机名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.serverHost }}</el-descriptions-item>
        <el-descriptions-item label="端口">{{ detailData.port }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ detailData.os }}</el-descriptions-item>
        <el-descriptions-item label="系统版本">{{ detailData.osVersion }}</el-descriptions-item>
        <el-descriptions-item label="系统架构">{{ detailData.osArch }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属项目">{{ detailData.project }}</el-descriptions-item>
        <el-descriptions-item label="公网IP">{{ detailData.publicIP }}</el-descriptions-item>
        <el-descriptions-item label="私网IP">{{ detailData.privateIP }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.note }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  View,
  Connection,
  Upload
} from '@element-plus/icons-vue'
import useHost from './host'

defineOptions({
  name: 'HostView',
  inheritAttrs: false
})

const {
  loading,
  tableData,
  selectedHosts,
  currentPage,
  pageSize,
  total,
  dialogVisible,
  dialogType,
  detailVisible,
  detailData,
  formRef,
  searchForm,
  formData,
  formRules,
  projectOptions,
  handleSearch,
  handleReset,
  handleSelectionChange,
  handleAdd,
  handleEdit,
  handleDetail,
  handleSSH,
  handleDelete,
  handleBatchDelete,
  handleImportSuccess,
  handleImportError,
  handleSubmit,
  handleSizeChange,
  handleCurrentChange,
  getStatusType,
  getStatusText
} = useHost()
</script>

<style scoped>
@import './host.css';
</style>
