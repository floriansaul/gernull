import { useState } from 'react'
import { useLiveQuery, useObservable } from 'dexie-react-hooks'
import EntryEditor from './components/EntryEditor'
import EntryList from './components/EntryList'
import InstallButton from './components/InstallButton'
import LoginScreen from './components/LoginScreen'
import { db, listEntries } from './db'

export default function App() {
  const [view, setView] = useState('list')
  const [selectedId, setSelectedId] = useState(null)

  const user = useObservable(db.cloud.currentUser)

  const entries = useLiveQuery(() => listEntries(), [])

  if (!user?.isLoggedIn) {
    return <LoginScreen />
  }

  if (entries === undefined) {
    return <p className="text-sm text-stone-500">Loading…</p>
  }

  async function openNew() {
    setSelectedId(null)
    setView('editor')
  }

  function openEntry(id) {
    setSelectedId(id)
    setView('editor')
  }

  async function backToList() {
    setSelectedId(null)
    setView('list')
  }

  async function handleLogout() {
    await db.cloud.logout()
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
          onClick={handleLogout}
          className="text-sm font-medium text-stone-600 underline dark:text-stone-300"
        >
          Log out
        </button>
      </header>
      {view === 'list' ? (
        <EntryList entries={entries} onNew={openNew} onOpen={openEntry} />
      ) : (
        <EntryEditor entryId={selectedId} onBack={backToList} />
      )}
    </main>
  )
}
