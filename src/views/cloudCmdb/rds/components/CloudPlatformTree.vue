<template>
  <div class="platform-region-tree-select">
    <el-input
      v-model="searchKeyword"
      placeholder="搜索云平台/区域"
      clearable
      class="search-input"
    />
    <el-tree
      ref="treeRef"
      :data="filteredTreeData"
      :props="defaultProps"
      node-key="id"
      highlight-current
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      :filter-node-method="filterNode"
      default-expand-all
    >
      <template #default="{ data }">
        <span>
          <el-tag v-if="!data.region_id" size="small" type="info">{{ data.name }}</el-tag>
          <span v-else>{{ data.region_name }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getPlatformRegionTree } from '@/api/cloudCmdb/cloud_rds'
import type { PlatformRegionTreeItem, RegionNode } from '@/api/cloudCmdb/cloud_rds'

const emit = defineEmits<{
  (e: 'select', payload: { platform: PlatformRegionTreeItem, region: RegionNode | null }): void
}>()

const treeRef = ref()
const treeData = ref<PlatformRegionTreeItem[]>([])
const searchKeyword = ref('')

// el-tree 配置
const defaultProps = {
  children: 'children',
  label: (data: PlatformRegionTreeItem | RegionNode) => 'region_name' in data ? data.region_name : data.name
}

// 加载数据并转换结构
const loadTreeData = async () => {
  const res = await getPlatformRegionTree()
  if (res.code === 0) {
    // 转换 region 为 children
    treeData.value = res.data.map(platform => ({
      ...platform,
      children: (platform.region || []).map(region => ({
        ...region,
        parentPlatform: platform
      }))
    }))
  }
}
onMounted(loadTreeData)

// 搜索过滤
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) return treeData.value
  const keyword = searchKeyword.value.toLowerCase()
  return treeData.value
    .map(platform => {
      const p = platform as PlatformRegionTreeItem & { children?: RegionNode[] }
      const matchedChildren = (p.children || []).filter(
        (region: RegionNode) =>
          region.region_name.toLowerCase().includes(keyword) ||
          region.region_id.toLowerCase().includes(keyword)
      )
      if (
        p.name.toLowerCase().includes(keyword) ||
        matchedChildren.length
      ) {
        return {
          ...p,
          children: matchedChildren
        }
      }
      return null
    })
    .filter(Boolean)
})

// 过滤节点
const filterNode = (value: string, data: PlatformRegionTreeItem | RegionNode) => {
  if (!value) return true
  if ('region_name' in data) {
    return (
      data.region_name.toLowerCase().includes(value.toLowerCase()) ||
      data.region_id.toLowerCase().includes(value.toLowerCase())
    )
  }
  return data.name.toLowerCase().includes(value.toLowerCase())
}

// 处理节点点击
const handleNodeClick = (data: PlatformRegionTreeItem | (RegionNode & { parentPlatform: PlatformRegionTreeItem })) => {
  if ('region_id' in data && data.parentPlatform) {
    // 区域节点
    emit('select', { platform: data.parentPlatform, region: data })
  } else if (!('region_id' in data)) {
    // 平台节点
    emit('select', { platform: data, region: null })
  }
}
</script>

<style scoped>
.platform-region-tree-select {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search-input {
  margin-bottom: 8px;
}
</style> 