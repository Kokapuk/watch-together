<template>
  <div class="center">
    <div class="center-y container" v-if="loading">
      <div class="flex-center-y mb-10">
        <div class="title-placeholoder"></div>
      </div>
      <div class="video-placeholoder video"></div>
    </div>
    <div v-else-if="videoLink" class="container center-y">
      <h1 class="mb-10">{{ videoTitle }}</h1>
      <video
        v-if="!deletingRoom"
        class="mb-10 d-block video"
        ref="videoElement"
        @play="playHandler"
        @pause="pauseHandler"
        @seeked="seekHandler"
        @volumechange="volumeChangeHandler"
        @canplay="canPlayHandler"
        :src="videoLink!"
        controls
        controlsList="noplaybackrate nodownload" />
      <button :disabled="deletingRoom" @click="syncHandler" class="me-10 mb-10">Sync</button>
      <button :disabled="deletingRoom" @click="deleteRoomHandler" class="danger me-10 mb-10">Delete room</button>
      <button :disabled="deletingRoom" class="danger" @click="() => router.push('/')">Leave the room</button>
    </div>
    <div v-else class="center-y">
      <h1 class="mb-10 placeholder-info">Room doesn't exist</h1>
      <RouterLink to="/"><button>Create one</button></RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { uid } from 'uid';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import router from '../router';
import { RouterLink, useRoute } from 'vue-router';
import { useDbStore } from '../stores/db';
import { useSettingsStore } from '../stores/settings';
import type { IAction, IRoom } from '../types/interfaces';
import { ActionType } from '../types/enums';
import { useAlertStore } from '../stores/alert';

const route = useRoute();
const dbStore = useDbStore();
const trustedPlay = ref(true);
const trustedPause = ref(true);
const trustedSeek = ref(true);
const trustedCanPlay = ref(false);
const deletingRoom = ref(false);
const videoElement = ref<HTMLMediaElement | null>(null);
const uuid = uid(20);
const roomUid = ref<string | null>(null);
const videoLink = ref<string | null>(null);
const videoTitle = ref<string | null>(null);
const room = ref<IRoom | null>(null);
const loading = ref(true);

onBeforeMount(async () => {
  roomUid.value = route.params.id as string;
  room.value = await dbStore.getRoom(roomUid.value);
  videoLink.value = room.value !== null ? room.value.videoLink : null;
  videoTitle.value = room.value !== null ? room.value.title : null;

  if (videoLink.value !== null) dbStore.watchLastAction(roomUid.value, uuid);

  loading.value = false;
});

onBeforeUnmount(async () => notifyLeave());

watch(
  () => dbStore.$state,
  () => {
    if (dbStore.uuid === uuid) return;

    if (dbStore.type === ActionType.play) {
      console.log('DB_PLAY');
      emitPlay();
    } else if (dbStore.type === ActionType.pause) {
      console.log('DB_PAUSE');
      emitPause();
    } else if (dbStore.type === ActionType.seek) {
      console.log('DB_SEEK');

      if (!videoElement.value!.paused) trustedCanPlay.value = true;

      trustedSeek.value = false;
      videoElement.value!.currentTime = dbStore.position as number;
    } else if (dbStore.type === ActionType.join) {
      console.log('DB_JOIN');

      trustedPause.value = false;

      videoElement.value!.pause();
      syncHandler();
      console.log('sync');
      useAlertStore().show('Someone joined the room!', 'ok');
    } else if (dbStore.type === ActionType.kick) {
      console.log('DB_KICK');

      deletingRoom.value = true;
      useAlertStore().show('Room has been deleted!', 'danger');
      router.push('/');
    } else if (dbStore.type === ActionType.leave) {
      console.log('DB_LEAVE');
      useAlertStore().show('Someone left the room!', 'danger');
    }
  },
  { deep: true }
);

