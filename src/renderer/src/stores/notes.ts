import type { Note } from '@shared/ipc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  const items = ref<Note[]>([])
  const openTodoCount = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function refresh(): Promise<void> {
    const [notes, count] = await Promise.all([
      window.api.notes.getAll(),
      window.api.notes.openTodoCount()
    ])
    items.value = notes
    openTodoCount.value = count
  }

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load notes'
    } finally {
      loading.value = false
    }
  }

  async function create(title: string, body: string): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await window.api.notes.create({
        title: title.trim(),
        body: body.trim()
      })
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to create note'
    } finally {
      saving.value = false
    }
  }

  async function remove(id: number): Promise<void> {
    error.value = null
    try {
      await window.api.notes.delete(id)
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to delete note'
    }
  }

  return { items, openTodoCount, loading, saving, error, load, create, remove }
})
