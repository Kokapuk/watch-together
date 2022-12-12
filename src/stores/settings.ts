import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  actions: {
    setVolume(volume: number) {
      localStorage.setItem('volume', JSON.stringify(volume));
    },
    getVolume(): number {
      return localStorage.getItem('volume') !== null ? JSON.parse(localStorage.getItem('volume')!) : 0.5;
    },
  },
});
