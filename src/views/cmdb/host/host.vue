<template>
  <div class="host-container">
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
      <div class="action-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建主机
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
      <el-table-column label="配置" min-width="120">
        <template #default="{ row }">
          <div>CPU: {{ row.cpuCount }}核</div>
          <div>内存: {{ row.memory }}</div>
          <div>磁盘: {{ row.diskTotal }}</div>
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
  </div>
</template>

<script setup lang="ts">
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  Connection
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
  handleDelete,
  handleBatchDelete,
  handleSubmit,
  handleSizeChange,
  handleCurrentChange,
  handleTerminal
} = useHost()
</script>

<style scoped>
@import './host.css';
</style>
