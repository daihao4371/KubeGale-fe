<template>
  <div class="cmdb-container">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CmdbIndexView'
})
</script>

<style scoped>
.cmdb-container {
  padding: 20px;
}
</style>