<template>
  <div class="role-permission-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="角色菜单" name="menu">
        <el-tree
          ref="menuTree"
          :data="menuTreeData"
          :props="defaultProps"
          show-checkbox
          node-key="ID"
          :default-checked-keys="checkedMenuKeys"
          @check="handleMenuCheck"
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <span>{{ data.meta?.title || data.name }}</span>
              <span class="node-path">{{ data.path }}</span>
            </span>
          </template>
        </el-tree>
      </el-tab-pane>

      <el-tab-pane label="角色API" name="api">
        <el-tree
          ref="apiTree"
          :data="apiTreeData"
          :props="apiProps"
          show-checkbox
          node-key="ID"
          :default-checked-keys="checkedApiKeys"
          @check="handleApiCheck"
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <span>{{ data.description }}</span>
              <span class="node-path">{{ data.path }}</span>
              <el-tag size="small" :type="getMethodType(data.method)">{{ data.method }}</el-tag>
            </span>
          </template>
        </el-tree>
      </el-tab-pane>

      <el-tab-pane label="资源权限" name="resource">
        <div class="resource-permission">
          <el-radio-group v-model="dataAuthorityType" @change="handleAuthorityTypeChange">
            <el-radio label="all" @dblclick="handleDoubleClick">全选</el-radio>
            <el-radio label="current" @dblclick="handleDoubleClick">本角色</el-radio>
            <el-radio label="currentAndSub" @dblclick="handleDoubleClick">本角色及子角色</el-radio>
          </el-radio-group>
          <el-tree
            ref="resourceTree"
            :data="roleList"
            :props="resourceProps"
            show-checkbox
            node-key="authorityId"
            :default-checked-keys="checkedResourceKeys"
            @check="handleResourceCheck"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="permission-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBaseMenuTree, getMenuAuthority, getAllApis, getPolicyPathByAuthorityId, setDataAuthority, getAuthorityList } from '@/api/system/roles'
import type { Authority } from '../roleManager'

// 定义接口
interface Menu {
  ID: number
  name: string
  path: string
  meta?: {
    title: string
  }
  children?: Menu[]
}

interface Api {
  ID: number
  path: string
  description: string
  apiGroup: string
  method: string
}

interface ApiGroup {
  ID: string
  description: string
  children: Api[]
}

const props = defineProps<{
  role: Authority
}>()

const emit = defineEmits(['close'])

// 状态定义
const activeTab = ref('menu')
const dataAuthorityType = ref('current')
const saving = ref(false)

// 树形数据
const menuTreeData = ref<Menu[]>([])
const apiTreeData = ref<ApiGroup[]>([])
const checkedMenuKeys = ref<number[]>([])
const checkedApiKeys = ref<number[]>([])
const checkedResourceKeys = ref<number[]>([])
const roleList = ref<Authority[]>([])

// 树形配置
const defaultProps = {
  children: 'children',
  label: 'name'
}

const apiProps = {
  children: 'children',
  label: 'description'
}

const resourceProps = {
  children: 'children',
  label: 'authorityName'
}

// 获取方法类型对应的标签样式
const getMethodType = (method: string) => {
  const types: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return types[method] || 'info'
}

// 加载菜单树
const loadMenuTree = async () => {
  try {
    const res = await getBaseMenuTree()
    if (res.data?.code === 0) {
      menuTreeData.value = res.data.data.menus
    }
  } catch (error) {
    console.error('加载菜单树失败:', error)
    ElMessage.error('加载菜单树失败')
  }
}

// 加载API树
const loadApiTree = async () => {
  try {
    const res = await getAllApis()
    if (res.data?.code === 0) {
      // 按apiGroup分组
      const groups = res.data.data.apis.reduce((acc: Record<string, Api[]>, api: Api) => {
        if (!acc[api.apiGroup]) {
          acc[api.apiGroup] = []
        }
        acc[api.apiGroup].push(api)
        return acc
      }, {})

      // 转换为树形结构
      apiTreeData.value = Object.entries(groups).map(([group, apis]) => ({
        ID: group,
        description: group,
        children: apis as Api[]
      }))
    }
  } catch (error) {
    console.error('加载API树失败:', error)
    ElMessage.error('加载API树失败')
  }
}

