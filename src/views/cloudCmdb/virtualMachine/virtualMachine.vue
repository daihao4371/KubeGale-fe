<template>
  <div class="virtual-machine-list">
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="instance_id" label="实例ID/名称" min-width="180">
        <template #default="scope">
          <div>
            <div>{{ scope.row.instance_id }}</div>
            <div class="vm-name">{{ scope.row.name }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100" />
      <el-table-column prop="os" label="操作系统" min-width="120" />
      <el-table-column prop="region_name" label="可用区" min-width="120" />
      <el-table-column label="配置" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.cpu }}核/{{ scope.row.memory }}GB</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" min-width="160">
        <template #default="scope">
          <div>内网：{{ scope.row.private_addr }}</div>
          <div>公网：{{ scope.row.public_addr }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="expired_time" label="到期时间" min-width="160" />
    </el-table>
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { virtualMachineList } from '@/api/cloudCmdb/cloud_virtual_machine'

interface CloudPlatform {
  id: number
  name: string
  access_key_id: string
  access_key_secret: string
  platform: string
  created_at: string
  updated_at: string
}

interface VirtualMachine {
  id: number
  name: string
  instance_id: string
  cpu: number
  memory: number
  os: string
  os_type: string
  private_addr: string
  public_addr: string
  region: string
  region_name: string
  status: string
  creation_time: string
  expired_time: string
  cloud_platform_id: number
  cloud_platform: CloudPlatform
  created_at: string
  updated_at: string
}

interface VirtualMachineListResponse {
  code: number
  data: {
    list: VirtualMachine[]
    total: number
    page: number
    pageSize: number
  }
  msg: string
}

const tableData = ref<VirtualMachine[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await virtualMachineList({ page: page.value, pageSize: pageSize.value }) as VirtualMachineListResponse
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
watch([page, pageSize], fetchData)

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
}
const handlePageChange = (val: number) => {
  page.value = val
}
</script>

<style scoped>
.virtual-machine-list {
  padding: 24px;
  background: #fff;
}
.vm-name {
  color: #888;
  font-size: 12px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
