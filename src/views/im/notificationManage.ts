import { ref, reactive } from 'vue' // Ensure reactive is imported
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  getNotificationList, 
  deleteNotification, 
  createFeiShu, 
  getNotificationById, 
  getCardContent, 
  testNotification, 
  updateFeiShu,
  createDingTalkNotification, // Added
  updateDingTalkNotification, // Added
  type CreateDingTalkRequest, // Added
  type UpdateDingTalkRequest   // Added
} from '@/api/im/notification'
import type { NotificationItem, CreateFeiShuParams, FeiShuCardContent, UpdateNotificationParams, NotificationConfig, NotificationCardContent } from '@/types/im'

// Changed searchName to a reactive object for el-form model binding
const searchCriteria = reactive({ name: '' })
const tableData = ref<NotificationItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const notificationDialogVisible = ref(false) // Renamed from feishuDialogVisible
const formLoading = ref(false)
const dialogTitle = ref('') // Added for dynamic dialog title

// Renamed feishuForm to notificationForm and added id, type flexibility, and optional secret
const notificationForm = ref<CreateFeiShuParams & { id?: number; type: 'feishu' | 'dingtalk' | string; secret?: string }>({
  id: undefined,
  name: '',
  type: 'feishu', // Default type, will be set by handleAddNotification
  enabled: true,
  secret: '', // Added for DingTalk
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
      name: searchCriteria.name || undefined, // Use searchCriteria.name
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
  searchCriteria.name = '' // Use searchCriteria.name
  currentPage.value = 1
  handleSearch()
}

const handleEdit = async (row: NotificationItem) => {
  try {
    const res = await getNotificationById({ id: row.id, type: 'feishu' });
    if (res.data?.code === 0 && res.data.data) {
      const config = res.data.data.config;
      const cardContent = res.data.data.card_content;
      if (config && cardContent) {
        // Ensure all fields from CreateFeiShuParams are covered, plus id and type
        notificationForm.value = {
          id: config.id,
          name: config.name,
          type: config.type as 'feishu' | 'dingtalk' | string, 
          enabled: config.enabled !== undefined ? config.enabled : true, 
          webhook_url: config.robot_url,
          secret: config.secret || '', // Populate secret for DingTalk
          description: '', // Assuming description is not part of config, adjust if it is
          tags: [], // Assuming tags are not part of config, adjust if it is
          notify_events: config.notification_policy ? config.notification_policy.split(',') : [],
          receivers: ['all'], // Default or load from config if available
          send_daily_stats: config.send_daily_stats,
          card_content: cardContent ? { // Ensure cardContent is not null
            alert_level: cardContent.alert_level || 'Critical',
            alert_name: cardContent.alert_name || '',
            notification_policy: cardContent.notification_policy || 'critical,warning',
            alert_content: cardContent.alert_content || '',
            notified_users: cardContent.notified_users || '@all',
            alert_handler: cardContent.alert_handler || '',
            claim_alert: cardContent.claim_alert || false,
            resolve_alert: cardContent.resolve_alert || false,
            mute_alert: cardContent.mute_alert || false,
            unresolved_alert: cardContent.unresolved_alert !== undefined ? cardContent.unresolved_alert : true,
            alert_time: cardContent.alert_time || new Date().toISOString() // provide default if null
          } : undefined // card_content can be undefined if not present
        }
      } else {
        fallbackToNotificationFormData(row); // Updated fallback function name
      }
    } else {
      fallbackToNotificationFormData(row); // Updated fallback function name
    }
    dialogTitle.value = `编辑 ${getNotificationTypeLabel(row.type)} - ${row.name}`;
    notificationDialogVisible.value = true;
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

const getNotificationTypeLabel = (type: string) => {
  if (type === 'feishu') return '飞书机器人';
  if (type === 'dingtalk') return '钉钉机器人';
  return '通知';
};


const fallbackToNotificationFormData = (row: NotificationItem) => { 
  notificationForm.value = {
    id: row.id,
    name: row.name,
    type: row.type as 'feishu' | 'dingtalk' | string,
    enabled: row.enabled !== undefined ? row.enabled : true,
    webhook_url: row.robot_url, // robot_url is the common field for webhook
    secret: row.secret || '', // Assuming secret might be directly on row for DingTalk after fetch
    description: '', // Assuming not directly on row, or map from NotificationConfig if available
    tags: [], // Assuming not directly on row
    notify_events: row.notification_policy ? row.notification_policy.split(',') : [],
    receivers: ['all'], // Default or map if available
    send_daily_stats: row.send_daily_stats || false,
    card_content: { // Default card content, should be adapted if API provides it
      alert_level: 'Critical',
      alert_name: 'Default Alert Name',
      notification_policy: 'critical,warning',
      alert_content: 'Default alert content.',
      notified_users: '@all',
      alert_handler: '',
      claim_alert: false,
      resolve_alert: false,
      mute_alert: false,
      unresolved_alert: true,
      alert_time: new Date().toISOString(),
    }
  };
}

const handleDelete = async (row: NotificationItem) => {
  try {
    await ElMessageBox.confirm(`确认删除通知配置 "${row.name}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // The deleteNotification API expects `type` to distinguish, ensure backend handles this
    const response = await deleteNotification({ 
      id: row.id,
      type: row.type // Pass the actual type of the notification
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

// Renamed handleAddFeishu to handleAddNotification
const handleAddNotification = (type: 'feishu' | 'dingtalk') => {
  notificationForm.value = { // Reset form, set type
    id: undefined,
    name: '',
    type: type,
    enabled: true,
    webhook_url: '',
    secret: '', // Initialize secret for DingTalk
    description: '',
    tags: [],
    notify_events: ['deployment', 'error', 'warning'], // Default events
    receivers: ['all'], // Default receivers
    send_daily_stats: true,
    card_content: { // Default card content, adjust if types have different structures
      alert_level: 'Critical', alert_name: 'Default Alert', notification_policy: 'critical,warning',
      alert_content: 'This is a default alert content.', notified_users: '@all', alert_handler: '',
      claim_alert: false, resolve_alert: false, mute_alert: false, unresolved_alert: true,
      alert_time: new Date().toISOString()
    }
  };
  dialogTitle.value = type === 'feishu' ? '添加飞书机器人' : '添加钉钉机器人';
  notificationDialogVisible.value = true;
}

// Renamed submitFeishuForm to submitNotificationForm
const submitNotificationForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      formLoading.value = true;
      try {
        let response;
        const formValue = notificationForm.value;

        if (formValue.type === 'feishu') {
          const feishuPayload: CreateFeiShuParams | UpdateNotificationParams = {
            ...formValue, // Spreading to include all common fields
            id: formValue.id, // For update
            robot_url: formValue.webhook_url, // API specific field name
            notification_policy: formValue.notify_events?.join(','),
            // card_content is already in formValue if needed
          };
          if (formValue.id) {
            response = await updateFeiShu(feishuPayload as UpdateNotificationParams);
          } else {
            response = await createFeiShu(feishuPayload as CreateFeiShuParams);
          }
        } else if (formValue.type === 'dingtalk') {
          if (formValue.id) {
            // Update DingTalk
            const updatePayload: UpdateDingTalkRequest = {
              id: formValue.id, // This is the general NotificationItem ID
              name: formValue.name,
              webhook_url: formValue.webhook_url,
              secret: formValue.secret,
              notification_policy: formValue.notify_events?.join(','),
              send_daily_stats: formValue.send_daily_stats,
              // card_content: formValue.card_content, // Assuming card_content structure is compatible
            };
            response = await updateDingTalkNotification(updatePayload);
          } else {
            // Create DingTalk
            const createPayload: CreateDingTalkRequest = {
              name: formValue.name,
              webhook_url: formValue.webhook_url,
              secret: formValue.secret,
              notify_events: formValue.notify_events || [],
              send_daily_stats: formValue.send_daily_stats,
              notification_type: 'dingtalk',
            };
            response = await createDingTalkNotification(createPayload);
          }
        }

        if (response?.data?.code === 0) {
          ElMessage.success(formValue.id ? '更新成功' : '添加成功');
          notificationDialogVisible.value = false;
          handleSearch();
          formEl.resetFields(); 
        } else {
          ElMessage.error(response?.data?.msg || (formValue.id ? '更新失败' : '添加失败'));
        }
      } catch (error) {
        console.error(notificationForm.value.id ? '更新失败:' : '添加失败:', error);
        ElMessage.error(notificationForm.value.id ? '更新失败' : '添加失败');
      } finally {
        formLoading.value = false
      }
    }
  })
}

// 初始加载
handleSearch()

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

// 添加详情对话框相关变量
const detailDialogVisible = ref(false)
const detailData = ref<{
  config: NotificationConfig | null
  cardContent: NotificationCardContent | null
}>({
  config: null,
  cardContent: null
})

// 处理详情按钮点击
const handleView = async (row: NotificationItem) => {
  try {
    const res = await getNotificationById({ id: row.id, type: 'feishu' });
    if (res.data?.code === 0 && res.data.data) {
      detailData.value = {
        config: res.data.data.config || null,
        cardContent: res.data.data.card_content || null
      }
      detailDialogVisible.value = true
    } else {
      ElMessage.error('获取通知详情失败')
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

// 卡片内容对话框相关变量
const cardContentDialogVisible = ref(false)
const cardContentData = ref<NotificationCardContent | null>(null)

// 处理获取卡片内容
const handleGetCardContent = async (row: NotificationItem) => {
  try {
    const res = await getCardContent({ notification_id: row.id });
    if (res.data?.code === 0 && res.data.data) {
      cardContentData.value = res.data.data
      cardContentDialogVisible.value = true
    } else {
      ElMessage.error('获取卡片内容失败')
    }
  } catch (error) {
    console.error('获取卡片内容失败:', error)
    ElMessage.error('获取卡片内容失败')
  }
}

export {
  searchCriteria, // Updated from searchName
  handleSearch,
  handleReset,
  tableData,
  handleEdit,
  handleDelete,
  handleAddNotification, // Renamed from handleAddFeishu
  notificationDialogVisible, // Renamed from feishuDialogVisible
  notificationForm, // Renamed from feishuForm
  feishuFormRules, // Consider renaming to notificationFormRules if rules differ by type
  submitNotificationForm, // Renamed from submitFeishuForm
  dialogTitle, // Export new ref
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
}
