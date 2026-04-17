import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from dotenv import load_dotenv
import requests

load_dotenv()
GEMINI_API_URL = "https://gemini.googleapis.com/v1/models/text-bison-001:generate"

app = FastAPI(title="Quantum Simulator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CircuitGate(BaseModel):
    gate: str
    target: int
    control: Optional[int] = None

class CircuitStateRequest(BaseModel):
    gates: List[CircuitGate]

class ExplanationRequest(BaseModel):
    description: str
    statevector: List[dict]
    probabilities: List[float]


def build_circuit(gates: List[CircuitGate]) -> QuantumCircuit:
    qc = QuantumCircuit(2)
    for item in gates:
        if item.gate == "H":
            qc.h(item.target)
        elif item.gate == "X":
            qc.x(item.target)
        elif item.gate == "CNOT":
            if item.control is None:
                raise ValueError("CNOT gate requires a control qubit")
            qc.cx(item.control, item.target)
    return qc


def compute_state(circuit: QuantumCircuit):
    state = Statevector(circuit)
    probabilities = [abs(ampl) ** 2 for ampl in state.data]
    return state, probabilities


def bloch_vector(statevector, qubit_index: int):
    # Single-qubit reduced density matrix from 2-qubit statevector.
    from qiskit.quantum_info import DensityMatrix
    dm = DensityMatrix(statevector).partial_trace([1 - qubit_index])
    x = float(dm.data[0, 1] + dm.data[1, 0])
    y = float(1j * (dm.data[0, 1] - dm.data[1, 0]))
    z = float(dm.data[0, 0] - dm.data[1, 1])
    return {"x": x, "y": y, "z": z}


@app.post("/api/state")
def get_state(request: CircuitStateRequest):
    try:
        qc = build_circuit(request.gates)
        state, probabilities = compute_state(qc)
        bloch = [bloch_vector(state, 0), bloch_vector(state, 1)]
        return {
            "statevector": [
                {"re": float(val.real), "im": float(val.imag)}
                for val in state.data
            ],
            "probabilities": probabilities,
            "bloch_vectors": bloch,
            "circuit_diagram": qc.draw(output="text").single_string,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/explain")
def explain_state(request: ExplanationRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    prompt = (
        "Explain this quantum state in simple, futuristic terms for a beginner. "
        f"Statevector: {request.statevector}. Probabilities: {request.probabilities}. "
        f"Also mention what the current circuit is doing.\n\n{request.description}"
    )
    if not api_key:
        return {
            "explanation": (
                "Gemini API key not configured. "
                "Set GEMINI_API_KEY in your environment to receive AI-powered explanations. "
                "Meanwhile, this circuit creates a superposition and entanglement depending on the gates applied."
            )
        }

    body = {
        "prompt": prompt,
        "temperature": 0.7,
        "maxOutputTokens": 400,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    response = requests.post(GEMINI_API_URL, json=body, headers=headers, timeout=15)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Gemini API request failed")
    data = response.json()
    answer = data.get("candidates", [{}])[0].get("content", "Unable to parse Gemini response.")
    return {"explanation": answer}
