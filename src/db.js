import Dexie from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

export const db = new Dexie('journal', { addons: [dexieCloud] })

db.version(3).stores({
  entries: 'id, createdAt, updatedAt',
})

db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: true,
})

export function listEntries() {
  return db.entries.orderBy('createdAt').reverse().toArray()
}

export function listEntryIds() {
  return db.entries.orderBy('createdAt').reverse().keys().toArray()
}

export function getEntry(id) {
  return db.entries.get(id)
}

export function createEntry({ body }) {
  const now = Date.now()
  return db.entries.add({
    id: crypto.randomUUID(),
    body,
    createdAt: now,
    updatedAt: now,
  })
}

export function updateEntry(id, { body }) {
  return db.entries.update(id, {
    body,
    updatedAt: Date.now(),
  })
}

export function deleteEntry(id) {
  return db.entries.delete(id)
}
