let deferredPrompt = null
const listeners = new Set()

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredPrompt = event
  for (const listener of listeners) listener(event)
})

export function onInstallPrompt(listener) {
  if (deferredPrompt) listener(deferredPrompt)
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function clearInstallPrompt() {
  deferredPrompt = null
}