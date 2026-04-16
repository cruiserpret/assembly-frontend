// src/api/assembly.js
// ── STATIC MOCK VERSION — for local testing only ──────────────────
// Swap this out with the real assembly.js when going live

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function randomId() {
    return 'sim_' + Math.random().toString(36).slice(2, 10)
}

// ── Fake simulation store (persists across calls in same session) ──
const fakeSimulations = {}

export const assembly = {

    async startSimulation({ topic, context = '', num_agents = 20, num_rounds = 3 }) {
        await delay(600)
        const id = randomId()
        fakeSimulations[ id ] = {
            id,
            topic,
            context,
            status: 'complete',
            num_agents,
            num_rounds,
        }
        return { simulation_id: id }
    },

    async getStatus(simulationId) {
        await delay(200)
        return {
            simulation_id: simulationId,
            status: 'complete',
            agents_created: 20,
            error: null,
            error_message: null,
        }
    },

    async getDebate(simulationId) {
        await delay(800)
        const sim = fakeSimulations[ simulationId ] || {}
        const topic = sim.topic || 'Should UCSD extend library hours?'

        const agents = [
            { id: 'a1', name: 'Sarah Chen', stance: 'for', score: 7.8, opinion: 'Students desperately need extended hours during finals. The data shows 40% study past midnight regularly.', opinion_delta: 0.12, persona: 'Graduate student in computer science' },
            { id: 'a2', name: 'Marcus Thompson', stance: 'against', score: 2.4, opinion: 'Operational costs are prohibitive. Staffing alone would require $200K annually that the budget cannot support.', opinion_delta: -0.05, persona: 'Campus budget administrator' },
            { id: 'a3', name: 'Elena Vasquez', stance: 'for', score: 7.2, opinion: 'Mental health improves when students have flexible access to study spaces. This is a wellbeing issue not just convenience.', opinion_delta: 0.08, persona: 'UCSD psychology researcher' },
            { id: 'a4', name: 'James Liu', stance: 'neutral', score: 5.1, opinion: 'A phased approach during exam weeks only might satisfy both sides without overextending resources.', opinion_delta: 0.03, persona: 'Student government representative' },
            { id: 'a5', name: 'Priya Patel', stance: 'for', score: 6.9, opinion: 'International students in different time zones have no other option for group study sessions in the evenings.', opinion_delta: 0.15, persona: 'International student from India' },
            { id: 'a6', name: 'Tom Bradley', stance: 'against', score: 2.9, opinion: 'Security incidents increase significantly in late night hours. We cannot ignore the safety data.', opinion_delta: -0.02, persona: 'Campus security director' },
            { id: 'a7', name: 'Aisha Johnson', stance: 'for', score: 7.5, opinion: 'Every peer institution — UCLA, Berkeley, Stanford — already offers 24/7 access. UCSD is falling behind.', opinion_delta: 0.09, persona: 'Student body president' },
            { id: 'a8', name: 'Derek Wong', stance: 'neutral', score: 4.8, opinion: 'Utilization data past midnight is genuinely low outside finals. We should start with pilot testing before committing.', opinion_delta: 0.01, persona: 'Library operations manager' },
        ]

        const round1 = { round: 1, agents: agents.map(a => ({ ...a, opinion: a.opinion })) }
        const round2 = {
            round: 2, agents: agents.map(a => ({
                ...a,
                opinion: a.stance === 'for'
                    ? a.opinion + ' The arguments against have not addressed the core student need.'
                    : a.stance === 'against'
                        ? a.opinion + ' I acknowledge student demand is real but the fiscal reality remains unchanged.'
                        : a.opinion + ' Both sides are becoming more entrenched rather than converging.',
                opinion_delta: a.opinion_delta * 0.8,
            }))
        }
        const round3 = {
            round: 3, agents: agents.map((a, i) => ({
                ...a,
                stance: i === 3 ? 'for' : a.stance,  // James shifts to FOR
                opinion: i === 3
                    ? 'After hearing all arguments I am convinced extended hours during finals at minimum is justified and achievable within budget.'
                    : a.opinion,
                opinion_delta: i === 3 ? 0.22 : a.opinion_delta * 0.6,
            }))
        }

        return {
            simulation_id: simulationId,
            topic,
            rounds: [ round1, round2, round3 ],
            status: 'complete',
        }
    },

    async getReport(simulationId) {
        await delay(600)
        const sim = fakeSimulations[ simulationId ] || {}
        const topic = sim.topic || 'Should UCSD extend library hours?'

        return {
            simulation_id: simulationId,
            topic,
            summary: 'The simulation revealed strong student support for extended library hours, with institutional concerns centered on cost and security. A decisive shift occurred in round 3 when the student government representative revised their neutral stance after hearing international student testimony about timezone conflicts.',
            predicted_trajectory: 'Extended hours during finals week appear likely within the next academic year, driven by persistent student advocacy and comparable policies at peer UC institutions. A full 24/7 policy faces higher resistance due to budgetary constraints.',
            agents_shifted: 1,
            agents_held: 7,
            agent_summaries: [
                { agent_id: 'a1', name: 'Sarah Chen', final_stance: 'for', shifted: false, key_moment: 'Security concerns raised by Tom Bradley did not outweigh her conviction about student need.' },
                { agent_id: 'a2', name: 'Marcus Thompson', final_stance: 'against', shifted: false, key_moment: 'Held firm on fiscal constraints despite acknowledging student demand.' },
                { agent_id: 'a3', name: 'Elena Vasquez', final_stance: 'for', shifted: false, key_moment: 'Mental health framing reinforced her existing position.' },
                { agent_id: 'a4', name: 'James Liu', final_stance: 'for', shifted: true, key_moment: "Priya Patel's international student testimony about timezone conflicts provided the decisive argument that shifted him from neutral to for." },
                { agent_id: 'a5', name: 'Priya Patel', final_stance: 'for', shifted: false, key_moment: 'Personal experience as an international student anchored her conviction.' },
                { agent_id: 'a6', name: 'Tom Bradley', final_stance: 'against', shifted: false, key_moment: 'Safety data remained his primary anchor throughout all three rounds.' },
                { agent_id: 'a7', name: 'Aisha Johnson', final_stance: 'for', shifted: false, key_moment: 'Peer institution comparisons strengthened her position over the debate.' },
                { agent_id: 'a8', name: 'Derek Wong', final_stance: 'neutral', shifted: false, key_moment: 'Maintained analytical stance — called for pilot program rather than committing either way.' },
            ],
            graph_summary: {
                total_sources: 487,
                forum_chunks: 143,
                institutional_chunks: 344,
            },
        }
    },

    async getSentimentHistory(simulationId) {
        await delay(300)
        return { history: [] }
    },

    async injectEvent({ simulation_id, event }) {
        await delay(500)
        return {
            simulation_id,
            injected_at_tick: 2,
            event,
            reactions: [
                { agent_id: 'a4', name: 'James Liu', shifted: true, new_stance: 'for' },
                { agent_id: 'a8', name: 'Derek Wong', shifted: false, new_stance: 'neutral' },
                { agent_id: 'a2', name: 'Marcus Thompson', shifted: false, new_stance: 'against' },
            ],
        }
    },

    async branchSimulation({ simulation_id, from_tick }) {
        await delay(400)
        return {
            original_id: simulation_id,
            branch_id: randomId(),
            from_tick,
        }
    },

    async getAgentMemory(agentId) {
        await delay(400)
        return {
            agent_id: agentId,
            name: 'Sarah Chen',
            persona: 'Graduate student in computer science at UCSD',
            memory: [
                {
                    simulation_id: 'sim_abc123',
                    topic: 'Should UCSD extend library hours?',
                    date: 'Apr 14, 2026',
                    final_opinion: 'Strong support for 24/7 access during finals.',
                    final_score: 0.78,
                    shifted: false,
                },
            ],
        }
    },
}