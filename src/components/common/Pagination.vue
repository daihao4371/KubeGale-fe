<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      class="pagination-container"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :background="background"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
}

interface PaginationEmits {
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
  (e: 'pagination', params: { page: number; pageSize: number }): void
}

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true
})

const emit = defineEmits<PaginationEmits>()

const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

// 监听外部传入的page和pageSize变化
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  currentPageSize.value = val
})

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  emit('update:page', val)
  emit('pagination', { page: val, pageSize: currentPageSize.value })
}

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  currentPageSize.value = val
  currentPage.value = 1 // 重置到第一页
  emit('update:pageSize', val)
  emit('pagination', { page: 1, pageSize: val })
}
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 20px;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}
</style>