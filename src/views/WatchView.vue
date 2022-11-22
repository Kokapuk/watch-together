<template>
  <div class="center">
    <div v-if="videoLink" class="container center-y">
      <video
        v-if="!deletingRoom"
        class="mb-10 d-block video"
        ref="videoElement"
        @play="playHandler"
        @pause="pauseHandler"
        @seeked="seekHandler"
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
import { onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import router from '../router';
import { useRoute } from 'vue-router';
import { useDbStore } from '../stores/db';
import type { IAction } from '../types/interfaces';
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

onBeforeMount(async () => {
  roomUid.value = route.params.id as string;
  videoLink.value = await dbStore.getVideoLink(roomUid.value);

  if (videoLink.value) dbStore.watchLastAction(roomUid.value, uuid);
});

onBeforeUnmount(async () => {
  if (!deletingRoom.value && videoLink.value) {
    deletingRoom.value = true;
    const leaveAction: IAction = { type: ActionType.leave, position: 0, uuid };

    await dbStore.setLastAction(leaveAction, roomUid.value!);
  }
});

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

      trustedSeek.value = false;
      trustedCanPlay.value = true;
      videoElement.value!.currentTime = dbStore.position as number;
    } else if (dbStore.type === ActionType.join) {
      console.log('DB_JOIN');
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
</script>

<style scoped>
.container {
  position: relative;
}

.video {
  width: 64vw;
  height: 36vw;
}
</style>
