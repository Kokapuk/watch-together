<template>
  <div class="alert" :class="useAlertStore().color">
    <h3 class="alert-text">{{ useAlertStore().content }}</h3>
  </div>
</template>

<script setup lang="ts">
import { useAlertStore } from '../stores/alert';
</script>

<style scoped>
.alert {
  z-index: 1;
  position: absolute;
  width: 100%;
  background-color: rgba(60, 179, 114, 0.3);
  color: rgba(255, 255, 255, 0.75);
  padding: 15px 30px;
  border-radius: 75px;
  backdrop-filter: blur(5px);
  transition: var(--transition);
}

.alert-text {
  font-weight: 400;
}

.alert.ok {
  background-color: rgba(60, 179, 114, 0.3);
}

.alert.danger {
  background-color: rgba(220, 20, 60, 0.35);
}
</style>
