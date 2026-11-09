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

function preview(body) {
  const text = body.replace(/\s+/g, ' ').trim()
  if (text.length <= 90) return text
  return `${text.slice(0, 90).trimEnd()}…`
}

export default function EntryList({ entries, onNew, onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
        <button
          type="button"
          onClick={onNew}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 dark:bg-stone-100 dark:text-stone-900"
        >
          New entry
        </button>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-stone-500 dark:border-stone-700 dark:text-stone-400">
          No entries yet. Write the first one.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const snippet = preview(entry.body)
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onOpen(entry.id)}
                  className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm dark:border-stone-700 dark:bg-stone-900"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-medium">
                      {entry.title.trim() || 'Untitled'}
                    </span>
                    <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400">
                      {formatWhen(entry.updatedAt)}
                    </span>
                  </span>
                  {snippet ? (
                    <span className="mt-1 block text-sm text-stone-600 dark:text-stone-300">
                      {snippet}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
