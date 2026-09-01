<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { useTheme } from '@renderer/composables/useTheme'

const mode = useTheme()

const nextMode = {
  light: 'dark',
  dark: 'auto',
  auto: 'light'
} as const

const label = computed(() => {
  if (mode.value === 'dark') return 'Dark'
  if (mode.value === 'auto') return 'System'
  return 'Light'
})

function cycleTheme(): void {
  mode.value = nextMode[mode.value] ?? 'light'
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon-sm"
    :title="`Theme: ${label}`"
    @click="cycleTheme"
  >
    <Sun v-if="mode === 'light'" class="size-4" />
    <Moon v-else-if="mode === 'dark'" class="size-4" />
    <Monitor v-else class="size-4" />
    <span class="sr-only">Cycle theme</span>
  </Button>
</template>
