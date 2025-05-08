import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getNotificationList, createDingTalk, deleteNotification, createFeiShu, updateDingTalk, getNotificationById, getCardContent } from '@/api/im/notification'
import type { NotificationItem, CreateDingTalkParams, CreateFeiShuParams, FeiShuCardContent, UpdateDingTalkParams } from '@/types/im'

const searchName = ref('')
const tableData = ref<NotificationItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dingTalkDialogVisible = ref(false)
const formLoading = ref(false)
const feishuDialogVisible = ref(false)

const defaultDingTalkForm: CreateDingTalkParams = {
  name: '',
  notificationPolicy: 'all',
  robotURL: '',
  card_content: {
    alert_level: 'warning',
    alert_name: '',
    notification_policy: 'all',
    alert_content: '',
    notified_users: '@all',
    last_similar_alert: '',
    alert_handler: '',
    claim_alert: true,
    resolve_alert: true,
    mute_alert: true,
    unresolved_alert: false
  }
}

const dingTalkForm = ref<CreateDingTalkParams>({ ...defaultDingTalkForm })

const feishuForm = ref<CreateFeiShuParams>({
  name: '',
  notificationPolicy: 'all',
  robotURL: '',
  card_content: {
    alert_level: 'Critical',
    alert_name: '',
    alert_content: '',
    notified_users: '',
    alert_handler: ''
  }
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
    if (row.type === 'dingtalk') {
      // 无论是否已有卡片内容，都调用接口获取最新的卡片内容
      try {
        const res = await getCardContent({ notification_id: row.id });
        if (res.data?.code === 0 && res.data.data) {
          const config = res.data.data.config;
          const c = res.data.data.card_content;
          
          // 填充表单数据，优先使用接口返回的数据
          dingTalkForm.value = {
            id: row.id,
            name: config.name || row.name,
            notificationPolicy: config.notificationPolicy || row.notificationPolicy || 'all',
            robotURL: config.robotURL || row.robotURL,
            signatureKey: config.signatureKey || row.signatureKey || '',
            card_content: {
              alert_level: c.alert_level || 'warning',
              alert_name: c.alert_name || '',
              notification_policy: c.notification_policy || 'all',
              alert_content: c.alert_content || '',
              notified_users: c.notified_users || '@all',
              last_similar_alert: c.last_similar_alert || '',
              alert_handler: c.alert_handler || '',
              claim_alert: c.claim_alert ?? true,
              resolve_alert: c.resolve_alert ?? true,
              mute_alert: c.mute_alert ?? true,
              unresolved_alert: c.unresolved_alert ?? false
            }
          }
        } else {
          // 如果接口调用成功但没有返回数据，则使用行数据
          fallbackToDingTalkRowData(row);
        }
      } catch (e) {
        console.error('获取卡片内容失败:', e);
        ElMessage.error('获取卡片内容失败，使用现有数据');
        // 接口调用失败时，使用行数据
        fallbackToDingTalkRowData(row);
      }
      
      dingTalkDialogVisible.value = true;
    } else if (row.type === 'feishu') {
      // 对飞书通知也进行类似处理，获取最新卡片内容
      try {
        const res = await getCardContent({ notification_id: row.id });
        if (res.data?.code === 0 && res.data.data) {
          const config = res.data.data.config;
          const c = res.data.data.card_content;
          
          // 填充飞书表单数据
          feishuForm.value = {
            id: row.id,
            name: config.name || row.name,
            notificationPolicy: config.notificationPolicy || row.notificationPolicy || 'all',
            robotURL: config.robotURL || row.robotURL,
            card_content: {
              alert_level: c.alert_level || 'Critical',
              alert_name: c.alert_name || '',
              alert_content: c.alert_content || '',
              notified_users: c.notified_users || '',
              alert_handler: c.alert_handler || ''
            }
          }
        } else {
          // 如果接口调用成功但没有返回数据，则使用行数据
          fallbackToFeishuRowData(row);
        }
      } catch (e) {
        console.error('获取飞书卡片内容失败:', e);
        ElMessage.error('获取卡片内容失败，使用现有数据');
        // 接口调用失败时，使用行数据
        fallbackToFeishuRowData(row);
      }
      
      feishuDialogVisible.value = true;
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

// 添加辅助函数，用于在API调用失败时回退到行数据
const fallbackToDingTalkRowData = (row: NotificationItem) => {
  const cardContent = row.cardContent;
  dingTalkForm.value = {
    id: row.id,
    name: row.name,
    notificationPolicy: row.notificationPolicy || 'all',
    robotURL: row.robotURL,
    signatureKey: row.signatureKey || '',
    card_content: {
      alert_level: cardContent?.alertLevel || 'warning',
      alert_name: cardContent?.alertName || '',
      notification_policy: cardContent?.notificationPolicy || 'all',
      alert_content: cardContent?.alertContent || '',
      notified_users: cardContent?.notifiedUsers || '@all',
      last_similar_alert: cardContent?.lastSimilarAlert || '',
      alert_handler: cardContent?.alertHandler || '',
      claim_alert: cardContent?.claimAlert ?? true,
      resolve_alert: cardContent?.resolveAlert ?? true,
      mute_alert: cardContent?.muteAlert ?? true,
      unresolved_alert: cardContent?.unresolvedAlert ?? false
    }
  }
}

const fallbackToFeishuRowData = (row: NotificationItem) => {
  const cardContent = row.cardContent;
  feishuForm.value = {
    id: row.id,
    name: row.name,
    notificationPolicy: row.notificationPolicy || 'all',
    robotURL: row.robotURL,
    card_content: {
      alert_level: cardContent?.alertLevel || 'Critical',
      alert_name: cardContent?.alertName || '',
      alert_content: cardContent?.alertContent || '',
      notified_users: cardContent?.notifiedUsers || '',
      alert_handler: cardContent?.alertHandler || ''
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
      type: row.type as 'dingtalk' | 'feishu'
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

const dingTalkFormRules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  notificationPolicy: [
    { required: true, message: '请选择通知策略', trigger: 'change' }
  ],
  robotURL: [
    { required: true, message: '请输入机器人 Webhook 地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  signatureKey: [
    { required: true, message: '请输入签名密钥', trigger: 'blur' }
  ],
  'card_content.alert_level': [
    { required: true, message: '请选择告警级别', trigger: 'change' }
  ],
  'card_content.alert_name': [
    { required: true, message: '请输入告警名称', trigger: 'blur' }
  ],
  'card_content.alert_content': [
    { required: true, message: '请输入告警内容', trigger: 'blur' }
  ],
  'card_content.notified_users': [
    { required: true, message: '请输入通知用户', trigger: 'blur' }
  ],
  'card_content.alert_handler': [
    { required: true, message: '请输入处理人', trigger: 'blur' }
  ]
}

const handleAddDingTalk = () => {
  dingTalkForm.value = { ...defaultDingTalkForm }
  dingTalkDialogVisible.value = true
}

const handleAddFeishu = () => {
  feishuForm.value = {
    name: '',
    notificationPolicy: 'all',
    robotURL: '',
    card_content: {
      alert_level: 'Critical',
      alert_name: '',
      alert_content: '',
      notified_users: '',
      alert_handler: ''
    }
  }
  feishuDialogVisible.value = true
}

const submitDingTalkForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      formLoading.value = true
      try {
        let response
        if (dingTalkForm.value.id) {
          // 更新操作
          const updateData: UpdateDingTalkParams = {
            id: dingTalkForm.value.id,
            name: dingTalkForm.value.name,
            notification_policy: dingTalkForm.value.notificationPolicy,
            send_daily_stats: false, // 默认值
            signature_key: dingTalkForm.value.signatureKey || '', // 使用表单中的签名密钥
            robot_url: dingTalkForm.value.robotURL,
            type: 'dingtalk',
            card_content: {
              alert_level: dingTalkForm.value.card_content.alert_level,
              alert_name: dingTalkForm.value.card_content.alert_name,
              notification_policy: dingTalkForm.value.card_content.notification_policy,
              alert_content: dingTalkForm.value.card_content.alert_content,
              notified_users: dingTalkForm.value.card_content.notified_users,
              last_similar_alert: dingTalkForm.value.card_content.last_similar_alert,
              alert_handler: dingTalkForm.value.card_content.alert_handler,
              claim_alert: dingTalkForm.value.card_content.claim_alert,
              resolve_alert: dingTalkForm.value.card_content.resolve_alert,
              mute_alert: dingTalkForm.value.card_content.mute_alert,
              unresolved_alert: dingTalkForm.value.card_content.unresolved_alert
            }
          }
          response = await updateDingTalk(updateData)
        } else {
          // 创建操作
          response = await createDingTalk(dingTalkForm.value)
        }
        
        if (response.data?.code === 0) {
          ElMessage.success(dingTalkForm.value.id ? '更新成功' : '添加成功')
          dingTalkDialogVisible.value = false
          handleSearch()
          formEl.resetFields()
        } else {
          ElMessage.error(response.data?.msg || (dingTalkForm.value.id ? '更新失败' : '添加失败'))
        }
      } catch (error) {
        console.error(dingTalkForm.value.id ? '更新失败:' : '添加失败:', error)
        ElMessage.error(dingTalkForm.value.id ? '更新失败' : '添加失败')
      } finally {
        formLoading.value = false
      }
    }
  })
}

const feishuFormRules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  notificationPolicy: [
    { required: true, message: '请选择通知策略', trigger: 'change' }
  ],
  robotURL: [
    { required: true, message: '请输入机器人 Webhook 地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  'card_content.alert_level': [
    { required: true, message: '请选择告警级别', trigger: 'change' }
  ],
  'card_content.alert_name': [
    { required: true, message: '请输入告警名称', trigger: 'blur' }
  ],
  'card_content.alert_content': [
    { required: true, message: '请输入告警内容', trigger: 'blur' }
  ],
  'card_content.notified_users': [
    { required: true, message: '请输入通知用户', trigger: 'blur' }
  ],
  'card_content.alert_handler': [
    { required: true, message: '请输入处理人', trigger: 'blur' }
  ]
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
          const updateData: UpdateDingTalkParams = {
            id: feishuForm.value.id,
            name: feishuForm.value.name,
            notification_policy: feishuForm.value.notificationPolicy,
            send_daily_stats: false,
            robot_url: feishuForm.value.robotURL,
            signature_key: '', // 添加签名密钥字段，飞书可能不需要，但类型要求必须有
            type: 'feishu' as 'feishu' | 'dingtalk', // 使用类型断言明确指定为字面量类型
            card_content: {
              alert_level: feishuForm.value.card_content.alert_level,
              alert_name: feishuForm.value.card_content.alert_name,
              alert_content: feishuForm.value.card_content.alert_content,
              notified_users: feishuForm.value.card_content.notified_users,
              alert_handler: feishuForm.value.card_content.alert_handler,
              // 添加缺少的字段
              notification_policy: 'all', // 默认值
              last_similar_alert: '', // 可选字段，提供空字符串
              claim_alert: true, // 默认值
              resolve_alert: true, // 默认值
              mute_alert: true, // 默认值
              unresolved_alert: false // 默认值
            }
          }
          response = await updateDingTalk(updateData) // 使用相同的更新接口
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
  handleCurrentChange
}
