import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { initializeApp } from 'firebase/app';

import App from './App.vue';
import router from './router';

import './assets/styles/main.css';

initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'watch-together-1c3b2.firebaseapp.com',
  databaseURL: 'https://watch-together-1c3b2-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'watch-together-1c3b2',
  storageBucket: 'watch-together-1c3b2.appspot.com',
  messagingSenderId: '1061976424753',
  appId: '1:1061976424753:web:c49c5877f9feb58ceb3010',
});

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
