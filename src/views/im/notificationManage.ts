import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getNotificationList, createDingTalk, deleteNotification, createFeiShu } from '@/api/im/notification'
import type { NotificationItem, CreateDingTalkParams, CreateFeiShuParams, FeiShuCardContent } from '@/types/im'

const searchName = ref('')
const filteredData = ref<NotificationItem[]>([])
const loading = ref(false)
const dingTalkDialogVisible = ref(false)
const formLoading = ref(false)
const feishuDialogVisible = ref(false)

const defaultDingTalkForm: CreateDingTalkParams = {
  name: '',
  notification_policy: 'all',
  send_daily_stats: true,
  signature_key: '',
  robot_url: '',
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
  notification_policy: 'all',
  send_daily_stats: true,
  robot_url: '',
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
    const response = await getNotificationList({})
    if (response.data?.code === 0 && response.data.data.items) {
      filteredData.value = response.data.data.items.filter(item =>
        item.name.toLowerCase().includes(searchName.value.toLowerCase())
      )
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchName.value = ''
  handleSearch()
}

const handleEdit = (row: NotificationItem) => {
  console.log('编辑行:', row)
}

const handleDelete = async (row: NotificationItem) => {
  try {
    await ElMessageBox.confirm('确认删除该通知吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const response = await deleteNotification({ id: row.id })
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
  robot_url: [
    { required: true, message: '请输入机器人 Webhook 地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ]
}

const handleAddDingTalk = () => {
  dingTalkForm.value = { ...defaultDingTalkForm }
  dingTalkDialogVisible.value = true
}

const handleAddFeishu = () => {
  feishuForm.value = {
    name: '',
    notification_policy: 'all',
    send_daily_stats: true,
    robot_url: '',
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
        const response = await createDingTalk(dingTalkForm.value)
        if (response.data?.code === 0) {
          ElMessage.success('添加成功')
          dingTalkDialogVisible.value = false
          handleSearch()
          formEl.resetFields()
        } else {
          ElMessage.error(response.data?.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加失败:', error)
        ElMessage.error('添加失败')
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
  robot_url: [
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
        const response = await createFeiShu(feishuForm.value)
        if (response.data?.code === 0) {
          ElMessage.success('添加成功')
          feishuDialogVisible.value = false
          handleSearch()
          formEl.resetFields()
        } else {
          ElMessage.error(response.data?.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加失败:', error)
        ElMessage.error('添加失败')
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
}
