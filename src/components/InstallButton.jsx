import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault()
      setPrompt(event)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const install = async () => {
    if (!prompt) return

    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  if (!prompt) return null

  return (
    <button
      type="button"
      onClick={install}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 dark:border-stone-600 dark:text-stone-200"
    >
      Install Journal
    </button>
  )
}