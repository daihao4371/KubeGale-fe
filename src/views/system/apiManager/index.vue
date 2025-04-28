<template>
  <ApiManager />
</template>

<script setup lang="ts">
import ApiManager from './apiManager.vue'
</script>

<style scoped>
.api-manager-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-data {
  margin: 40px 0;
}
</style>