// 加载角色列表
const loadRoleList = async () => {
  try {
    const res = await getAuthorityList()
    if (res.data?.code === 0) {
      roleList.value = res.data.data
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  }
}

// 加载已选中的权限
const loadCheckedPermissions = async () => {
  try {
    // 加载菜单权限
    const menuRes = await getMenuAuthority({ authorityId: props.role.authorityId })
    if (menuRes.data?.code === 0) {
      checkedMenuKeys.value = menuRes.data.data.menus.map((menu: Menu) => menu.ID)
    }

    // 加载API权限
    const apiRes = await getPolicyPathByAuthorityId({ authorityId: props.role.authorityId })
    if (apiRes.data?.code === 0) {
      checkedApiKeys.value = apiRes.data.data.paths.map((path: Api) => path.ID)
    }
  } catch (error) {
    console.error('加载权限失败:', error)
    ElMessage.error('加载权限失败')
  }
}

// 处理菜单选中
const handleMenuCheck = (data: Menu, checked: { checked: boolean }) => {
  console.log('菜单选中变化:', data, checked)
}

// 处理API选中
const handleApiCheck = (data: Api, checked: { checked: boolean }) => {
  console.log('API选中变化:', data, checked)
}

// 处理资源权限选中
const handleResourceCheck = (data: Authority, checked: { checked: boolean }) => {
  // 如果手动选中了角色，则清空权限范围选项
  if (checked.checked) {
    dataAuthorityType.value = ''
  }
}

// 处理权限范围变化
const handleAuthorityTypeChange = (newVal: string) => {
  if (!roleList.value.length) return

  // 如果是从空值切换到某个选项，需要先清空已选中的角色
  if (dataAuthorityType.value === '' && newVal !== '') {
    checkedResourceKeys.value = []
  }

  switch (newVal) {
    case 'all':
      // 全选时，选中所有角色
      checkedResourceKeys.value = getAllRoleIds(roleList.value)
      break
    case 'current':
      // 本角色时，选中当前角色及其所有子角色
      const currentRole = findRoleById(roleList.value, props.role.authorityId)
      if (currentRole) {
        checkedResourceKeys.value = [currentRole.authorityId]
        if (currentRole.children && currentRole.children.length > 0) {
          checkedResourceKeys.value.push(...getAllRoleIds(currentRole.children))
        }
      }
      break
    case 'currentAndSub':
      // 本角色及子角色时，选中当前角色及其所有子角色
      const role = findRoleById(roleList.value, props.role.authorityId)
      if (role) {
        checkedResourceKeys.value = [role.authorityId]
        if (role.children && role.children.length > 0) {
          checkedResourceKeys.value.push(...getAllRoleIds(role.children))
        }
      }
      break
    default:
      // 其他情况，清空选中
      checkedResourceKeys.value = []
      break
  }
}

// 处理双击事件
const handleDoubleClick = () => {
  checkedResourceKeys.value = []
}

// 获取所有角色ID
const getAllRoleIds = (roles: Authority[]): number[] => {
  return roles.reduce((ids: number[], role: Authority) => {
    ids.push(role.authorityId)
    if (role.children) {
      ids.push(...getAllRoleIds(role.children))
    }
    return ids
  }, [])
}

// 根据ID查找角色
const findRoleById = (roles: Authority[], id: number): Authority | null => {
  for (const role of roles) {
    if (role.authorityId === id) {
      return role
    }
    if (role.children) {
      const found = findRoleById(role.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 保存权限设置
const handleSave = async () => {
  saving.value = true
  try {
    // 保存数据权限
    if (dataAuthorityType.value !== 'all') {
      const dataAuthorityIds = checkedResourceKeys.value.map(id => ({ authorityId: id }))
      await setDataAuthority({
        authorityId: props.role.authorityId,
        dataAuthorityId: dataAuthorityIds
      })
    }

    ElMessage.success('保存成功')
    emit('close')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('close')
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadMenuTree(),
    loadApiTree(),
    loadRoleList(),
    loadCheckedPermissions()
  ])
})
</script>

<style scoped>
.role-permission-container {
  padding: 20px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-path {
  color: #909399;
  margin: 0 8px;
}

.resource-permission {
  margin-top: 20px;
}

.permission-footer {
  margin-top: 20px;
  text-align: right;
}
</style> 