<script setup lang="ts">
import AppSidebar from '@renderer/components/AppSidebar.vue'
import TitleBar from '@renderer/components/TitleBar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@renderer/components/ui/breadcrumb'
import { Separator } from '@renderer/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@renderer/components/ui/sidebar'
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' ? title : 'Home'
})
</script>

<template>
  <div class="flex h-svh flex-col overflow-hidden">
    <TitleBar />
    <SidebarProvider class="min-h-0 flex-1 overflow-hidden">
      <AppSidebar />
      <SidebarInset>
        <header class="flex h-12 shrink-0 items-center gap-2">
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink as-child>
                    <RouterLink to="/">Home</RouterLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <template v-if="route.name !== 'home'">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{{ pageTitle }}</BreadcrumbPage>
                  </BreadcrumbItem>
                </template>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <RouterView />
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
