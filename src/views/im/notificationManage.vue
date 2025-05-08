<template>
  <div class="notification-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>通知管理</span>
          <div class="header-buttons">
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
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag type="warning">
              {{ row.type === 'feishu' ? '飞书' : row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notification_policy" label="通知策略" width="200" />
        <el-table-column prop="robot_url" label="Webhook地址" width="300" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="380">
          <template #default="{ row }">
            <el-button :icon="View" size="small" link type="primary" @click="handleView(row)">详情</el-button>
            <el-button :icon="Edit" size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button :icon="Delete" size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button :icon="Search" size="small" link type="success" @click="handleTest(row)">测试</el-button>
            <el-button :icon="Document" size="small" link type="info" @click="handleGetCardContent(row)">卡片内容</el-button>
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
        <el-form-item label="Webhook地址" prop="webhook_url">
          <el-input v-model="feishuForm.webhook_url" placeholder="请输入飞书机器人的Webhook地址" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="feishuForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="feishuForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
          >
            <el-option label="测试" value="测试" />
            <el-option label="飞书" value="飞书" />
            <el-option label="通知" value="通知" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知事件" prop="notify_events">
          <el-select
            v-model="feishuForm.notify_events"
            multiple
            placeholder="请选择通知事件"
          >
            <el-option label="部署" value="deployment" />
            <el-option label="错误" value="error" />
            <el-option label="警告" value="warning" />
          </el-select>
        </el-form-item>
        <el-form-item label="接收者" prop="receivers">
          <el-select
            v-model="feishuForm.receivers"
            multiple
            placeholder="请选择接收者"
          >
            <el-option label="所有人" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="每日统计" prop="send_daily_stats">
          <el-switch v-model="feishuForm.send_daily_stats" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feishuDialogVisible = false">
            <el-icon><Close /></el-icon>取消
          </el-button>
          <el-button type="primary" @click="submitFeishuForm(feishuFormRef)">
            <el-icon><Check /></el-icon>确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 测试通知对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="测试通知"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
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
            <el-icon><Check /></el-icon>发送测试
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <template v-if="detailData.config && detailData.cardContent">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="名称">{{ detailData.config.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag type="warning">{{ detailData.config.type === 'feishu' ? '飞书' : detailData.config.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="通知策略">{{ detailData.config.notification_policy }}</el-descriptions-item>
          <el-descriptions-item label="Webhook地址">{{ detailData.config.robot_url }}</el-descriptions-item>
          <el-descriptions-item label="每日统计">
            <el-tag :type="detailData.config.send_daily_stats ? 'success' : 'info'">
              {{ detailData.config.send_daily_stats ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(detailData.config.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(detailData.config.updated_at) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>卡片内容</el-divider>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="告警级别">
            <el-tag :type="detailData.cardContent.alert_level === 'Critical' ? 'danger' : 'warning'">
              {{ detailData.cardContent.alert_level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警名称">{{ detailData.cardContent.alert_name }}</el-descriptions-item>
          <el-descriptions-item label="通知策略">{{ detailData.cardContent.notification_policy }}</el-descriptions-item>
          <el-descriptions-item label="告警内容">{{ detailData.cardContent.alert_content }}</el-descriptions-item>
          <el-descriptions-item label="通知用户">{{ detailData.cardContent.notified_users }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ detailData.cardContent.alert_handler }}</el-descriptions-item>
          <el-descriptions-item label="告警时间">{{ formatDate(detailData.cardContent.alert_time) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.cardContent.unresolved_alert ? 'danger' : 'success'">
              {{ detailData.cardContent.unresolved_alert ? '未解决' : '已解决' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 卡片内容对话框 -->
    <el-dialog
      v-model="cardContentDialogVisible"
      title="卡片内容"
      width="600px"
      :close-on-click-modal="false"
    >
      <template v-if="cardContentData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="告警级别">
            <el-tag :type="cardContentData.alert_level === 'Critical' ? 'danger' : 'warning'">
              {{ cardContentData.alert_level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警名称">{{ cardContentData.alert_name }}</el-descriptions-item>
          <el-descriptions-item label="通知策略">{{ cardContentData.notification_policy }}</el-descriptions-item>
          <el-descriptions-item label="告警内容">{{ cardContentData.alert_content }}</el-descriptions-item>
          <el-descriptions-item label="通知用户">{{ cardContentData.notified_users }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ cardContentData.alert_handler }}</el-descriptions-item>
          <el-descriptions-item label="告警时间">{{ formatDate(cardContentData.alert_time) }}</el-descriptions-item>
          <el-descriptions-item label="上次相似告警">{{ cardContentData.last_similar_alert }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="cardContentData.unresolved_alert ? 'danger' : 'success'">
              {{ cardContentData.unresolved_alert ? '未解决' : '已解决' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cardContentDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Search, RefreshRight, Edit, Delete, Close, Check, View, Document } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import dayjs from 'dayjs'
import {
  searchName,
  handleSearch,
  handleReset,
  tableData,
  handleEdit,
  handleDelete,
  handleAddFeishu,
  feishuDialogVisible,
  feishuForm,
  feishuFormRules,
  submitFeishuForm,
  loading,
  currentPage,
  pageSize,
  total,
  handleSizeChange,
  handleCurrentChange,
  testDialogVisible,
  testLoading,
  testMessage,
  handleTest,
  sendTestMessage,
  detailDialogVisible,
  detailData,
  handleView,
  handleGetCardContent,
  cardContentDialogVisible,
  cardContentData
} from './notificationManage'

const feishuFormRef = ref<FormInstance>()

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
@import './notificationManage.css';
</style>

