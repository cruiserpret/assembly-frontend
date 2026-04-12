// src/api/assembly.js — MOCK VERSION for UI testing

const sleep = ms => new Promise(r => setTimeout(r, ms))

const MOCK_AGENTS_R1 = [
  { id: 'a1', name: 'Sarah Chen', persona: 'Tech policy researcher at MIT', opinion: 'AI regulation is essential. Without oversight, we risk catastrophic misuse.', score: 0.82, opinion_delta: 0, stance: 'for' },
  { id: 'a2', name: 'Marcus Webb', persona: 'Silicon Valley startup founder', opinion: 'Government regulation will stifle innovation. The US risks falling behind China.', score: 0.75, opinion_delta: 0, stance: 'against' },
  { id: 'a3', name: 'Priya Nair', persona: 'Human rights lawyer, UN advisor', opinion: 'We need international frameworks. AI crosses borders and so must its governance.', score: 0.79, opinion_delta: 0, stance: 'for' },
  { id: 'a4', name: 'James Okafor', persona: 'Economics professor, Univ. of Lagos', opinion: 'Regulation benefits incumbents and kills competition for small nations.', score: 0.61, opinion_delta: 0, stance: 'against' },
  { id: 'a5', name: 'Elena Vasquez', persona: 'Former NSA cybersecurity analyst', opinion: 'National security demands AI oversight. Adversaries are weaponizing unregulated AI.', score: 0.88, opinion_delta: 0, stance: 'for' },
  { id: 'a6', name: 'Tom Ridley', persona: 'Libertarian think tank fellow', opinion: 'Markets self-regulate. Government interference slows progress without improving safety.', score: 0.55, opinion_delta: 0, stance: 'against' },
  { id: 'a7', name: 'Aiko Tanaka', persona: 'AI safety researcher, DeepMind', opinion: 'The technical risks are real. I support careful, evidence-based regulation.', score: 0.84, opinion_delta: 0, stance: 'for' },
  { id: 'a8', name: 'David Bloom', persona: 'Venture capitalist, Sequoia', opinion: 'Premature regulation locks in today\'s giants and freezes out tomorrow\'s innovators.', score: 0.68, opinion_delta: 0, stance: 'against' },
]
const MOCK_AGENTS_R2 = [
  { id: 'a1', name: 'Sarah Chen', persona: 'Tech policy researcher at MIT', opinion: 'Still believe regulation is needed but we must avoid over-prescribing technical standards.', score: 0.80, opinion_delta: -0.02, stance: 'for' },
  { id: 'a2', name: 'Marcus Webb', persona: 'Silicon Valley startup founder', opinion: 'Elena\'s national security point is hard to dismiss. I now support light-touch oversight.', score: 0.72, opinion_delta: +0.17, stance: 'neutral' },
  { id: 'a3', name: 'Priya Nair', persona: 'Human rights lawyer, UN advisor', opinion: 'Bilateral agreements between major AI powers could be a starting point for governance.', score: 0.81, opinion_delta: +0.02, stance: 'for' },
  { id: 'a4', name: 'James Okafor', persona: 'Economics professor, Univ. of Lagos', opinion: 'Without rules, powerful actors set de-facto standards anyway — worse than transparency.', score: 0.65, opinion_delta: +0.04, stance: 'neutral' },
  { id: 'a5', name: 'Elena Vasquez', persona: 'Former NSA cybersecurity analyst', opinion: 'Biological weapons have Geneva. Nuclear has NPT. AI needs its equivalent. Not optional.', score: 0.91, opinion_delta: +0.03, stance: 'for' },
  { id: 'a6', name: 'Tom Ridley', persona: 'Libertarian think tank fellow', opinion: 'Voluntary industry standards outperform mandated ones. See aviation safety post-deregulation.', score: 0.53, opinion_delta: -0.02, stance: 'against' },
  { id: 'a7', name: 'Aiko Tanaka', persona: 'AI safety researcher, DeepMind', opinion: 'Capability thresholds make sense — regulate based on compute and capability benchmarks.', score: 0.86, opinion_delta: +0.02, stance: 'for' },
  { id: 'a8', name: 'David Bloom', persona: 'Venture capitalist, Sequoia', opinion: 'Sandbox frameworks with sunset clauses could work for early-stage companies.', score: 0.71, opinion_delta: +0.03, stance: 'neutral' },
]
const MOCK_AGENTS_R3 = [
  { id: 'a1', name: 'Sarah Chen', persona: 'Tech policy researcher at MIT', opinion: 'Tiered, risk-based regulation is the right direction. I\'m encouraged by this debate.', score: 0.83, opinion_delta: +0.03, stance: 'for' },
  { id: 'a2', name: 'Marcus Webb', persona: 'Silicon Valley startup founder', opinion: 'Adaptive regulatory framework with industry co-design could protect startups from big-tech.', score: 0.74, opinion_delta: +0.02, stance: 'neutral' },
  { id: 'a3', name: 'Priya Nair', persona: 'Human rights lawyer, UN advisor', opinion: 'International frameworks as a breakthrough. Human rights must be the baseline globally.', score: 0.85, opinion_delta: +0.04, stance: 'for' },
  { id: 'a4', name: 'James Okafor', persona: 'Economics professor, Univ. of Lagos', opinion: 'I now support conditional regulation with mandatory impact assessments for developing nations.', score: 0.70, opinion_delta: +0.05, stance: 'for' },
  { id: 'a5', name: 'Elena Vasquez', persona: 'Former NSA cybersecurity analyst', opinion: 'Risk-based, internationally coordinated, with real enforcement. The group reached maturity.', score: 0.93, opinion_delta: +0.02, stance: 'for' },
  { id: 'a6', name: 'Tom Ridley', persona: 'Libertarian think tank fellow', opinion: 'I remain skeptical. I\'m now in the minority. My concern: who regulates the regulators?', score: 0.51, opinion_delta: -0.02, stance: 'against' },
  { id: 'a7', name: 'Aiko Tanaka', persona: 'AI safety researcher, DeepMind', opinion: 'Compute thresholds plus international treaty on frontier models. A concrete framework.', score: 0.89, opinion_delta: +0.03, stance: 'for' },
  { id: 'a8', name: 'David Bloom', persona: 'Venture capitalist, Sequoia', opinion: 'I\'ll lobby for sandbox regulation now. Better to shape the rules than fight them.', score: 0.76, opinion_delta: +0.05, stance: 'for' },
]

