<template>
  <div class="execution-logs-page-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">批量操作记录</span>
        </div>
      </template>

      <!-- Filters Section -->
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </el-form-item>
        <el-form-item label="执行用户">
          <el-input v-model="filters.userId" placeholder="用户ID或名称" clearable />
        </el-form-item>
        <el-form-item label="执行状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="Success" value="Success" />
            <el-option label="Partial Failure" value="Partial Failure" />
            <el-option label="Failed" value="Failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetAndFetch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="() => { filters.dateRange = null; filters.userId = ''; filters.status = ''; resetAndFetch(); }">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Logs Table -->
      <el-table
        v-loading="loading"
        :data="logs"
        border
        style="width: 100%"
        class="logs-table"
      >
        <el-table-column prop="ID" label="ID" width="80" align="center" />
        <el-table-column prop="Username" label="执行用户" width="120" />
        <el-table-column prop="CreatedAt" label="执行时间" width="180">
          <template #default="scope">{{ new Date(scope.row.CreatedAt).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="命令 (摘要)" min-width="200" show-overflow-tooltip>
            <template #default="scope">
                <pre class="command-snippet">{{ scope.row.Command.split('\n')[0] }}</pre>
            </template>
        </el-table-column>
        <el-table-column label="总主机" width="90" align="center">
          <template #default="scope">{{ getHostCount(scope.row.AllHosts) }}</template>
        </el-table-column>
        <el-table-column label="成功" width="90" align="center">
          <template #default="scope">
            <span style="color: var(--el-color-success);">{{ getHostCount(scope.row.SuccessHosts) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="失败" width="90" align="center">
          <template #default="scope">
            <span :style="{ color: getHostCount(scope.row.FailureHosts) > 0 ? 'var(--el-color-danger)' : 'inherit' }">
              {{ getHostCount(scope.row.FailureHosts) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="Status" label="状态" width="130" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.Status === 'Success' ? 'success' : (scope.row.Status === 'Partial Failure' ? 'warning' : 'danger')">
              {{ scope.row.Status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleViewDetails(scope.row)">
              <el-icon><View /></el-icon>详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetAndFetch"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`执行日志详情 - ID: ${currentLogDetail?.ID}`"
      width="70%"
      destroy-on-close
      class="detail-dialog"
    >
      <template v-if="currentLogDetail">
        <el-descriptions :column="2" border class="log-descriptions">
          <el-descriptions-item label="日志ID">{{ currentLogDetail.ID }}</el-descriptions-item>
          <el-descriptions-item label="执行用户">{{ currentLogDetail.Username || currentLogDetail.UserId }}</el-descriptions-item>
          <el-descriptions-item label="执行时间">{{ new Date(currentLogDetail.CreatedAt).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentLogDetail.Status === 'Success' ? 'success' : (currentLogDetail.Status === 'Partial Failure' ? 'warning' : 'danger')">
              {{ currentLogDetail.Status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="命令内容" :span="2">
            <pre class="command-detail">{{ currentLogDetail.Command }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="目标总数">{{ getHostCount(currentLogDetail.AllHosts) }}</el-descriptions-item>
          <el-descriptions-item label="成功数/失败数">
            <span style="color: var(--el-color-success);">{{ getHostCount(currentLogDetail.SuccessHosts) }}</span> / 
            <span :style="{ color: getHostCount(currentLogDetail.FailureHosts) > 0 ? 'var(--el-color-danger)' : 'inherit' }">{{ getHostCount(currentLogDetail.FailureHosts) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="detail-table-title">主机执行结果:</h4>
        <el-table :data="currentLogDetail.ParsedExecutionLogs" border style="width: 100%" max-height="350px">
          <el-table-column prop="host" label="主机" min-width="150" />
          <el-table-column label="输出" min-width="300">
            <template #default="scope">
              <pre class="log-output">{{ scope.row.output || '-' }}</pre>
            </template>
          </el-table-column>
          <el-table-column label="错误" min-width="300">
            <template #default="scope">
              <pre class="log-output error-output">{{ scope.row.error || '-' }}</pre>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useExecutionLogs from './useExecutionLogs';
import { Search, Refresh, View } from '@element-plus/icons-vue';

defineOptions({
  name: 'ExecutionLogsView'
});

const {
  loading, logs, pagination, filters,
  detailDialogVisible, currentLogDetail,
  fetchLogs, handleViewDetails, getHostCount,
  resetAndFetch
} = useExecutionLogs();

onMounted(() => {
  fetchLogs(); // Initial fetch for logs
});
</script>

<style src="./ExecutionLogs.css" scoped></style>
