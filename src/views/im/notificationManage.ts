import { ref, computed } from 'vue'

export interface NotificationItem {
  name: string
  address: string
  type: string
  strategy: string
  createTime: string
}

export const tableData = ref<NotificationItem[]>([
  {
    name: '测试通知',
    address: 'http://example.com/webhook',
    type: 'Webhook',
    strategy: '即时通知',
    createTime: '2024-03-20 10:00:00'
  }
])

export const searchName = ref('')
export const searchKey = ref('')

export const handleSearch = () => {
  searchKey.value = searchName.value.trim()
}

export const handleReset = () => {
  searchName.value = ''
  searchKey.value = ''
}

export const filteredData = computed(() => {
  if (!searchKey.value) return tableData.value
  return tableData.value.filter(item => item.name.includes(searchKey.value))
})

export const handleEdit = (row: NotificationItem) => {
  console.log('编辑', row)
}

export const handleDelete = (row: NotificationItem) => {
  console.log('删除', row)
}

export const handleAddDingTalk = () => {
  // TODO: 实现添加钉钉通知逻辑
  console.log('添加钉钉通知')
}

export const handleAddFeishu = () => {
  // TODO: 实现添加飞书通知逻辑
  console.log('添加飞书通知')
}
