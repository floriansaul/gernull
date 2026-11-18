import Dexie from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

export const db = new Dexie('journal', { addons: [dexieCloud] })

db.version(2).stores({
  entries: 'id, updatedAt',
})

db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: true,
})

export function listEntries() {
  return db.entries.orderBy('updatedAt').reverse().toArray()
}

export function getEntry(id) {
  return db.entries.get(id)
}

export function createEntry({ title, body }) {
  const now = Date.now()
  return db.entries.add({
    id: crypto.randomUUID(),
    title,
    body,
    createdAt: now,
    updatedAt: now,
  })
}

export function updateEntry(id, { title, body }) {
  return db.entries.update(id, {
    title,
    body,
    updatedAt: Date.now(),
  })
}

export function deleteEntry(id) {
  return db.entries.delete(id)
}
