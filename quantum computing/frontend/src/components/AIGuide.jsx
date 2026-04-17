export default function AIGuide({ explanation, stateData }) {
  return (
    <div className="ai-guide">
      <div>
        <h2>AI Guide</h2>
        <p>Learn the physics behind your circuit in easy, futuristic language.</p>
      </div>
      <div className="ai-content">
        <p>{explanation}</p>
      </div>
      <div className="ai-content" style={{ background: 'rgba(0, 12, 25, 0.95)' }}>
        <h3>Circuit Summary</h3>
        {stateData ? (
          <pre>{stateData.circuit_diagram}</pre>
        ) : (
          <p>Waiting for the quantum state to initialize...</p>
        )}
      </div>
    </div>
  )
}
