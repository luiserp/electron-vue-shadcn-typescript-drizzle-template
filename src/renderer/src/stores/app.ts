import { defineStore } from 'pinia'
import { ref } from 'vue'
import { APP_NAME } from '@shared/constants'

export const useAppStore = defineStore('app', () => {
  const name = ref(APP_NAME)
  const version = ref('')
  const isPackaged = ref(false)
  const userDataPath = ref('')

  async function loadInfo(): Promise<void> {
    const info = await window.api.app.getInfo()
    name.value = info.name
    version.value = info.version
    isPackaged.value = info.isPackaged
    userDataPath.value = info.userDataPath
  }

  return { name, version, isPackaged, userDataPath, loadInfo }
})
