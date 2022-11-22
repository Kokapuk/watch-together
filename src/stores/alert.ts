import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => {
    return { shown: false, content: '', timeoutId: 0, color: 'ok' };
  },
  actions: {
    show(content: string, color: string) {
      clearTimeout(this.timeoutId);

      this.content = content;
      this.color = color;
      this.shown = true;
      this.timeoutId = setTimeout(() => {
        this.shown = false;
      }, 3000);
    },
  },
});
