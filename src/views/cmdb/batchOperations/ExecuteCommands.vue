<template>
  <div class="execute-commands-page-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">批量命令执行</span>
        </div>
      </template>

      <div class="content-sections">
        <!-- Host Selection Section -->
        <div class="section host-selection-section">
          <h3 class="section-title">1. 选择目标主机</h3>
          <el-table
            v-loading="loadingHosts"
            :data="hosts"
            @selection-change="handleHostSelectionChange"
            border
            style="width: 100%"
            max-height="300px"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="主机名称" min-width="150" />
            <el-table-column prop="ip" label="IP地址" min-width="150" />
            <el-table-column prop="os" label="操作系统" min-width="100" />
          </el-table>
          <div class="pagination-container host-pagination">
            <el-pagination
              v-model:current-page="hostPagination.currentPage"
              v-model:page-size="hostPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="hostPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchHosts"
              @current-change="fetchHosts"
            />
          </div>
          <div class="selected-count">
            <span>已选择 {{ selectedHosts.length }} 台主机</span>
          </div>
        </div>

        <!-- Command Input Section -->
        <div class="section command-input-section">
          <h3 class="section-title">2. 输入执行命令</h3>
          <el-form label-position="top">
            <el-form-item label="执行语言">
              <el-radio-group v-model="commandLanguage">
                <el-radio label="shell">Shell</el-radio>
                <el-radio label="python">Python</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="命令内容 (每行一条命令)">
              <el-input
                v-model="commandsInput"
                type="textarea"
                :rows="8"
                placeholder="请输入要执行的命令，例如：\ndf -h\nfree -m"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- Execution Section -->
        <div class="section execution-section">
          <h3 class="section-title">3. 执行与结果</h3>
          <el-button
            type="primary"
            @click="handleExecute"
            :loading="executing"
            :disabled="selectedHosts.length === 0 || !commandsInput.trim()"
          >
            <el-icon><CaretRight /></el-icon>
            执行命令
          </el-button>
        </div>

        <!-- Results Section -->
        <div v-if="executionResult" class="section results-section">
          <h4 class="results-summary-title">执行概览</h4>
          <div class="results-summary">
            <p><strong>状态:</strong> <el-tag :type="executionResult.status === 'Success' ? 'success' : (executionResult.status === 'Partial Failure' ? 'warning' : 'danger')">{{ executionResult.status }}</el-tag></p>
            <p><strong>总计主机:</strong> {{ executionResult.allHosts.length }}</p>
            <p><strong>成功主机:</strong> {{ executionResult.successHosts.length }}</p>
            <p><strong>失败主机:</strong> {{ executionResult.failureHosts.length }}</p>
          </div>
          
          <h4 class="results-logs-title">执行日志</h4>
          <el-table
            :data="executionResult.executionLogs"
            border
            style="width: 100%"
            max-height="400px"
          >
            <el-table-column prop="host" label="主机" min-width="150" />
            <el-table-column label="输出" min-width="300">
              <template #default="scope">
                <pre class="log-output">{{ scope.row.output }}</pre>
              </template>
            </el-table-column>
            <el-table-column label="错误" min-width="300">
              <template #default="scope">
                <pre class="log-output error-output">{{ scope.row.error }}</pre>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useExecuteCommands from './useExecuteCommands';
import { CaretRight } from '@element-plus/icons-vue'; // For execute button icon

defineOptions({
  name: 'ExecuteCommandsView'
});

const {
  loadingHosts, hosts, selectedHosts, hostPagination,
  commandLanguage, commandsInput,
  executing, executionResult,
  fetchHosts, handleHostSelectionChange, handleExecute
} = useExecuteCommands();

onMounted(() => {
  fetchHosts(); // Initial fetch for hosts
});
</script>

<style src="./ExecuteCommands.css" scoped></style>
