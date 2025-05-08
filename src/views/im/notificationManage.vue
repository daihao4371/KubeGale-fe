<template>
  <div class="notification-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>通知管理</span>
          <div class="header-buttons">
            <el-button type="primary" :icon="Plus" @click="handleAddDingTalk">添加钉钉机器人</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAddFeishu">添加飞书机器人</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-form">
        <el-input
          v-model="searchName"
          placeholder="请输入通知名称搜索"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @clear="handleReset"
          style="width: 300px; margin-right: 10px;"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'dingtalk' ? 'success' : 'warning'">
              {{ row.type === 'dingtalk' ? '钉钉' : '飞书' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notificationPolicy" label="通知策略" min-width="120" />
        <el-table-column prop="robotURL" label="Webhook地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button :icon="Edit" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button :icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button :icon="MessageBox" link type="success" @click="handleTest(row)">测试</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
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
    </el-card>

    <!-- 钉钉机器人对话框 -->
    <el-dialog
      v-model="dingTalkDialogVisible"
      :title="dingTalkForm.id ? '编辑钉钉机器人' : '添加钉钉机器人'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dingTalkFormRef"
        :model="dingTalkForm"
        :rules="dingTalkFormRules"
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="dingTalkForm.name" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="通知策略" prop="notificationPolicy">
          <el-select v-model="dingTalkForm.notificationPolicy" placeholder="请选择通知策略">
            <el-option label="所有通知" value="all" />
            <el-option label="仅重要通知" value="important" />
            <el-option label="仅紧急通知" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="Webhook地址" prop="robotURL">
          <el-input v-model="dingTalkForm.robotURL" placeholder="请输入钉钉机器人的Webhook地址" />
        </el-form-item>
        <el-form-item label="签名密钥" prop="signatureKey">
          <el-input v-model="dingTalkForm.signatureKey" placeholder="请输入签名密钥" />
        </el-form-item>
        <el-divider>卡片内容配置</el-divider>
        <el-form-item label="告警级别" prop="card_content.alert_level">
          <el-select v-model="dingTalkForm.card_content.alert_level" placeholder="请选择告警级别">
            <el-option label="严重" value="Critical" />
            <el-option label="警告" value="Warning" />
            <el-option label="信息" value="Info" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警名称" prop="card_content.alert_name">
          <el-input v-model="dingTalkForm.card_content.alert_name" placeholder="请输入告警名称" />
        </el-form-item>
        <el-form-item label="告警内容" prop="card_content.alert_content">
          <el-input
            v-model="dingTalkForm.card_content.alert_content"
            type="textarea"
            :rows="3"
            placeholder="请输入告警内容"
          />
        </el-form-item>
        <el-form-item label="通知用户" prop="card_content.notified_users">
          <el-input v-model="dingTalkForm.card_content.notified_users" placeholder="请输入通知用户，如: @王五 @赵六" />
        </el-form-item>
        <el-form-item label="处理人" prop="card_content.alert_handler">
          <el-input v-model="dingTalkForm.card_content.alert_handler" placeholder="请输入处理人" />
        </el-form-item>
        <el-form-item label="功能开关">
          <el-space>
            <el-checkbox v-model="dingTalkForm.card_content.claim_alert">认领告警</el-checkbox>
            <el-checkbox v-model="dingTalkForm.card_content.resolve_alert">解决告警</el-checkbox>
            <el-checkbox v-model="dingTalkForm.card_content.mute_alert">静默告警</el-checkbox>
          </el-space>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dingTalkDialogVisible = false">
            <el-icon><Close /></el-icon>取消
          </el-button>
          <el-button v-if="dingTalkForm.id" @click="resetDingTalkForm">
            <el-icon><RefreshLeft /></el-icon>重置
          </el-button>
          <el-button type="primary" :loading="formLoading" @click="submitDingTalkForm(dingTalkFormRef)">
            <el-icon><Check /></el-icon>确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 飞书机器人对话框 -->
    <el-dialog
      v-model="feishuDialogVisible"
      title="添加飞书机器人"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="feishuFormRef"
        :model="feishuForm"
        :rules="feishuFormRules"
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="feishuForm.name" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="通知策略" prop="notificationPolicy">
          <el-select v-model="feishuForm.notificationPolicy" placeholder="请选择通知策略">
            <el-option label="所有通知" value="all" />
            <el-option label="仅重要通知" value="important" />
            <el-option label="仅紧急通知" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="Webhook地址" prop="robotURL">
          <el-input v-model="feishuForm.robotURL" placeholder="请输入飞书机器人的Webhook地址" />
        </el-form-item>
        <el-divider>卡片内容配置</el-divider>
        <el-form-item label="告警级别" prop="card_content.alert_level">
          <el-select v-model="feishuForm.card_content.alert_level" placeholder="请选择告警级别">
            <el-option label="严重" value="Critical" />
            <el-option label="警告" value="Warning" />
            <el-option label="信息" value="Info" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警名称" prop="card_content.alert_name">
          <el-input v-model="feishuForm.card_content.alert_name" placeholder="请输入告警名称" />
        </el-form-item>
        <el-form-item label="告警内容" prop="card_content.alert_content">
          <el-input
            v-model="feishuForm.card_content.alert_content"
            type="textarea"
            :rows="3"
            placeholder="请输入告警内容"
          />
        </el-form-item>
        <el-form-item label="通知用户" prop="card_content.notified_users">
          <el-input v-model="feishuForm.card_content.notified_users" placeholder="请输入通知用户，如: @王五 @赵六" />
        </el-form-item>
        <el-form-item label="处理人" prop="card_content.alert_handler">
          <el-input v-model="feishuForm.card_content.alert_handler" placeholder="请输入处理人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feishuDialogVisible = false">
            <el-icon><Close /></el-icon>取消
          </el-button>
          <el-button type="primary" :loading="formLoading" @click="submitFeishuForm(feishuFormRef)">
            <el-icon><Check /></el-icon>确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加测试对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="发送测试消息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="通知名称">
          <el-input v-model="testItemName" disabled />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-tag :type="currentTestItem?.type === 'dingtalk' ? 'success' : 'warning'">
            {{ currentTestItem?.type === 'dingtalk' ? '钉钉' : '飞书' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="测试消息">
          <el-input
            v-model="testMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入测试消息内容（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="testDialogVisible = false">
            <el-icon><Close /></el-icon>取消
          </el-button>
          <el-button type="primary" :loading="testLoading" @click="sendTestMessage">
            <el-icon><MessageBox /></el-icon>发送测试
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, RefreshRight, Edit, Delete, Close, Check, RefreshLeft, MessageBox } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import dayjs from 'dayjs'
import {
  searchName,
  handleSearch,
  handleReset,
  tableData,
  handleEdit,
  handleDelete,
  handleAddDingTalk,
  handleAddFeishu,
  dingTalkDialogVisible,
  dingTalkForm,
  dingTalkFormRules,
  formLoading,
  submitDingTalkForm,
  loading,
  feishuDialogVisible,
  feishuForm,
  feishuFormRules,
  submitFeishuForm,
  currentPage,
  pageSize,
  total,
  handleSizeChange,
  handleCurrentChange,
  resetDingTalkForm,
  testDialogVisible,
  testLoading,
  currentTestItem,
  testMessage,
  handleTest,
  sendTestMessage
} from './notificationManage'

const dingTalkFormRef = ref<FormInstance>()
const feishuFormRef = ref<FormInstance>()

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 添加计算属性
const testItemName = computed({
  get: () => currentTestItem.value?.name || '',
  set: (val) => {
    if (currentTestItem.value) {
      currentTestItem.value.name = val
    }
  }
})
</script>

<style src="./notificationManage.css" scoped></style>

