<template>
  <div class="user-manager-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        </div>
      </template>
      
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="uuid" label="ID" width="280" />
        <el-table-column prop="userName" label="用户名" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="authorityId" label="用户角色" width="100">
          <template #default="scope">
            {{ getRoleName(scope.row.authorityId) }}
          </template>
        </el-table-column>
        <el-table-column prop="enable" label="启用" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enable"
              :active-value="1"
              :inactive-value="0"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleResetPassword(scope.row)">重设密码</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/system/user'

// 定义用户数据类型
interface UserInfo {
  uuid: string
  userName: string
  nickName: string
  phone: string
  email: string
  authorityId: number
  enable: number
  headerImg: string
  authority?: {
    CreatedAt: string
    UpdatedAt: string
  }
  originSetting?: any
}

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 用户列表数据
const userList = ref<UserInfo[]>([])

// 角色映射
const roleMap: Record<number, string> = {
  888: '管理员',
  999: '普通用户',
  // 可以根据实际情况添加更多角色
}

// 获取角色名称
const getRoleName = (authorityId: number) => {
  return roleMap[authorityId] || '未知角色'
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (res.data && res.data.code === 0) {
      userList.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    } else {
      ElMessage.error(res.data?.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表出错:', error)
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUserList()
}

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUserList()
}

// 添加用户
const handleAddUser = () => {
  ElMessage.info('添加用户功能正在开发中...')
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  ElMessage.info('编辑用户功能正在开发中...')
}

// 重设密码
const handleResetPassword = (row: UserInfo) => {
  ElMessage.info('重设密码功能正在开发中...')
}

// 删除用户
const handleDelete = (row: UserInfo) => {
  ElMessage.info('删除用户功能正在开发中...')
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-manager-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-button {
  margin-right: 8px;
}

.el-button:last-child {
  margin-right: 0;
}
</style>