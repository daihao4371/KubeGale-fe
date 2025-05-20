<template>
  <div class="cloud-assets-container">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CloudAssetsLayout'
})
</script>

<style scoped>
.cloud-assets-container {
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style> 