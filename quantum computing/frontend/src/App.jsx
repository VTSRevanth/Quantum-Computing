import { useEffect, useMemo, useState } from 'react'
import QuantumCircuit from './components/QuantumCircuit'
import BlochSphere from './components/BlochSphere'
import AIGuide from './components/AIGuide'

const initialGates = [
  { gate: 'H', target: 0 },
  { gate: 'H', target: 1 },
]

function App() {
  const [gates, setGates] = useState(initialGates)
  const [stateData, setStateData] = useState(null)
  const [explanation, setExplanation] = useState('AI Guide loads when the circuit changes.')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchState() {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gates }),
        })
        const data = await response.json()
        setStateData(data)
      } finally {
        setLoading(false)
      }
    }
    fetchState()
  }, [gates])

  const description = useMemo(() => {
    if (!stateData) return 'The circuit is initializing.'
    return `Circuit diagram:\n${stateData.circuit_diagram}`
  }, [stateData])

  useEffect(() => {
    async function fetchExplanation() {
      if (!stateData) return
      const res = await fetch('http://localhost:8000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          statevector: stateData.statevector,
          probabilities: stateData.probabilities,
        }),
      })
      const json = await res.json()
      setExplanation(json.explanation || 'AI explanation unavailable.')
    }
    fetchExplanation()
  }, [description, stateData])

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <h1>AI Quantum Simulator</h1>
          <p>Cyberpunk circuit builder with Bloch Sphere and Gemini AI guide.</p>
        </div>
      </header>
      <main className="layout-grid">
        <section className="panel panel-large">
          <QuantumCircuit gates={gates} setGates={setGates} loading={loading} />
        </section>
        <section className="panel panel-medium">
          <BlochSphere stateData={stateData} />
        </section>
        <section className="panel panel-side">
          <AIGuide explanation={explanation} stateData={stateData} />
        </section>
      </main>
    </div>
  )
}

export default App
