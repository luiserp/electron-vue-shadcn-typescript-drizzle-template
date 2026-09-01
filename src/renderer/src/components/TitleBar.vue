<script setup lang="ts">
import { Minus, Square, SquareStack, X } from '@lucide/vue'
import { onMounted, onUnmounted, ref } from 'vue'
import ModeToggle from '@renderer/components/ModeToggle.vue'
import { APP_NAME } from '@shared/constants'

const windowApi = window.api.window
const isMaximized = ref(false)
let stopListening: (() => void) | undefined

function minimize(): void {
  windowApi.minimize()
}

function maximize(): void {
  windowApi.maximize()
}

function closeWindow(): void {
  windowApi.close()
}

onMounted(async () => {
  isMaximized.value = await windowApi.isMaximized()
  stopListening = windowApi.onMaximizedChange((maximized) => {
    isMaximized.value = maximized
  })
})

onUnmounted(() => {
  stopListening?.()
})
</script>

<template>
  <header class="titlebar-drag bg-background flex h-(--titlebar-height) shrink-0 items-center border-b select-none">
    <div class="flex min-w-0 flex-1 items-center px-3">
      <span class="text-muted-foreground truncate text-xs font-medium">{{ APP_NAME }}</span>
    </div>

    <div class="titlebar-no-drag flex h-full items-center">
      <div class="mr-1">
        <ModeToggle />
      </div>
      <button type="button"
        class="text-foreground/80 hover:bg-accent inline-flex h-full w-11 items-center justify-center"
        aria-label="Minimize" title="Minimize" @click="minimize">
        <Minus class="size-3.5" />
      </button>
      <button type="button"
        class="text-foreground/80 hover:bg-accent inline-flex h-full w-11 items-center justify-center"
        :aria-label="isMaximized ? 'Restore' : 'Maximize'" :title="isMaximized ? 'Restore' : 'Maximize'"
        @click="maximize">
        <SquareStack v-if="isMaximized" class="size-3.5" />
        <Square v-else class="size-3" />
      </button>
      <button type="button"
        class="text-foreground/80 inline-flex h-full w-11 items-center justify-center hover:bg-[#e81123] hover:text-white"
        aria-label="Close" title="Close" @click="closeWindow">
        <X class="size-3.5" />
      </button>
    </div>
  </header>
</template>
