import { useState } from 'react'
import { useLiveQuery, useObservable } from 'dexie-react-hooks'
import EntryList from './components/EntryList'
import InstallButton from './components/InstallButton'
import LoginScreen from './components/LoginScreen'
import { db, listEntries, createEntry, updateEntry, deleteEntry } from './db'

export default function App() {
  const [editingId, setEditingId] = useState(null)

  const user = useObservable(db.cloud.currentUser)

  // Revert to original working approach
  const entries = useLiveQuery(() => listEntries(), [])

  async function handleSubmit(body, id) {
    if (id) {
      await updateEntry(id, { body })
    } else {
      await createEntry({ body })
    }
    setEditingId(null)
  }

  async function handleDelete(id) {
    await deleteEntry(id)
    if (editingId === id) {
      setEditingId(null)
    }
  }

  if (!user?.isLoggedIn) {
    return <LoginScreen />
  }

  if (!entries) {
    return <p className="text-sm text-stone-500">Loading…</p>
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-6">
      <InstallButton />
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            {user.email}
          </span>
        </div>
        <button
          type="button"
          onClick={() => db.cloud.logout()}
          className="text-sm font-medium text-stone-600 underline dark:text-stone-300"
        >
          Log out
        </button>
      </header>
      <EntryList
        entries={entries}
        editingId={editingId}
        onSetEditing={setEditingId}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </main>
  )
}