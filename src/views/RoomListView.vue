<template>
  <Transition name="loading-jitter" mode="out-in">
    <div v-if="useDbStore().rooms.length > 0" class="center-y">
      <div class="center mb-30">
        <h1 class="me-20">Here are some rooms for you, but you can</h1>
        <RouterLink class="me-20" to="/"><button>Create one</button></RouterLink>
        <h1 class="me-20">yourself</h1>
      </div>
      <TransitionGroup name="list-fade">
        <div class="room mb-20" v-for="room in useDbStore().rooms" :key="room.uid">
          <span class="clamped me-10">{{ room.title }}</span>
          <a :href="room.videoLink" class="clamped me-10">Original video link</a>
          <span class="text-gray me-10">{{ room.uid }}</span>
          <RouterLink :to="`watch/${room.uid}`"><button>Connect</button></RouterLink>
        </div>
      </TransitionGroup>
    </div>
    <div v-else>
      <div class="center mb-30">
        <h1 class="me-20">Waiting for rooms, but you can</h1>
        <RouterLink class="me-20" to="/"><button>Create one</button></RouterLink>
        <h1 class="me-20">yourself</h1>
      </div>
      <div class="room placeholder mb-20" v-for="i in 30">
        <span class="placeholder">&nbsp;</span>
        <span class="placeholder">&nbsp;</span>
        <span class="placeholder">&nbsp;</span>
        <button disabled class="placeholder">&nbsp;</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Unsubscribe } from '@firebase/database';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useDbStore } from '../stores/db';

const unsubscribeRoomListWatcher = ref<Unsubscribe | null>(null);

onBeforeMount(() => {
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
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
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

.clamped {
  max-width: calc(100% / 5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.loading-jitter-enter-active {
  animation: jitter 150ms;
}
.loading-jitter-leave-active {
  animation: jitter 150ms reverse;
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

@keyframes jitter {
  0% {
    transform: translate(-15px);
  }
  40% {
    transform: translate(15px);
  }
  80% {
    transform: translate(-15px);
  }
  100% {
    transform: translate(0px);
  }
}
</style>
