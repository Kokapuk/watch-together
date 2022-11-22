<template>
  <div v-if="useDbStore().rooms.length > 0" class="center-y">
    <TransitionGroup name="list-fade">
      <div class="room mb-20" v-for="room in useDbStore().rooms" :key="room.uid">
        <span>{{ room.uid }}</span>
        <RouterLink :to="`watch/${room.uid}`"><button>Connect</button></RouterLink>
      </div>
    </TransitionGroup>
  </div>
  <div v-else-if="loading">
    <div class="room placeholder mb-20" v-for="i in 30">
      <span class="placeholder">&nbsp;</span>
      <button disabled class="placeholder">&nbsp;</button>
    </div>
  </div>
  <div v-else class="center">
    <div class="center-y">
      <h1 class="d-block mb-10 placeholder-info">No available rooms was found</h1>
      <RouterLink to="/"><button>Create one</button></RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Unsubscribe } from '@firebase/database';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useDbStore } from '../stores/db';

const loading = ref<boolean>(true);
const unsubscribeRoomListWatcher = ref<Unsubscribe | null>(null);

onBeforeMount(() => {
  loading.value = false;
  unsubscribeRoomListWatcher.value = useDbStore().watchRoomList();
});

onBeforeUnmount(() => {
  unsubscribeRoomListWatcher.value && unsubscribeRoomListWatcher.value();
  useDbStore().rooms = [];
});
</script>

<style scoped>
.room {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0px 10px 0;
}

.room.placeholder {
  animation: 2s blink infinite;
}

span.placeholder {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  width: 145px;
}

button:disabled.placeholder {
  background-color: rgba(60, 179, 114, 0.5);
  width: 97px;
}

.list-fade-move,
.list-fade-enter-active,
.list-fade-leave-active {
  transition: var(--transition);
}

.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.list-fade-leave-active {
  position: absolute;
}

@keyframes blink {
  0% {
    background-color: rgba(255, 255, 255, 0.1);
  }
  20% {
    background-color: rgba(255, 255, 255, 0.3);
  }
  40% {
    background-color: rgba(255, 255, 255, 0.1);
  }
  100% {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
