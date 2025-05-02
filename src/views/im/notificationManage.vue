<template>
  <div class="notification-manage">
    <div class="search-bar">
      <el-input
        v-model="searchName"
        placeholder="请输入通知名称搜索"
        class="search-input"
        :prefix-icon="Search"
        clearable
        @clear="handleReset"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="operation-bar">
      <el-button type="primary" :icon="Plus" @click="handleAddDingTalk">添加钉钉机器人</el-button>
      <el-button type="primary" :icon="Plus" @click="handleAddFeishu">添加飞书机器人</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredData"
      style="width: 100%"
      border
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag :type="row.type === 'dingtalk' ? 'success' : 'warning'">
            {{ row.type === 'dingtalk' ? '钉钉' : '飞书' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="notification_policy" label="通知策略" />
      <el-table-column prop="send_daily_stats" label="每日统计" width="100">
        <template #default="{ row }">
          <el-tag :type="row.send_daily_stats ? 'success' : 'info'">
            {{ row.send_daily_stats ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="robot_url" label="Webhook地址" show-overflow-tooltip />
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button :icon="Edit" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button :icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 钉钉机器人对话框 -->
    <el-dialog
      v-model="dingTalkDialogVisible"
      title="添加钉钉机器人"
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
        <el-form-item label="通知策略" prop="notification_policy">
          <el-select v-model="dingTalkForm.notification_policy" placeholder="请选择通知策略">
            <el-option label="所有通知" value="all" />
            <el-option label="仅重要通知" value="important" />
            <el-option label="仅紧急通知" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="每日统计" prop="send_daily_stats">
          <el-switch v-model="dingTalkForm.send_daily_stats" />
        </el-form-item>
        <el-form-item label="Webhook地址" prop="robot_url">
          <el-input v-model="dingTalkForm.robot_url" placeholder="请输入钉钉机器人的Webhook地址" />
        </el-form-item>
        <el-form-item label="签名密钥" prop="signature_key">
          <el-input v-model="dingTalkForm.signature_key" placeholder="请输入签名密钥（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dingTalkDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="formLoading"
            @click="submitDingTalkForm(dingTalkFormRef)"
          >
            确定
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
        <el-form-item label="通知策略" prop="notification_policy">
          <el-select v-model="feishuForm.notification_policy" placeholder="请选择通知策略">
            <el-option label="所有通知" value="all" />
            <el-option label="仅重要通知" value="important" />
            <el-option label="仅紧急通知" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="每日统计" prop="send_daily_stats">
          <el-switch v-model="feishuForm.send_daily_stats" />
        </el-form-item>
        <el-form-item label="Webhook地址" prop="robot_url">
          <el-input v-model="feishuForm.robot_url" placeholder="请输入飞书机器人的Webhook地址" />
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
          <el-button @click="feishuDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="formLoading"
            @click="submitFeishuForm(feishuFormRef)"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Edit, Delete, Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import {
  searchName,
  handleSearch,
  handleReset,
  filteredData,
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
  submitFeishuForm
} from './notificationManage'

const dingTalkFormRef = ref<FormInstance>()
const feishuFormRef = ref<FormInstance>()
</script>

<style src="./notificationManage.css"></style>

