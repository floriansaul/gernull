import { useState, useRef, memo, useEffect } from 'react'
import { detectLocation } from '../location'

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
        <div className="shrink-0 flex flex-col items-center text-center gap-4 text-xs w-24 text-stone-500 dark:text-stone-400 whitespace-normal break-words mt-1">
          <span>{formatWhen(entry.createdAt)}</span>
          {entry.location?.name && <span>{entry.location.name}</span>}
        </div>
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

function LocationInput({ location, setLocation, coordsRef, geoAttemptedRef, userEditedRef, onSubmit }) {
  const ref = useRef(null)

  async function handleClick() {
    if (geoAttemptedRef.current) return
    geoAttemptedRef.current = true
    const result = await detectLocation()
    if (!result) return
    if (result.lat != null) coordsRef.current = { lat: result.lat, lon: result.lon }
    if (!userEditedRef.current && result.name) setLocation(result.name)
  }

  function handleInput() {
    const textarea = ref.current
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  useEffect(() => {
    handleInput()
  }, [location])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={location}
      onChange={(e) => { setLocation(e.target.value); userEditedRef.current = true }}
      onInput={handleInput}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); onSubmit() } }}
      placeholder="Add a location"
      className="w-full bg-transparent border-none outline-none resize-none text-xs text-center text-stone-500 dark:text-stone-400 placeholder-stone-400 dark:placeholder-stone-500 break-words"
    />
  )
}

function EntryEditor({ entry, onSubmit, onDelete }) {
  const ref = useRef(null)
  const [location, setLocation] = useState(entry.location?.name ?? '')
  const coordsRef = useRef(entry.location?.lat != null ? { lat: entry.location.lat, lon: entry.location.lon } : undefined)
  const geoAttemptedRef = useRef(false)
  const userEditedRef = useRef(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    const textarea = ref.current
    textarea?.focus()
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length)
    handleInput()
    return () => { cancelledRef.current = true }
  }, [])

  function handleSubmit() {
    const body = ref.current.value.trim()
    if (!body) return
    const name = location.trim()
    const loc = name
      ? { name, ...(coordsRef.current ? { lat: coordsRef.current.lat, lon: coordsRef.current.lon } : {}) }
      : undefined
    onSubmit(body, loc)
    ref.current.value = ''
  }

  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleInput() {
    const textarea = ref.current
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  return (
    <div className="w-full p-4" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) handleSubmit() }}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 flex flex-col items-center text-center gap-4 text-xs w-24 text-stone-500 dark:text-stone-400 whitespace-normal break-words mt-1">
          <span>{entry ? formatWhen(entry.createdAt) : ''}</span>
          <LocationInput
            location={location}
            setLocation={setLocation}
            coordsRef={coordsRef}
            geoAttemptedRef={geoAttemptedRef}
            userEditedRef={userEditedRef}
            onSubmit={handleSubmit}
          />
        </div>
        <textarea
          ref={ref}
          defaultValue={entry?.body ?? ''}
          className="flex-1 bg-transparent border-none outline-none resize-none text-stone-700 dark:text-stone-300 leading-relaxed placeholder-stone-400 dark:placeholder-stone-500"
          onKeyDown={handleKeyDown}
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

function NewEntryEditor({ onSubmit, defaultLocationName }) {
  const ref = useRef(null)
  const [location, setLocation] = useState(defaultLocationName ?? '')
  const coordsRef = useRef(undefined)
  const geoAttemptedRef = useRef(false)
  const userEditedRef = useRef(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    return () => { cancelledRef.current = true }
  }, [])

  function handleSubmit() {
    const body = ref.current.value.trim()
    if (!body) return
    const name = location.trim()
    const loc = name
      ? { name, ...(coordsRef.current ? { lat: coordsRef.current.lat, lon: coordsRef.current.lon } : {}) }
      : undefined
    onSubmit(body, loc)
    ref.current.value = ''
    setLocation(defaultLocationName ?? '')
    coordsRef.current = undefined
    geoAttemptedRef.current = false
    userEditedRef.current = false
  }

  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleInput() {
    const textarea = ref.current
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  return (
    <div className="w-full p-4" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) handleSubmit() }}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 flex flex-col items-center text-center gap-4 text-xs w-24 text-stone-500 dark:text-stone-400 whitespace-normal break-words mt-1">
          <span>Today</span>
          <LocationInput
            location={location}
            setLocation={setLocation}
            coordsRef={coordsRef}
            geoAttemptedRef={geoAttemptedRef}
            userEditedRef={userEditedRef}
            onSubmit={handleSubmit}
          />
        </div>
        <textarea
          ref={ref}
          className="flex-1 bg-transparent border-none outline-none resize-none text-stone-700 dark:text-stone-300 leading-relaxed placeholder-stone-400 dark:placeholder-stone-500"
          onKeyDown={handleKeyDown}
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
  const previousLocationName = entries.find((e) => e.location?.name)?.location?.name ?? ''

  return (
    <div className="flex flex-col gap-3">
      <NewEntryEditor
        defaultLocationName={previousLocationName}
        onSubmit={(body, location) => onSubmit(body, null, location)}
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
                    onSubmit={(body, location) => onSubmit(body, entry.id, location)}
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
