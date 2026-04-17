// src/api/assembly.js

const BASE = import.meta.env.VITE_API_URL
    ? `${ import.meta.env.VITE_API_URL }/api`
    : '/api'

// Hard lock — only ONE start request allowed at a time
let startInFlight = false

async function request(url, options = {}) {
    const res = await fetch(`${ BASE }${ url }`, {
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...options.headers,
        },
        ...options,
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || `HTTP ${ res.status }`)
    }
    return res.json()
}

export const assembly = {

    // ── context is now passed through to backend (Tier 1 feature) ──
    async startSimulation({ topic, context = '', num_agents = 20, num_rounds = 3, uploads = [] }) {
        if (startInFlight) {
            throw new Error('A simulation is already starting. Please wait.')
        }
        startInFlight = true
        try {
            return await request('/simulation/start', {
                method: 'POST',
                body: JSON.stringify({ topic, context, num_agents, num_rounds, uploads }),
            })
        } finally {
            startInFlight = false
        }
    },

    getDebate(simulationId) {
        return request(`/simulation/${ simulationId }/debate`)
    },

    // ── Returns status + error_message when simulation fails ──
    getStatus(simulationId) {
        return request(`/simulation/${ simulationId }/status`)
    },

    getReport(simulationId) {
        return request(`/report/${ simulationId }`)
    },

    getSentimentHistory(simulationId) {
        return request(`/sentiment/history/${ simulationId }`)
    },

    injectEvent({ simulation_id, event }) {
        return request('/inject', {
            method: 'POST',
            body: JSON.stringify({ simulation_id, event }),
        })
    },

    branchSimulation({ simulation_id, from_tick }) {
        return request('/branch', {
            method: 'POST',
            body: JSON.stringify({ simulation_id, from_tick }),
        })
    },

    getAgentMemory(agentId) {
        return request(`/agent/${ agentId }/memory`)
    },
}
// ── Tier 2 DTC routes ──────────────────────────────────────────
export const assemblyDTC = {
    async startSimulation({ product_name, product_description, price, category, demographic, competitors, num_agents }) {
        return request('/dtc/simulation/start', {
            method: 'POST',
            body: JSON.stringify({ product_name, product_description, price, category, demographic, competitors, num_agents }),
        })
    },
    async getStatus(simulationId) {
        return request(`/dtc/simulation/${simulationId}/status`)
    },
    async getDebate(simulationId) {
        return request(`/dtc/simulation/${simulationId}/debate`)
    },
    async getReport(simulationId) {
        return request(`/dtc/simulation/${simulationId}/report`)
    },
}
