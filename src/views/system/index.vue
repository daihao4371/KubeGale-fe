<template>
  <div class="system-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 无需额外逻辑
</script>

<style scoped>
.system-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  border: none; /* 确保没有边框 */
}
</style>