export const assembly = {
  async startSimulation() {
    await sleep(1200)
    return { simulation_id: 'mock-sim-001', status: 'running', agents_created: 8 }
  },
  async getDebate() {
    await sleep(800)
    return {
      simulation_id: 'mock-sim-001', topic: 'Should AI be regulated by governments?',
      rounds: [ { round: 1, agents: MOCK_AGENTS_R1 }, { round: 2, agents: MOCK_AGENTS_R2 }, { round: 3, agents: MOCK_AGENTS_R3 } ]
    }
  },
  async getReport() {
    await sleep(600)
    return {
      simulation_id: 'mock-sim-001', topic: 'Should AI be regulated by governments?',
      summary: 'The simulation revealed strong convergence toward risk-based, internationally coordinated AI regulation over 3 rounds. Elena Vasquez\'s weapons treaty analogy reframed the debate from economic to existential risk, proving most decisive.',
      agents_shifted: 5, agents_held: 3,
      decisive_arguments: [
        { agent_id: 'a5', argument: 'Biological weapons have Geneva. Nuclear has NPT. AI needs its equivalent — not optional for civilizational safety.', influenced_agents: [ 'a2', 'a4', 'a8' ] },
        { agent_id: 'a7', argument: 'Compute-based capability thresholds provide an objective, technically grounded basis for regulation.', influenced_agents: [ 'a1', 'a3' ] },
        { agent_id: 'a3', argument: 'AI crosses borders and so must its governance. Unilateral regulation creates arbitrage for bad actors.', influenced_agents: [ 'a4', 'a6' ] },
      ],
      predicted_trajectory: 'Public opinion likely converges toward tiered AI regulation within 18-24 months, driven by high-profile incidents and geopolitical pressure. Expect bipartisan support for frontier model oversight.',
      agent_summaries: [
        { agent_id: 'a1', name: 'Sarah Chen', shifted: false, final_stance: 'for', key_moment: 'Refined from broad regulation to risk-based after Marcus\'s innovation argument.' },
        { agent_id: 'a2', name: 'Marcus Webb', shifted: true, final_stance: 'neutral', key_moment: 'Elena\'s national security framing was decisive — shifted from hard against to conditional support.' },
        { agent_id: 'a3', name: 'Priya Nair', shifted: false, final_stance: 'for', key_moment: 'Strengthened position with international framework angle that gained broad acceptance.' },
        { agent_id: 'a4', name: 'James Okafor', shifted: true, final_stance: 'for', key_moment: 'Conceded unregulated AI lets powerful actors set de-facto standards anyway.' },
        { agent_id: 'a5', name: 'Elena Vasquez', shifted: false, final_stance: 'for', key_moment: 'Most influential — weapons treaty analogy reframed the entire debate.' },
        { agent_id: 'a6', name: 'Tom Ridley', shifted: false, final_stance: 'against', key_moment: 'Held firm on libertarian principles, acknowledged minority position by round 3.' },
        { agent_id: 'a7', name: 'Aiko Tanaka', shifted: false, final_stance: 'for', key_moment: 'Compute thresholds became group consensus — technical credibility boosted safety argument.' },
        { agent_id: 'a8', name: 'David Bloom', shifted: true, final_stance: 'for', key_moment: 'Pragmatic pivot: decided to shape regulation rather than fight it.' },
      ]
    }
  },
  async getSentimentHistory() {
    await sleep(400)
    return {
      simulation_id: 'mock-sim-001', ticks: [
        { tick: 1, positive: 0.42, neutral: 0.31, negative: 0.27 },
        { tick: 2, positive: 0.55, neutral: 0.28, negative: 0.17 },
        { tick: 3, positive: 0.71, neutral: 0.19, negative: 0.10 },
      ]
    }
  },
  async injectEvent({ event }) {
    await sleep(1000)
    return { injected_at_tick: 3, reactions: MOCK_AGENTS_R3.map(a => ({ agent_id: a.id, name: a.name, opinion_before: a.opinion.slice(0, 60), opinion_after: '[Updated] ' + a.opinion.slice(0, 60), delta: Math.random() * 0.2 - 0.1, shifted: Math.random() > 0.5 })) }
  },
  async branchSimulation({ from_tick }) {
    await sleep(800)
    return { branch_id: 'mock-branch-' + Math.random().toString(36).slice(2, 8), parent_simulation_id: 'mock-sim-001', branched_at_tick: from_tick, status: 'running' }
  },
  async getAgentMemory(agentId) {
    await sleep(500)
    const a = MOCK_AGENTS_R3.find(x => x.id === agentId) || MOCK_AGENTS_R3[ 0 ]
    return {
      agent_id: a.id, name: a.name, persona: a.persona, memory: [
        { simulation_id: 'mock-sim-001', date: '2026-04-10', topic: 'Should AI be regulated by governments?', final_opinion: a.opinion, final_score: a.score, shifted: a.opinion_delta > 0.05 },
        { simulation_id: 'mock-sim-000', date: '2026-04-09', topic: 'Is remote work better for productivity?', final_opinion: 'Remote work improves individual output but weakens team cohesion.', final_score: 0.71, shifted: false },
      ]
    }
  },
}