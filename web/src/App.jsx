import { useEffect, useState } from 'react'
import { fetchStatus } from './api.js'
import Header from './components/Header.jsx'
import Facts from './components/Facts.jsx'
import Footer from './components/Footer.jsx'
import GlobeView from './globe/GlobeView.jsx'
import KesslerSection from './kessler/KesslerSection.jsx'
import ModelSection from './components/ModelSection.jsx'
import LiveSection from './components/LiveSection.jsx'

export default function App() {
  const [status, setStatus] = useState(null)

  // состояние сервера: пока модель считает все спутники — опрашиваем чаще
  useEffect(() => {
    let alive = true
    let timer
    const poll = async () => {
      try {
        const s = await fetchStatus()
        if (!alive) return
        setStatus(s)
        const busy = s.state !== 'ready' || s.batch?.state === 'running' || !s.risk?.rated
        timer = setTimeout(poll, busy ? 3000 : s.threats?.state === 'running' || s.threats?.state === 'idle' ? 15000 : 60000)
      } catch {
        if (!alive) return
        setStatus((prev) => (prev && prev.state === 'ready' ? prev : { state: 'offline' }))
        timer = setTimeout(poll, 5000)
      }
    }
    poll()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <Header />
      <main>
        <GlobeView status={status} />
        <Facts />
        <LiveSection status={status} />
        <KesslerSection status={status} />
        <ModelSection status={status} />
      </main>
      <Footer status={status} />
    </>
  )
}
