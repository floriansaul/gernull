import Dexie from 'dexie'

export const db = new Dexie('journal')

db.version(1).stores({
  entries: '++id, updatedAt',
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
