<script setup lang="ts">
import { RouterView } from 'vue-router'
import AIAssistantEntry from '@/components/ai/AIAssistantEntry.vue'
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import { VuePlugin } from '@stagewise-plugins/vue'

const isDev = import.meta.env.DEV
</script>

<template>
  <RouterView />
  <AIAssistantEntry />
  <StagewiseToolbar v-if="isDev" :config="{ plugins: [VuePlugin] }" />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>
