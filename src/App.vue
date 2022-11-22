<template>
  <div class="h-100" style="position: relative">
    <Transition name="alert-fade"><Alert v-if="useAlertStore().shown" /></Transition>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import Alert from './components/Alert.vue';
import { useAlertStore } from './stores/alert';
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: var(--transition);
}

.alert-fade-enter-from {
  opacity: 0;
  transform: translateY(-100px);
}

.alert-fade-leave-to {
  opacity: 0;
}
</style>
