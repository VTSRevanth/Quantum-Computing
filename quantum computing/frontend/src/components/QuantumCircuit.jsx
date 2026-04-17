import { useEffect, useMemo, useState } from 'react'

const palette = [
  { gate: 'H', label: 'Hadamard' },
  { gate: 'X', label: 'Pauli-X' },
  { gate: 'CNOT', label: 'CNOT' },
]

function gateForDrop(gate, row) {
  if (gate === 'CNOT') {
    return {
      gate: 'CNOT',
      target: row === 0 ? 1 : 0,
      control: row,
    }
  }
  return { gate, target: row }
}

export default function QuantumCircuit({ gates, setGates, loading }) {
  const [slots, setSlots] = useState(Array(8).fill(null))
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => {
    const mapped = Array(8).fill(null)
    gates.forEach((entry, index) => {
      mapped[index] = entry
    })
    setSlots(mapped)
  }, [gates])

  const qubitRows = useMemo(() => [0, 1], [])

  const gateList = slots.map((item, idx) => {
    const row = Math.floor(idx / 4)
    const col = idx % 4
    return { item, idx, row, col }
  })

  function handleDrop(event, slotIndex, row) {
    event.preventDefault()
    const gate = event.dataTransfer.getData('text/plain')
    if (!gate) return
    const dropped = gateForDrop(gate, row)
    const next = [...slots]
    next[slotIndex] = dropped
    setSlots(next)
    setGates(next.filter(Boolean))
    setDragOver(null)
  }

  function handleRemove(index) {
    const next = [...slots]
    next[index] = null
    setSlots(next)
    setGates(next.filter(Boolean))
  }

  return (
    <div>
      <div className="gate-palette">
        {palette.map((entry) => (
          <div
            key={entry.gate}
            className="gate-token"
            draggable
            onDragStart={(event) => event.dataTransfer.setData('text/plain', entry.gate)}
          >
            <strong>{entry.gate}</strong>
            <div>{entry.label}</div>
          </div>
        ))}
      </div>

      <div className="status-line">Drag a gate into any slot to build a two-qubit circuit.</div>

      <div className="circuit-grid">
        {qubitRows.map((qubit) => (
          <div key={qubit} className="qubit-row">
            <div className="qubit-label">Qubit {qubit}</div>
            {gateList
              .filter((slot) => slot.row === qubit)
              .map((slot) => (
                <div
                  key={slot.idx}
                  className={`slot ${slot.item ? 'filled' : ''} ${dragOver === slot.idx ? 'dragover' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOver(slot.idx)
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(event) => handleDrop(event, slot.idx, qubit)}
                >
                  {slot.item ? (
                    <div className="gate-chip">
                      <div>{slot.item.gate}</div>
                      <button onClick={() => handleRemove(slot.idx)} style={{ marginTop: 6, border: 'none', background: 'transparent', color: '#ff7be7', cursor: 'pointer' }}>Remove</button>
                    </div>
                  ) : (
                    <div>Drop gate here</div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="status-line">{loading ? 'Computing quantum state...' : 'State updated from the backend.'}</div>
    </div>
  )
}
