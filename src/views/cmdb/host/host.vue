<template>
  <div class="host-container">
    <el-card class="host-main-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="主机名称">
            <el-input v-model="searchForm.name" placeholder="请输入主机名称" clearable />
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input v-model="searchForm.ip" placeholder="请输入IP地址" clearable />
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
        <div class="action-left">
          <!-- Placeholder for potential left-aligned actions -->
        </div>
        <div class="action-right">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建主机
          </el-button>
          <el-button type="primary" @click="importVisible = true">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button type="danger" :disabled="!selectedHosts.length" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
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
      <el-table-column prop="os" label="操作系统" min-width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '已验证' ? 'primary' : 'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="配置" min-width="180">
        <template #default="{ row }">
          <div class="config-cell">
            <span>CPU: {{ row.cpuCount }}核</span>
            <span>内存: {{ row.memory }}</span>
            <span>磁盘: {{ row.diskTotal }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" min-width="160">
        <template #default="{ row }">
          <div>公网：{{ row.publicIP }}</div>
          <div>私网：{{ row.privateIP }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="projectName" label="所属项目" min-width="120" />
      <el-table-column prop="CreatedAt" label="创建时间" min-width="160">
        <template #default="{ row }">
          {{ new Date(row.CreatedAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="UpdatedAt" label="修改时间" min-width="160">
        <template #default="{ row }">
          {{ new Date(row.UpdatedAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
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
            <el-button type="primary" link @click="handleTerminal(row)">
              <el-icon><Connection /></el-icon>
              终端
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
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="formData.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="私钥" prop="privateKey">
          <el-input
            v-model="formData.privateKey"
            type="textarea"
            :rows="4"
            placeholder="请输入SSH私钥内容"
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
      <el-descriptions
        v-loading="detailLoading"
        :column="2"
        border
      >
        <el-descriptions-item label="主机名称">{{ hostDetail?.name }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ hostDetail?.serverHost }}</el-descriptions-item>
        <el-descriptions-item label="端口">{{ hostDetail?.port }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ hostDetail?.username }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ hostDetail?.os }}</el-descriptions-item>
        <el-descriptions-item label="系统版本">{{ hostDetail?.osVersion }}</el-descriptions-item>
        <el-descriptions-item label="系统架构">{{ hostDetail?.osArch }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="hostDetail?.status === '已验证' ? 'primary' : 'warning'">
            {{ hostDetail?.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="CPU型号">{{ hostDetail?.cpuModel }}</el-descriptions-item>
        <el-descriptions-item label="CPU核心数">{{ hostDetail?.cpuCount }}</el-descriptions-item>
        <el-descriptions-item label="内存">{{ hostDetail?.memory }}</el-descriptions-item>
        <el-descriptions-item label="磁盘">{{ hostDetail?.diskTotal }}</el-descriptions-item>
        <el-descriptions-item label="公网IP">{{ hostDetail?.publicIP }}</el-descriptions-item>
        <el-descriptions-item label="私网IP">{{ hostDetail?.privateIP }}</el-descriptions-item>
        <el-descriptions-item label="所属项目">
          {{ projectOptions.find(p => p.id === Number(hostDetail?.project))?.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ hostDetail?.CreatedAt ? new Date(hostDetail.CreatedAt).toLocaleString() : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ hostDetail?.UpdatedAt ? new Date(hostDetail.UpdatedAt).toLocaleString() : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ hostDetail?.note || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importVisible"
      title="批量导入主机"
      width="500px"
    >
      <el-form
        ref="importFormRef"
        :model="importForm"
        :rules="importRules"
        label-width="100px"
      >
        <el-form-item label="Excel文件" prop="file">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".csv"
            :on-change="handleFileChange"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传Excel文件，<el-button type="primary" link @click="downloadTemplate">下载模板</el-button>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="所属项目" prop="project">
          <el-select v-model="importForm.project" placeholder="请选择项目">
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport">确定</el-button>
      </template>
    </el-dialog>

    <!-- 主机表单对话框, 详情对话框, 导入对话框 remain here -->
    </el-card> <!-- End of host-main-card -->
  </div> <!-- End of host-container -->
</template>

<script setup lang="ts">
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  Connection,
  View,
  Upload
} from '@element-plus/icons-vue'
import useHost from './host'
// Removed onMounted, onUnmounted, Terminal, FitAddon, xterm.css as they were for the local dialog
import { ElMessage } from 'element-plus'
import type { Host } from '@/types/cmdb' // Keep Host type if used elsewhere
import { authenticateHost } from '@/api/cmdb/host' // Keep if handleTerminal uses it

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
  formRef,
  searchForm,
  formData,
  formRules,
  projectOptions,
  detailVisible,
  hostDetail,
  detailLoading,
  handleSearch,
  handleReset,
  handleSelectionChange,
  handleAdd,
  handleEdit,
  handleDelete,
  handleBatchDelete,
  handleSubmit,
  handleSizeChange,
  handleCurrentChange,
  handleDetail,
  importVisible,
  importForm,
  importRules,
  handleFileChange,
  downloadTemplate,
  handleImport
  // Removed terminalVisible, terminalLoading, currentHost from destructuring
} = useHost()

// 终端相关 - handleTerminal is now the only part related to terminal functionality
// It opens a new page, so local xterm instance is not needed.
const handleTerminal = async (row: Host) => {
  // terminalLoading.value = true; // This variable is removed, consider if loading state is still needed visually
  ElMessage.info('正在准备终端连接...'); // Provide immediate feedback
  try {
    // 1. 先进行 SSH 认证
    const res = await authenticateHost({
      name: row.name,
      serverHost: row.serverHost,
      port: row.port,
      username: row.username,
      password: row.password, // Assuming password might be empty if key-based
      project: row.project,
      note: row.note
    })

    if (res.code === 0 && res.data.wsUrl) {
      // 2. 认证成功后，使用后端返回的 wsUrl 打开终端页面
      const terminalUrl = `/terminal?wsUrl=${encodeURIComponent(res.data.wsUrl)}&name=${encodeURIComponent(row.name)}&host=${encodeURIComponent(row.serverHost)}`
      window.open(terminalUrl, '_blank', 'noopener,noreferrer'); // Added security attributes
      ElMessage.success('SSH认证成功，正在打开终端...')
    } else {
      ElMessage.error(res.msg || 'SSH认证失败或未返回wsUrl')
    }
  } catch (error) {
    console.error('SSH认证或打开终端失败:', error)
    ElMessage.error('SSH认证失败，请检查连接信息或联系管理员')
  } finally {
    // terminalLoading.value = false; // This variable is removed
  }
}

// Removed onMounted and onUnmounted hooks related to local xterm instance
</script>

<style scoped>
@import './host.css';

/* Terminal dialog specific styles removed as dialog is removed */
</style>
