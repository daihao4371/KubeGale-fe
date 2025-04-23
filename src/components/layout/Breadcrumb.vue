<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'

interface BreadcrumbItem {
  path: string
  meta: {
    title: string
    [key: string]: any
  }
}

const route = useRoute()
const breadcrumbs = ref<BreadcrumbItem[]>([])

const getBreadcrumbs = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  const result = matched.map(item => {
    return {
      path: item.path,
      meta: { 
        title: item.meta.title as string,
        ...item.meta 
      }
    } as BreadcrumbItem
  })
  
  breadcrumbs.value = result
}

watch(
  () => route.path,
  () => getBreadcrumbs(),
  { immediate: true }
)
</script>

<style scoped>
.el-breadcrumb {
  margin-left: 8px;
  line-height: 60px;
}
</style>