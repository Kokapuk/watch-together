<template>
  <div class="center">
    <div class="center-y">
      <h1 class="font-weight-700 font-size-50 mb-50">Watch Together</h1>
      <form @submit.prevent="submitHandler">
        <input v-model="videoLink" class="d-block mb-20 w-100" type="url" placeholder="Video link" required />
        <input
          v-model="videoTitle"
          class="d-block mb-20 w-100"
          type="text"
          minlength="3"
          maxlength="50"
          placeholder="Title"
          required />
        <button class="mb-10" type="submit" :disabled="createRoomDisabled">Create room</button>
        <div class="flex-break" />
        <span class="d-block mb-10 text-gray">or you can</span>
        <div class="flex-break" />
        <RouterLink to="/rooms"><button type="button">Find room</button></RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { uid } from 'uid';
import { ref } from 'vue';
import router from '../router';
import { useDbStore } from '../stores/db';

const videoLink = ref('');
const videoTitle = ref('');
const createRoomDisabled = ref(false);

onbeforeunload = null;

async function submitHandler() {
  createRoomDisabled.value = true;
  const roomUid = uid(16);

  await useDbStore().createRoom(roomUid, videoTitle.value, videoLink.value);
  console.log(`Created room with link ${videoLink.value}\n\nRoom uid: ${roomUid}`);
  router.push(`/watch/${roomUid}`);
}
</script>
