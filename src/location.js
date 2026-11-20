const cache = new Map()

export async function getCurrentCoordinates() {
  if (!('geolocation' in navigator)) return null
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    )
  })
}

export async function reverseGeocode(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`
  if (cache.has(key)) return cache.get(key)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const address = data.address || {}
    const city = address.city || address.town || address.village || address.suburb || address.municipality
    const country = address.country
    const name = city && country ? `${city}, ${country}` : city || country || null
    if (name) cache.set(key, name)
    return name
  } catch {
    return null
  }
}

export async function detectLocation() {
  const coords = await getCurrentCoordinates()
  if (!coords) return null
  const name = await reverseGeocode(coords.lat, coords.lon)
  return { lat: coords.lat, lon: coords.lon, name }
}
