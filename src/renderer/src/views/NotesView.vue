<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useNotesStore } from '@renderer/stores/notes'
import { Plus, Trash2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

const notes = useNotesStore()

const title = ref('')
const body = ref('')
const canSubmit = computed(() => title.value.trim().length > 0 && !notes.saving)

onMounted(() => {
  void notes.load()
})

async function submit(): Promise<void> {
  if (!canSubmit.value) return
  await notes.create(title.value, body.value)
  if (!notes.error) {
    title.value = ''
    body.value = ''
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 overflow-auto p-4 pt-0">
    <div class="space-y-1">
      <h1 class="text-xl font-semibold">Notes</h1>
      <p class="text-muted-foreground text-sm">
        A second feature module. Notes can read todos:
        {{ notes.openTodoCount }} open
        {{ notes.openTodoCount === 1 ? 'todo' : 'todos' }}.
      </p>
    </div>

    <form class="bg-muted/40 flex flex-col gap-3 rounded-xl border p-4" @submit.prevent="submit">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="grid gap-1.5">
          <Label for="note-title">Title</Label>
          <Input
            id="note-title"
            v-model="title"
            placeholder="Note title"
            :disabled="notes.saving"
          />
        </div>
        <div class="grid gap-1.5">
          <Label for="note-body">Body</Label>
          <Input
            id="note-body"
            v-model="body"
            placeholder="Optional text"
            :disabled="notes.saving"
          />
        </div>
      </div>
      <div>
        <Button type="submit" :disabled="!canSubmit">
          <Plus />
          Add note
        </Button>
      </div>
    </form>

    <p v-if="notes.error" class="text-destructive text-sm">{{ notes.error }}</p>

    <div v-if="notes.loading" class="flex flex-col gap-2">
      <Skeleton class="h-16 rounded-xl" />
      <Skeleton class="h-16 rounded-xl" />
    </div>

    <p
      v-else-if="notes.items.length === 0"
      class="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm"
    >
      No notes yet. Add one above to get started.
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="note in notes.items"
        :key="note.id"
        class="bg-muted/40 flex items-start gap-3 rounded-xl border p-3"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ note.title }}</p>
          <p v-if="note.body" class="text-muted-foreground truncate text-sm">{{ note.body }}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Delete note"
          @click="notes.remove(note.id)"
        >
          <Trash2 />
        </Button>
      </li>
    </ul>
  </div>
</template>