watch(
  () => videoElement.value,
  () => {
    if (deletingRoom.value) return;

    videoElement.value!.volume = useSettingsStore().getVolume();
  }
);

async function playHandler() {
  console.log(`Play: ${videoElement.value!.currentTime} ${trustedPlay.value} ${uuid}`);

  if (trustedPlay.value) {
    const action: IAction = { type: ActionType.play, position: videoElement.value!.currentTime, uuid };
    await dbStore.setLastAction(action, roomUid.value!);
  } else {
    trustedPlay.value = true;
  }
}

async function pauseHandler() {
  if (deletingRoom.value) return;

  console.log(`Pause: ${videoElement.value!.currentTime} ${trustedPause.value} ${uuid}`);

  if (trustedPause.value) {
    const action: IAction = { type: ActionType.pause, position: videoElement.value!.currentTime, uuid };
    await dbStore.setLastAction(action, roomUid.value!);
  } else {
    trustedPause.value = true;
  }
}

async function seekHandler() {
  console.log(`Seek: ${videoElement.value!.currentTime} ${trustedSeek.value} ${uuid}`);

  if (trustedSeek.value) {
    const action: IAction = { type: ActionType.seek, position: videoElement.value!.currentTime, uuid };
    await dbStore.setLastAction(action, roomUid.value!);
    trustedCanPlay.value = false;
  } else {
    trustedSeek.value = true;
  }
}

function canPlayHandler() {
  console.log(`Can play: ${videoElement.value!.currentTime} ${uuid}`);

  if (trustedCanPlay.value) {
    trustedPlay.value = true;

    emitPause();
    videoElement.value!.play();
    trustedCanPlay.value = false;
  }
}

async function syncHandler() {
  console.log(`Sync: ${videoElement.value!.currentTime} ${uuid}`);

  const action: IAction = { type: ActionType.seek, position: videoElement.value!.currentTime, uuid };
  await dbStore.setLastAction(action, roomUid.value!);
}

async function deleteRoomHandler() {
  deletingRoom.value = true;

  await dbStore.setLastAction({ type: ActionType.kick, position: 0, uuid }, roomUid.value!);
  await dbStore.deleteRoom(roomUid.value!);
  console.log(`Deleted: ${route.params.id}`);
  await router.push('/');
}

function volumeChangeHandler() {
  console.log(`Volume change: ${videoElement.value!.volume} ${uuid}`);

  useSettingsStore().setVolume(videoElement.value!.volume);
}

function emitPlay() {
  trustedSeek.value = false;
  trustedPlay.value = false;

  videoElement.value!.currentTime = dbStore.position as number;
  videoElement.value!.play();
}

function emitPause() {
  trustedSeek.value = false;
  trustedPause.value = false;

  videoElement.value!.currentTime = dbStore.position as number;
  videoElement.value!.pause();
}

async function notifyLeave() {
  if (!deletingRoom.value && videoLink.value) {
    deletingRoom.value = true;
    const leaveAction: IAction = { type: ActionType.leave, position: 0, uuid };

    await dbStore.setLastAction(leaveAction, roomUid.value!);
  }
}
</script>

<style scoped>
.title-placeholoder {
  height: 30px;
  width: 35%;
  background-color: rgb(255, 255, 255, 0.2);
  border-radius: 25px;
  animation: 1s blink infinite;
}

.video-placeholoder {
  background-color: rgb(255, 255, 255, 0.2);
  border-radius: 15px;
  animation: 1s blink infinite;
}

.container {
  position: relative;
}

.video {
  width: 64vw;
  height: 36vw;
}

@keyframes blink {
  0% {
    background-color: rgb(255, 255, 255, 0.2);
  }
  20% {
    background-color: rgb(255, 255, 255, 0.4);
  }
  40% {
    background-color: rgb(255, 255, 255, 0.2);
  }
  100% {
    background-color: rgb(255, 255, 255, 0.2);
  }
}
</style>
