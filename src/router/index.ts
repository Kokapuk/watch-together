import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { documentTitle: 'Watch Together' },
    },
    {
      path: '/watch/:id',
      name: 'watch',
      component: () => import('../views/WatchView.vue'),
      meta: { documentTitle: 'Room' },
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: () => import('../views/RoomListView.vue'),
      meta: { documentTitle: 'Room List' },
    },
  ],
});

router.beforeEach((to) => {
  document.title = to.meta.documentTitle as string;
});

export default router;
