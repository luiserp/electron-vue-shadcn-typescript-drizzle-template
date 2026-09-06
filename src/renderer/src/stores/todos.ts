import type { Todo } from '@shared/ipc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTodosStore = defineStore('todos', () => {
  const items = ref<Todo[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function refresh(): Promise<void> {
    items.value = await window.api.todos.getAll()
  }

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load todos'
    } finally {
      loading.value = false
    }
  }

  async function create(title: string, description: string): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await window.api.todos.create({
        title: title.trim(),
        description: description.trim(),
        completed: false
      })
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to create todo'
    } finally {
      saving.value = false
    }
  }

  async function update(todo: Todo): Promise<void> {
    saving.value = true
    error.value = null
    try {
      await window.api.todos.update(todo.id, {
        ...todo,
        title: todo.title.trim(),
        description: todo.description.trim()
      })
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to update todo'
    } finally {
      saving.value = false
    }
  }

  async function toggleCompleted(todo: Todo): Promise<void> {
    error.value = null
    try {
      await window.api.todos.update(todo.id, { ...todo, completed: !todo.completed })
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to update todo'
    }
  }

  async function remove(id: number): Promise<void> {
    error.value = null
    try {
      await window.api.todos.delete(id)
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to delete todo'
    }
  }

  return { items, loading, saving, error, load, create, update, toggleCompleted, remove }
})
