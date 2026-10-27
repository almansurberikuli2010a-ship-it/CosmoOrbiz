// Запросы к бэкенду (server/app.py). В режиме разработки Vite проксирует /api на порт 8000.

async function getJson(url, { retries = 0, delay = 2000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url)
      if (res.status === 503 && attempt < retries) throw new Error('loading')
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`)
        err.status = res.status
        throw err
      }
      return await res.json()
    } catch (e) {
      if (attempt >= retries || (e.status && e.status !== 503)) throw e
      await new Promise((r) => setTimeout(r, delay))
    }
  }
}

export const fetchStatus = () => getJson('/api/status')

/** Каталог запрашиваем, когда сервер его загрузит (при запуске он скачивает свежие орбиты). */
export async function fetchCatalog() {
  for (let i = 0; i < 120; i++) {
    const s = await fetchStatus().catch(() => null)
    if (s?.state === 'ready') break
    if (s?.state === 'error') throw new Error(s.error || 'server error')
    await new Promise((r) => setTimeout(r, 2000))
  }
  return getJson('/api/catalog', { retries: 5, delay: 2000 })
}

export const fetchObject = (norad) => getJson(`/api/objects/${norad}`, { retries: 5, delay: 1500 })
export const fetchRisks = () => getJson('/api/risks', { retries: 3 })
export const fetchStats = () => getJson('/api/stats', { retries: 3 })
export const fetchKazakhstan = () => getJson('/api/kazakhstan', { retries: 3 })
