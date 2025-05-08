import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getNotificationList, deleteNotification, createFeiShu, getNotificationById, getCardContent, testNotification, updateFeiShu } from '@/api/im/notification'
import type { NotificationItem, CreateFeiShuParams, FeiShuCardContent, UpdateNotificationParams } from '@/types/im'

const searchName = ref('')
const tableData = ref<NotificationItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const feishuDialogVisible = ref(false)
const formLoading = ref(false)

const feishuForm = ref<CreateFeiShuParams>({
  name: '',
  type: 'feishu',
  enabled: true,
  webhook_url: '',
  description: '',
  tags: [],
  notify_events: ['deployment', 'error', 'warning'],
  receivers: ['all'],
  send_daily_stats: true
})

const handleSearch = async () => {
  loading.value = true
  try {
    const response = await getNotificationList({
      page: currentPage.value,
      pageSize: pageSize.value,
      orderKey: 'created_at',
      desc: true
    })
    if (response.data?.code === 0 && response.data.data) {
      tableData.value = response.data.data.list
      total.value = response.data.data.total
      currentPage.value = response.data.data.page
      pageSize.value = response.data.data.pageSize
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

const handleReset = () => {
  searchName.value = ''
  currentPage.value = 1
  handleSearch()
}

const handleEdit = async (row: NotificationItem) => {
  try {
    const res = await getCardContent({ notification_id: row.id });
    if (res.data?.code === 0 && res.data.data) {
      const config = res.data.data.config;
      const c = res.data.data.card_content;
      feishuForm.value = {
        id: row.id,
        name: config.name || row.name,
        type: 'feishu',
        enabled: true,
        webhook_url: config.robot_url || row.robot_url,
        description: '',
        tags: [],
        notify_events: ['deployment', 'error', 'warning'],
        receivers: ['all'],
        send_daily_stats: true,
        card_content: {
          alert_level: c.alert_level || 'Critical',
          alert_name: c.alert_name || '',
          notification_policy: c.notification_policy || 'critical,warning',
          alert_content: c.alert_content || '',
          notified_users: c.notified_users || '@all',
          alert_handler: c.alert_handler || '',
          claim_alert: c.claim_alert || false,
          resolve_alert: c.resolve_alert || false,
          mute_alert: c.mute_alert || false,
          unresolved_alert: c.unresolved_alert || true
        }
      }
    } else {
      fallbackToFeishuRowData(row);
    }
    feishuDialogVisible.value = true;
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

const fallbackToFeishuRowData = (row: NotificationItem) => {
  feishuForm.value = {
    id: row.id,
    name: row.name,
    type: 'feishu',
    enabled: true,
    webhook_url: row.robot_url,
    description: '',
    tags: [],
    notify_events: ['deployment', 'error', 'warning'],
    receivers: ['all'],
    send_daily_stats: true,
    card_content: {
      alert_level: 'Critical',
      alert_name: '',
      notification_policy: 'critical,warning',
      alert_content: '',
      notified_users: '@all',
      alert_handler: '',
      claim_alert: false,
      resolve_alert: false,
      mute_alert: false,
      unresolved_alert: true
    }
  }
}

const handleDelete = async (row: NotificationItem) => {
  try {
    await ElMessageBox.confirm('确认删除该通知吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const response = await deleteNotification({ 
      id: row.id,
      type: 'feishu'
    })
    if (response.data?.code === 0) {
      ElMessage.success('删除成功')
      handleSearch()
    } else {
      ElMessage.error(response.data?.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const feishuFormRules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  webhook_url: [
    { required: true, message: '请输入机器人 Webhook 地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  notify_events: [
    { required: true, message: '请选择通知事件', trigger: 'change' }
  ],
  receivers: [
    { required: true, message: '请选择接收者', trigger: 'change' }
  ]
}

const handleAddFeishu = () => {
  feishuForm.value = {
    name: '',
    type: 'feishu',
    enabled: true,
    webhook_url: '',
    description: '',
    tags: [],
    notify_events: ['deployment', 'error', 'warning'],
    receivers: ['all'],
    send_daily_stats: true
  }
  feishuDialogVisible.value = true
}

const submitFeishuForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      formLoading.value = true
      try {
        let response
        if (feishuForm.value.id) {
          // 更新操作
          const updateParams: UpdateNotificationParams = {
            id: feishuForm.value.id,
            name: feishuForm.value.name,
            notification_policy: feishuForm.value.notify_events?.join(',') || 'critical,warning',
            robot_url: feishuForm.value.webhook_url,
            send_daily_stats: feishuForm.value.send_daily_stats || false,
            card_content: {
              alert_level: feishuForm.value.card_content?.alert_level || 'Critical',
              alert_name: feishuForm.value.card_content?.alert_name || '',
              notification_policy: feishuForm.value.card_content?.notification_policy || 'critical,warning',
              alert_content: feishuForm.value.card_content?.alert_content || '',
              notified_users: feishuForm.value.card_content?.notified_users || '@all',
              alert_handler: feishuForm.value.card_content?.alert_handler || '',
              claim_alert: feishuForm.value.card_content?.claim_alert || false,
              resolve_alert: feishuForm.value.card_content?.resolve_alert || false,
              mute_alert: feishuForm.value.card_content?.mute_alert || false,
              unresolved_alert: feishuForm.value.card_content?.unresolved_alert || true,
              alert_time: new Date().toISOString()
            }
          }
          response = await updateFeiShu(updateParams)
        } else {
          // 创建操作
          response = await createFeiShu(feishuForm.value)
        }
        if (response.data?.code === 0) {
          ElMessage.success(feishuForm.value.id ? '更新成功' : '添加成功')
          feishuDialogVisible.value = false
          handleSearch()
          formEl.resetFields()
        } else {
          ElMessage.error(response.data?.msg || (feishuForm.value.id ? '更新失败' : '添加失败'))
        }
      } catch (error) {
        console.error(feishuForm.value.id ? '更新失败:' : '添加失败:', error)
        ElMessage.error(feishuForm.value.id ? '更新失败' : '添加失败')
      } finally {
        formLoading.value = false
      }
    }
  })
}

// 初始加载
handleSearch()

export {
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
  sendTestMessage
}

// 添加测试对话框相关变量
const testDialogVisible = ref(false)
const testLoading = ref(false)
const currentTestItem = ref<NotificationItem | null>(null)
const testMessage = ref('')

// 处理测试按钮点击
const handleTest = (row: NotificationItem) => {
  currentTestItem.value = row
  testMessage.value = ''
  testDialogVisible.value = true
}

// 发送测试消息
const sendTestMessage = async () => {
  if (!currentTestItem.value) return
  testLoading.value = true
  try {
    const response = await testNotification({
      id: currentTestItem.value.id,
      type: 'feishu',
      message: testMessage.value || undefined
    })
    if (response.data?.code === 0) {
      ElMessage.success(response.data.data?.message || '测试消息发送成功')
      testDialogVisible.value = false
    } else {
      ElMessage.error(response.data?.msg || '测试消息发送失败')
    }
  } catch (error) {
    console.error('测试消息发送失败:', error)
    ElMessage.error('测试消息发送失败')
  } finally {
    testLoading.value = false
  }
}
