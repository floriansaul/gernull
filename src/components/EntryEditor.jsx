import { useEffect, useState } from 'react'
import { createEntry, deleteEntry, getEntry, updateEntry } from '../db'

export default function EntryEditor({ entryId, onBack }) {
  const isNew = entryId == null
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ready, setReady] = useState(isNew)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return undefined

    let cancelled = false
    getEntry(entryId).then((entry) => {
      if (cancelled) return
      if (!entry) {
        setMissing(true)
      } else {
        setTitle(entry.title)
        setBody(entry.body)
      }
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [entryId, isNew])

  const canSave = title.trim().length > 0 || body.trim().length > 0

  async function handleSave(event) {
    event.preventDefault()
    if (!canSave || saving) return

    setSaving(true)
    const next = { title: title.trim(), body: body.trim() }
    if (isNew) {
      await createEntry(next)
    } else {
      await updateEntry(entryId, next)
    }
    await onBack()
  }

  async function handleDelete() {
    if (!window.confirm('Delete this entry?')) return
    await deleteEntry(entryId)
    await onBack()
  }

  if (!ready) {
    return <p className="text-sm text-stone-500">Loading…</p>
  }

  if (missing) {
    return (
      <div className="flex flex-col gap-4">
        <p>This entry is no longer here.</p>
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm font-medium underline"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-stone-600 underline dark:text-stone-300"
        >
          Back
        </button>
        <div className="flex items-center gap-2">
          {isNew ? null : (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={!canSave || saving}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900"
          >
            Save
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
          Title
        </span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Untitled"
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-lg font-medium outline-none focus:border-stone-400 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
          Entry
        </span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={12}
          placeholder="What happened?"
          className="min-h-64 resize-y rounded-xl border border-stone-200 bg-white px-3 py-2 leading-relaxed outline-none focus:border-stone-400 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>
    </form>
  )
}
