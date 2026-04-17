import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function VectorLine({ vector, color }) {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([0, 0, 0, vector.x, vector.y, vector.z])}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={3} toneMapped={false} />
    </line>
  )
}

export default function BlochSphere({ stateData }) {
  const vectors = stateData?.bloch_vectors || [
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 1 },
  ]

  return (
    <div style={{ height: '100%', minHeight: 580, borderRadius: 24, overflow: 'hidden', background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Canvas camera={{ position: [2.8, 2.2, 2.8], fov: 40 }}>
        <ambientLight intensity={0.7} />
        <directionalLight intensity={1} position={[5, 5, 5]} />
        <mesh rotation={[0, 0, 0]}> 
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial color="#12213b" opacity={0.16} transparent />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}> 
          <ringGeometry args={[1.001, 1.01, 128]} />
          <meshBasicMaterial color="#4fd4ff" transparent opacity={0.35} side={2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}> 
          <ringGeometry args={[1.001, 1.01, 128]} />
          <meshBasicMaterial color="#ff59f9" transparent opacity={0.35} side={2} />
        </mesh>
        <mesh position={[vectors[0].x, vectors[0].y, vectors[0].z]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ffef5d" />
        </mesh>
        <VectorLine vector={vectors[0]} color="#80dfff" />
        <VectorLine vector={vectors[1]} color="#ff78f7" />
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
      <div style={{ padding: '18px', color: '#cfd9ff' }}>
        <h3 style={{ margin: '0 0 10px' }}>Bloch Vectors</h3>
        <pre style={{ margin: 0, fontSize: '0.95rem' }}>
Qubit 0: x={vectors[0].x.toFixed(2)}, y={vectors[0].y.toFixed(2)}, z={vectors[0].z.toFixed(2)}
Qubit 1: x={vectors[1].x.toFixed(2)}, y={vectors[1].y.toFixed(2)}, z={vectors[1].z.toFixed(2)}
        </pre>
      </div>
    </div>
  )
}
