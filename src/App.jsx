import { useCallback, useEffect, useState } from 'react'
import EntryEditor from './components/EntryEditor'
import EntryList from './components/EntryList'
import { listEntries } from './db'

export default function App() {
  const [view, setView] = useState('list')
  const [selectedId, setSelectedId] = useState(null)
  const [entries, setEntries] = useState([])

  const refresh = useCallback(async () => {
    setEntries(await listEntries())
  }, [])

  useEffect(() => {
    let cancelled = false
    listEntries().then((next) => {
      if (!cancelled) setEntries(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function openNew() {
    setSelectedId(null)
    setView('editor')
  }

  function openEntry(id) {
    setSelectedId(id)
    setView('editor')
  }

  async function backToList() {
    await refresh()
    setSelectedId(null)
    setView('list')
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-6">
      {view === 'list' ? (
        <EntryList entries={entries} onNew={openNew} onOpen={openEntry} />
      ) : (
        <EntryEditor entryId={selectedId} onBack={backToList} />
      )}
    </main>
  )
}
