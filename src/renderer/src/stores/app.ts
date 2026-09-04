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

  async function testLocalDependency(): Promise<string> {
    const result = await window.api.app.testLocalDependency()
    return result;
  }

  return { name, version, isPackaged, userDataPath, loadInfo, testLocalDependency }
})
