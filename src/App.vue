<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
body {
  /* font-family is now primarily managed by src/assets/base.css */
  /* margin and padding are also handled by base.css or component-specific styles */
}

#app {
  width: 100%;
  height: 100vh;
}
</style>
