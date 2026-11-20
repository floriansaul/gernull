import { useRef, memo, useEffect } from 'react'

function formatWhen(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const startOfDay = (value) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86_400_000,
  )

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}

const EntryItem = memo(({ entry, onSetEditing, isEditing, onDelete }) => {
  // Preserve line breaks, collapse multiple spaces
  const displayText = entry.body.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSetEditing(entry.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSetEditing(entry.id)
        }
      }}
      className="w-full text-left p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap mt-1">
          {formatWhen(entry.updatedAt)}
        </span>
        <span className="flex-1 text-stone-700 dark:text-stone-300 opacity-[45%] whitespace-pre-wrap break-words">
          {displayText}
        </span>
        {entry && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(entry.id)
            }}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 pointer-events-none"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
})

function EntryEditor({ entry, onSubmit, onDelete }) {
  const ref = useRef(null)

  useEffect(() => {
    const textarea = ref.current
    textarea?.focus()
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length)
    handleInput()
  }, [])

  function handleSubmit() {
    const body = ref.current.value.trim()
    if (!body) return
    onSubmit(body, entry?.id)
    ref.current.value = ''
  }

  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleBlur() {
    handleSubmit()
  }

  // Auto-expand textarea to fit content
  function handleInput() {
    const textarea = ref.current
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  return (
    <div className="w-full p-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap mt-1">
          {entry ? formatWhen(entry.updatedAt) : ''}
        </span>
        <textarea
          ref={ref}
          defaultValue={entry?.body ?? ''}
          className="flex-1 bg-transparent border-none outline-none resize-none text-stone-700 dark:text-stone-300 leading-relaxed placeholder-stone-400 dark:placeholder-stone-500"
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onInput={handleInput}
          placeholder="Write a new entry…"
          style={{ minHeight: '1.5rem' }}
        />
        {entry && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onDelete(entry.id)}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

function NewEntryEditor({ onSubmit }) {
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  function handleSubmit() {
    const body = ref.current.value.trim()
    if (!body) return
    onSubmit(body, null)
    ref.current.value = ''
  }

  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleBlur() {
    handleSubmit()
  }

  function handleInput() {
    const textarea = ref.current
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  return (
    <div className="w-full p-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap mt-1">
          Today
        </span>
        <textarea
          ref={ref}
          className="flex-1 bg-transparent border-none outline-none resize-none text-stone-700 dark:text-stone-300 leading-relaxed placeholder-stone-400 dark:placeholder-stone-500"
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onInput={handleInput}
          placeholder="Write a new entry…"
          style={{ minHeight: '1.5rem' }}
        />
      </div>
    </div>
  )
}

export default function EntryList({
  entries,
  editingId,
  onSetEditing,
  onSubmit,
  onDelete,
}) {
  return (
    <div className="flex flex-col gap-3">
      <NewEntryEditor
        onSubmit={(body) => onSubmit(body, null)}
      />

      {entries.length === 0 ? (
        <p className="px-4 py-10 text-center text-stone-500 dark:text-stone-400">
          No entries yet. Write the first one.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {entries.map((entry) => {
            const isEditing = editingId === entry.id

            return (
              <li key={entry.id}>
                {isEditing ? (
                  <EntryEditor
                    entry={entry}
                    onSubmit={(body) => onSubmit(body, entry.id)}
                    onDelete={onDelete}
                  />
                ) : (
                  <EntryItem
                    entry={entry}
                    onSetEditing={onSetEditing}
                    isEditing={isEditing}
                    onDelete={onDelete}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}