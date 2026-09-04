<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { useAppStore } from '@renderer/stores/app'
import { onMounted, ref } from 'vue'

const appStore = useAppStore()
const lastPath = ref('')

onMounted(() => {
  void appStore.loadInfo()
})

async function openFile(): Promise<void> {
  const result = await window.api.dialog.open({
    title: 'Open file',
    properties: ['openFile']
  })
  if (!result.canceled && result.filePaths[0]) {
    lastPath.value = result.filePaths[0]
  }
}

async function saveFile(): Promise<void> {
  const result = await window.api.dialog.save({
    title: 'Save file',
    defaultPath: 'export.txt'
  })
  if (!result.canceled && result.filePath) {
    lastPath.value = result.filePath
  }
}

async function revealPath(): Promise<void> {
  if (!lastPath.value) return
  await window.api.shell.openPath(lastPath.value)
}

const result = ref('')

async function testLocalDependency(): Promise<void> {
  const resultString = await appStore.testLocalDependency()
  result.value = resultString
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 p-4 pt-0">
    <div class="space-y-1">
      <h1 class="text-xl font-semibold">{{ appStore.name }}</h1>
      <p class="text-muted-foreground text-sm">
        Version {{ appStore.version || 'dev' }}
        ·
        {{ appStore.isPackaged ? 'Packaged' : 'Development' }}
      </p>
      <p class="text-muted-foreground text-xs">User data: {{ appStore.userDataPath }}</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button variant="outline" @click="openFile">Open file</Button>
      <Button variant="outline" @click="saveFile">Save file</Button>
      <Button variant="outline" :disabled="!lastPath" @click="revealPath">
        Reveal last path
      </Button>
    </div>

    <div class="flex flex-col gap-2">
      <p v-if="result" class="text-muted-foreground text-sm break-all">{{ result }}</p>
      <Button variant="outline" @click="testLocalDependency">Test local dependency</Button>
    </div>

    <p v-if="lastPath" class="text-muted-foreground text-sm break-all">{{ lastPath }}</p>
  </div>
</template>
