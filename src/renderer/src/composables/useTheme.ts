import { useColorMode } from '@vueuse/core'

export function useTheme() {
  return useColorMode({
    selector: 'html',
    attribute: 'class',
    storageKey: 'asa-theme',
    emitAuto: true
  })
}
