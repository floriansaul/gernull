import { useEffect } from 'react'

export default function MergeConfirmModal({ isOpen, onClose, onMerge, onDeleteLocal }) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-700 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="merge-modal-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
          You have local journal entries
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          You have journal entries stored locally on this device. Would you like to merge them
          into your cloud account, or delete them and start fresh?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDeleteLocal}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Start fresh (delete local)
          </button>
          <button
            type="button"
            onClick={onMerge}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Merge local entries
          </button>
        </div>
      </div>
    </div>
  )
}