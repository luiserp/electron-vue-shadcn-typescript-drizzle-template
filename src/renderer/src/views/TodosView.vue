<script setup lang="ts">
import type { Todo } from '@shared/ipc'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useTodosStore } from '@renderer/stores/todos'
import { Check, Pencil, Plus, Trash2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

const todos = useTodosStore()

const title = ref('')
const description = ref('')
const editingId = ref<number | null>(null)

const canSubmit = computed(() => title.value.trim().length > 0 && !todos.saving)
const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  void todos.load()
})

function resetForm(): void {
  title.value = ''
  description.value = ''
  editingId.value = null
}

function startEdit(todo: Todo): void {
  editingId.value = todo.id
  title.value = todo.title
  description.value = todo.description
}

async function submit(): Promise<void> {
  if (!canSubmit.value) return

  if (editingId.value === null) {
    await todos.create(title.value, description.value)
  } else {
    const current = todos.items.find((item) => item.id === editingId.value)
    if (!current) return
    await todos.update({
      ...current,
      title: title.value,
      description: description.value
    })
  }

  if (!todos.error) {
    resetForm()
  }
}

async function remove(todo: Todo): Promise<void> {
  if (editingId.value === todo.id) {
    resetForm()
  }
  await todos.remove(todo.id)
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 overflow-auto p-4 pt-0">
    <div class="space-y-1">
      <h1 class="text-xl font-semibold">Todos</h1>
      <p class="text-muted-foreground text-sm">Create, complete, and manage tasks stored locally.</p>
    </div>

    <form class="bg-muted/40 flex flex-col gap-3 rounded-xl border p-4" @submit.prevent="submit">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="grid gap-1.5">
          <Label for="todo-title">Title</Label>
          <Input
            id="todo-title"
            v-model="title"
            placeholder="What needs to be done?"
            :disabled="todos.saving"
          />
        </div>
        <div class="grid gap-1.5">
          <Label for="todo-description">Description</Label>
          <Input
            id="todo-description"
            v-model="description"
            placeholder="Optional details"
            :disabled="todos.saving"
          />
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="submit" :disabled="!canSubmit">
          <Plus v-if="!isEditing" />
          <Check v-else />
          {{ isEditing ? 'Save changes' : 'Add todo' }}
        </Button>
        <Button v-if="isEditing" type="button" variant="ghost" :disabled="todos.saving" @click="resetForm">
          Cancel
        </Button>
      </div>
    </form>

    <p v-if="todos.error" class="text-destructive text-sm">{{ todos.error }}</p>

    <div v-if="todos.loading" class="flex flex-col gap-2">
      <Skeleton class="h-16 rounded-xl" />
      <Skeleton class="h-16 rounded-xl" />
      <Skeleton class="h-16 rounded-xl" />
    </div>

    <p
      v-else-if="todos.items.length === 0"
      class="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm"
    >
      No todos yet. Add one above to get started.
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="todo in todos.items"
        :key="todo.id"
        class="bg-muted/40 flex items-start gap-3 rounded-xl border p-3"
        :class="todo.completed ? 'opacity-70' : ''"
      >
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          class="mt-0.5 shrink-0"
          :aria-pressed="todo.completed"
          :aria-label="todo.completed ? 'Mark as not done' : 'Mark as done'"
          @click="todos.toggleCompleted(todo)"
        >
          <Check v-if="todo.completed" />
        </Button>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium" :class="todo.completed ? 'text-muted-foreground line-through' : ''">
            {{ todo.title }}
          </p>
          <p v-if="todo.description" class="text-muted-foreground truncate text-sm">
            {{ todo.description }}
          </p>
        </div>
        <div class="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit todo"
            :disabled="todos.saving"
            @click="startEdit(todo)"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete todo"
            :disabled="todos.saving"
            @click="remove(todo)"
          >
            <Trash2 />
          </Button>
        </div>
      </li>
    </ul>
  </div>
</template>
