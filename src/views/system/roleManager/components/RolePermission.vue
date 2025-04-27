<template>
  <div class="role-permission-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="角色API" name="api">
        <div class="api-filter">
          <el-input
            v-model="filterTextName"
            placeholder="请输入API组名称"
            clearable
            @clear="handleFilterClear"
          />
          <el-input
            v-model="filterTextPath"
            placeholder="请输入API路径"
            clearable
            @clear="handleFilterClear"
          />
        </div>
        <el-tree
          ref="apiTree"
          :data="apiTreeData"
          :props="apiProps"
          show-checkbox
          node-key="onlyId"
          :default-checked-keys="apiTreeIds"
          @check="handleApiCheck"
          :filter-node-method="filterNode"
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
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllApis, getAuthorityList, updateCasbin, setDataAuthority, freshCasbin, getPolicyPathByAuthorityId } from '@/api/system/roles'
import type { Authority } from '../roleManager'

// 定义接口
interface Api {
  ID: number
  path: string
  description: string
  apiGroup: string
  method: string
  onlyId?: string
}

interface ApiGroup {
  ID: string
  description: string
  children: Api[]
}

const props = defineProps<{
  role: Authority | null
}>()

const emit = defineEmits(['close'])

// 状态定义
const activeTab = ref('api')
const dataAuthorityType = ref('current')
const saving = ref(false)
const filterTextName = ref('')
const filterTextPath = ref('')
const apiTreeIds = ref<string[]>([])

// 树形数据
const apiTreeData = ref<ApiGroup[]>([])
const roleList = ref<Authority[]>([])
const checkedResourceKeys = ref<number[]>([])

// 树形控件引用
const apiTree = ref()
const resourceTree = ref()

// 树形配置
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

// 创建API树
const buildApiTree = (apis: Api[]): ApiGroup[] => {
  const apiObj: Record<string, Api[]> = {}
  
  apis.forEach(item => {
    item.onlyId = `p:${item.path}m:${item.method}`
    if (apiObj[item.apiGroup]) {
      apiObj[item.apiGroup].push(item)
    } else {
      apiObj[item.apiGroup] = [item]
    }
  })

  return Object.entries(apiObj).map(([key, value]) => ({
    ID: key,
    description: `${key}组`,
    children: value
  }))
}

// 加载API树
const loadApiTree = async () => {
  try {
    // 获取所有API
    const res = await getAllApis()
    if (res.data?.code === 0) {
      apiTreeData.value = buildApiTree(res.data.data.apis)
      
      // 获取当前角色已授权的API
      if (props.role) {
        const policyRes = await getPolicyPathByAuthorityId({
          authorityId: props.role.authorityId
        })
        if (policyRes.data?.code === 0) {
          // 构建已授权API的唯一标识
          apiTreeIds.value = policyRes.data.data.paths.map((item: { path: string; method: string }) => 
            `p:${item.path}m:${item.method}`
          )
          // 设置树形控件的选中状态
          if (apiTree.value) {
            apiTree.value.setCheckedKeys(apiTreeIds.value)
          }
        }
      }
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

// 处理API选中
const handleApiCheck = () => {
  // 不需要在这里处理，保存时会获取选中的节点
}

// 过滤节点
const filterNode = (value: string, data: Api | ApiGroup) => {
  if (!filterTextName.value && !filterTextPath.value) return true
  
  let matchesName = true
  let matchesPath = true
  
  if (filterTextName.value) {
    matchesName = Boolean(data.description && data.description.includes(filterTextName.value))
  }
  
  if (filterTextPath.value) {
    matchesPath = Boolean('path' in data && data.path && data.path.includes(filterTextPath.value))
  }
  
  return matchesName && matchesPath
}

// 处理过滤清除
const handleFilterClear = () => {
  apiTree.value.filter('')
}

// 监听过滤条件变化
watch([filterTextName, filterTextPath], () => {
  apiTree.value.filter('')
})

// 处理资源权限选中
const handleResourceCheck = (data: Authority, checked: { checked: boolean }) => {
  if (checked.checked) {
    if (!checkedResourceKeys.value.includes(data.authorityId)) {
      checkedResourceKeys.value.push(data.authorityId)
    }
  } else {
    const index = checkedResourceKeys.value.indexOf(data.authorityId)
    if (index > -1) {
      checkedResourceKeys.value.splice(index, 1)
    }
  }
  // 如果手动选中了角色，则清空权限范围选项
  if (checked.checked) {
    dataAuthorityType.value = ''
  }
}

// 处理权限范围变化
const handleAuthorityTypeChange = (newVal: string) => {
  if (!roleList.value.length || !props.role) return

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
    // 根据当前激活的标签页执行不同的保存逻辑
    switch (activeTab.value) {
      case 'api':
        await saveApiPermissions()
        break
      case 'resource':
        await saveResourcePermissions()
        break
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存API权限
const saveApiPermissions = async () => {
  if (!props.role) {
    ElMessage.error('角色信息不存在')
    return
  }

  // 获取选中的API节点
  const checkArr = apiTree.value.getCheckedNodes(true)
  const casbinInfos = checkArr.map((item: Api) => ({
    path: item.path,
    method: item.method
  }))

  // 调用接口保存API权限
  const res = await updateCasbin({
    authorityId: props.role.authorityId,
    casbinInfos
  })

  if (res.data?.code === 0) {
    // 刷新 Casbin 规则
    try {
      await freshCasbin()
      ElMessage.success('保存API权限成功')
      emit('close')
    } catch (error) {
      console.error('刷新 Casbin 规则失败:', error)
      ElMessage.error('刷新 Casbin 规则失败')
    }
  } else {
    ElMessage.error(res.data?.msg || '保存API权限失败')
  }
}

// 保存资源权限
const saveResourcePermissions = async () => {
  if (!props.role) {
    ElMessage.error('角色信息不存在')
    return
  }

  // 构建资源权限数据
  const dataAuthorityId = checkedResourceKeys.value.map(id => ({
    authorityId: id
  }))

  // 调用接口保存资源权限
  const res = await setDataAuthority({
    authorityId: props.role.authorityId,
    dataAuthorityId
  })

  if (res.data?.code === 0) {
    // 刷新 Casbin 规则
    try {
      await freshCasbin()
      ElMessage.success('保存资源权限成功')
      emit('close')
    } catch (error) {
      console.error('刷新 Casbin 规则失败:', error)
      ElMessage.error('刷新 Casbin 规则失败')
    }
  } else {
    ElMessage.error(res.data?.msg || '保存资源权限失败')
  }
}

// 取消
const handleCancel = () => {
  emit('close')
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadApiTree(),
    loadRoleList()
  ])
})

// 监听角色变化
watch(() => props.role, async (newVal) => {
  if (newVal) {
    // 重置状态
    apiTreeIds.value = []
    checkedResourceKeys.value = []
    dataAuthorityType.value = 'current'
    // 重新加载API权限
    await loadApiTree()
  }
}, { immediate: true })
</script>

<style scoped>
.role-permission-container {
  padding: 20px;
}

.api-filter {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
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