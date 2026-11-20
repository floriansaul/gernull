import { useState } from 'react'
import { useLiveQuery, useObservable } from 'dexie-react-hooks'
import EntryList from './components/EntryList'
import InstallButton from './components/InstallButton'
import MergeConfirmModal from './components/MergeConfirmModal'
import { db, listEntries, createEntry, updateEntry, deleteEntry, hasLocalEntries, clearLocalEntries } from './db'

export default function App() {
  const [editingId, setEditingId] = useState(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)

  const user = useObservable(db.cloud.currentUser)

  const entries = useLiveQuery(() => listEntries(), [])

  async function handleSubmit(body, id, location) {
    if (id) {
      await updateEntry(id, { body, location })
    } else {
      await createEntry({ body, location })
    }
    setEditingId(null)
  }

  async function handleDelete(id) {
    await deleteEntry(id)
    if (editingId === id) {
      setEditingId(null)
    }
  }

  async function handleLogin() {
    setLoggingIn(true)
    try {
      const hasEntries = await hasLocalEntries()
      if (hasEntries) {
        setShowMergeModal(true)
      } else {
        await db.cloud.login()
      }
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleMergeConfirm() {
    setShowMergeModal(false)
    setLoggingIn(true)
    try {
      await db.cloud.login()
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleDeleteLocalConfirm() {
    setShowMergeModal(false)
    setLoggingIn(true)
    try {
      await clearLocalEntries()
      await db.cloud.login()
    } finally {
      setLoggingIn(false)
    }
  }

  function handleModalClose() {
    setShowMergeModal(false)
  }

  if (!entries) {
    return <p className="text-sm text-stone-500">Loading…</p>
  }

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-6">
      <InstallButton />
      <header className="flex items-center justify-between gap-4 mb-6">
        {user?.isLoggedIn ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            disabled={loggingIn}
            className="text-sm font-medium text-stone-600 underline dark:text-stone-300 disabled:opacity-60"
          >
            {loggingIn ? 'Signing in…' : 'Sign in to sync your journal across devices'}
          </button>
        )}
      </header>
      <EntryList
        entries={entries}
        editingId={editingId}
        onSetEditing={setEditingId}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
      <footer className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
        Location data ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">
          OpenStreetMap contributors
        </a>
      </footer>
      <MergeConfirmModal
        isOpen={showMergeModal}
        onClose={handleModalClose}
        onMerge={handleMergeConfirm}
        onDeleteLocal={handleDeleteLocalConfirm}
      />
    </main>
  )
}