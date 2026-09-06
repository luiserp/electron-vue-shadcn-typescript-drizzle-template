import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@renderer/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home' }
    },
    {
      path: '/todos',
      name: 'todos',
      component: () => import('@renderer/views/TodosView.vue'),
      meta: { title: 'Todos' }
    },
    {
      path: '/notes',
      name: 'notes',
      component: () => import('@renderer/views/NotesView.vue'),
      meta: { title: 'Notes' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@renderer/views/AboutView.vue'),
      meta: { title: 'About' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
