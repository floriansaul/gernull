import { useState } from 'react'
import { db } from '../db'

export default function LoginScreen() {
  const [loggingIn, setLoggingIn] = useState(false)

  async function handleLogin() {
    setLoggingIn(true)
    try {
      await db.cloud.login()
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-6 flex flex-col items-center justify-center">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
          Journal
        </h1>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          Sign in to sync your journal across devices.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loggingIn}
          className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
        >
          {loggingIn ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </main>
  )
}
