<script setup lang="ts">
import type { SidebarProps } from '@renderer/components/ui/sidebar';
import { House, Info, ListTodo, StickyNote } from '@lucide/vue';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@renderer/components/ui/sidebar';
import { RouterLink, useRoute } from 'vue-router';

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
})

const route = useRoute()

const items = [
  { title: 'Home', to: '/', name: 'home', icon: House },
  { title: 'Todos', to: '/todos', name: 'todos', icon: ListTodo },
  { title: 'Notes', to: '/notes', name: 'notes', icon: StickyNote },
  { title: 'About', to: '/about', name: 'about', icon: Info }
] as const
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in items" :key="item.name">
            <SidebarMenuButton as-child :tooltip="item.title" :is-active="route.name === item.name">
              <RouterLink :to="item.to">
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
