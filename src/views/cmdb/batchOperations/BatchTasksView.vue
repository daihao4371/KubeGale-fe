<template>
  <div class="batch-tasks-page-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">批量任务</span>
        </div>
      </template>
      <el-tabs v-model="activeTabName" class="batch-tasks-tabs">
        <el-tab-pane label="命令执行" name="execute">
          <ExecuteCommands v-if="activeTabName === 'execute'" />
        </el-tab-pane>
        <el-tab-pane label="执行日志" name="logs">
          <ExecutionLogs v-if="activeTabName === 'logs'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExecuteCommands from './ExecuteCommands.vue';
import ExecutionLogs from './ExecutionLogs.vue';

defineOptions({
  name: 'BatchTasksView'
});

const activeTabName = ref('execute');
</script>

<style src="./BatchTasksView.css" scoped></style>
