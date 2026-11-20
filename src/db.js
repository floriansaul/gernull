import Dexie from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

export const db = new Dexie('journal', { addons: [dexieCloud] })

db.version(3).stores({
  entries: 'id, createdAt, updatedAt',
})

db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false,
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

export function createEntry({ body, location }) {
  const now = Date.now()
  const entry = {
    id: crypto.randomUUID(),
    body,
    createdAt: now,
    updatedAt: now,
  }
  if (location) entry.location = location
  return db.entries.add(entry)
}

export function updateEntry(id, { body, location }) {
  return db.entries.update(id, {
    body,
    updatedAt: Date.now(),
    location,
  })
}

export function deleteEntry(id) {
  return db.entries.delete(id)
}

export async function hasLocalEntries() {
  const count = await db.entries.count()
  return count > 0
}

export function clearLocalEntries() {
  return db.entries.clear()
}
