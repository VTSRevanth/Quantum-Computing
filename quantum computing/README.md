# AI-Powered Quantum Simulator

A futuristic quantum circuit web app with React frontend and FastAPI backend.

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` from `.env.example` and add your Gemini API key.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features

- Drag-and-drop gate builder for 2 qubits
- Real-time statevector + probability calculation via Qiskit
- 3D Bloch Sphere visualization
- AI Guide sidebar using Gemini API
