// ─────────────────────────────────────────────────────────────────
// assembly_DTC_MOCK.js
//
// Drop-in replacement for assembly.js during DTC demo mode.
// Shows Pransh the FULL Tier 2 flow:
//   - Competitor intel loading sequence
//   - Buyer persona spawning
//   - 3 structured rounds (First Impression → Competitor → Consensus)
//   - Full Market God's Eye View report
//
// HOW TO USE:
// In DTCSimulationView.vue and DTCReportView.vue, change:
//   import { assembly } from '../api/assembly.js'
// to:
//   import { assembly } from '../api/assembly_DTC_MOCK.js'
//
// Revert before pushing to production.
// ─────────────────────────────────────────────────────────────────

// ── MOCK PRODUCT ─────────────────────────────────────────────────
const PRODUCT = {
    name: 'CollagenRise Daily Serum',
    price: 49,
    category: 'beauty_skincare',
    description: 'A vegan collagen-boosting serum with retinol alternative bakuchiol. No synthetic fragrance. Clinically tested.',
    competitors: [ 'The Ordinary', 'Drunk Elephant', 'Tatcha' ],
    demographic: 'Women 28–45, income $60K–$120K, interested in clean beauty',
}

// ── MOCK BUYER AGENTS ─────────────────────────────────────────────
const MOCK_AGENTS = [
    // Round 1 agents
    {
        id: 'agent_a1b2c3d4',
        name: 'Maya Chen',
        profession: 'UX Designer',
        location: 'San Francisco, CA',
        age: 32,
        stakeholder_name: 'Clean beauty early adopter, 32-year-old professional',
        stakeholder_category: 'affected_community',
        agent_type: 'public',
        stance: 'for',
        score: 7.4,
        opinion: "I've been burned by so many 'clean' serums that turned out to have hidden fragrance. The bakuchiol angle is what gets my attention — I switched off retinol because of sensitivity and this sounds like exactly what I've been looking for.",
        opinion_delta: 0.0,
        last_argument: "I tried three other collagen serums this year. Two had hidden synthetic fragrance, one broke me out. CollagenRise is the first one I've seen with an actual clinical study, not just 'clinically inspired.' That matters to me.",
        emotional_intensity: 'high',
        key_beliefs: [ 'Ingredient transparency is non-negotiable', 'Bakuchiol is superior to retinol for sensitive skin' ],
        confirmation_bias: 0.55,
        persuasion_resistance: 0.48,
        influence_weight: 0.65,
    },
    {
        id: 'agent_e5f6g7h8',
        name: 'Sarah Okonkwo',
        profession: 'Elementary School Teacher',
        location: 'Austin, TX',
        age: 38,
        stakeholder_name: 'Price-conscious skincare enthusiast, 38-year-old educator',
        stakeholder_category: 'affected_community',
        agent_type: 'public',
        stance: 'neutral',
        score: 5.1,
        opinion: "I want to believe in this product but $49 for a serum is a stretch on my budget. I've been using The Ordinary's peptide serum at $12 and honestly my skin looks fine. I'd need a really compelling reason to spend four times more.",
        opinion_delta: 0.0,
        last_argument: "My current routine works. I'm not anti-premium but I need to see that the results are genuinely different, not just better packaging. What does $49 get me that $12 doesn't?",
        emotional_intensity: 'medium',
        key_beliefs: [ 'Price-to-value ratio matters more than brand', 'The Ordinary delivers results at accessible prices' ],
        confirmation_bias: 0.40,
        persuasion_resistance: 0.35,
        influence_weight: 0.45,
    },
    {
        id: 'agent_i9j0k1l2',
        name: 'Rachel Torres',
        profession: 'Marketing Director',
        location: 'New York, NY',
        age: 41,
        stakeholder_name: 'Loyal Drunk Elephant user, 41-year-old executive',
        stakeholder_category: 'affected_community',
        agent_type: 'public',
        stance: 'against',
        score: 2.8,
        opinion: "I've been using Drunk Elephant's B-Hydra serum for two years and my skin has never looked better. I don't understand why I'd switch to a brand I've never heard of. Brand trust takes years to build.",
        opinion_delta: 0.0,
        last_argument: "Drunk Elephant has a 15-year track record. I know exactly what I'm getting. An unknown brand claiming clinical testing — how many subjects? What endpoints? The vague 'clinically tested' claim is a red flag, not a selling point.",
        emotional_intensity: 'high',
        key_beliefs: [ 'Brand loyalty is earned through proven results', 'New brands need to earn trust, not just claim it' ],
        confirmation_bias: 0.65,
        persuasion_resistance: 0.62,
        influence_weight: 0.70,
    },
    {
        id: 'agent_m3n4o5p6',
        name: 'Priya Sharma',
        profession: 'Dermatology PA',
        location: 'Chicago, IL',
        age: 34,
        stakeholder_name: 'Skincare-educated healthcare professional, 34-year-old PA',
        stakeholder_category: 'academic',
        agent_type: 'public',
        stance: 'for',
        score: 7.9,
        opinion: "From a clinical perspective, bakuchiol is genuinely exciting. A 2018 British Journal of Dermatology study showed equivalent efficacy to retinol with significantly fewer side effects. If CollagenRise is formulating around this ingredient properly, $49 is actually quite reasonable.",
        opinion_delta: 0.0,
        last_argument: "I recommend bakuchiol to my sensitive-skin patients regularly. The science is solid. What I care about is concentration and formulation stability — if this serum has adequate bakuchiol concentration and proper pH, it will work. The price is fair for a quality formulation.",
        emotional_intensity: 'medium',
        key_beliefs: [ 'Evidence-based ingredients are the only ones worth investing in', 'Bakuchiol has peer-reviewed efficacy data' ],
        confirmation_bias: 0.30,
        persuasion_resistance: 0.28,
        influence_weight: 0.85,
    },
    {
        id: 'agent_q7r8s9t0',
        name: 'Jennifer Walsh',
        profession: 'Freelance Photographer',
        location: 'Portland, OR',
        age: 29,
        stakeholder_name: 'Sustainability-driven minimalist, 29-year-old creative',
        stakeholder_category: 'affected_community',
        agent_type: 'public',
        stance: 'neutral',
        score: 5.6,
        opinion: "The vegan and no-synthetic-fragrance angle appeals to me deeply. But I'm trying to do more with less — I'm a 5-step routine max kind of person. I need to know how this fits into a simplified routine before I commit.",
        opinion_delta: 0.0,
        last_argument: "My criteria: clean ingredients, multi-functional, sustainable packaging. CollagenRise checks two of three. What's the packaging situation? If it's plastic with no recycling program, I'm out regardless of the formula.",
        emotional_intensity: 'medium',
        key_beliefs: [ 'Minimalist routines are better for skin and planet', 'Sustainability is a purchasing dealbreaker' ],
        confirmation_bias: 0.38,
        persuasion_resistance: 0.32,
        influence_weight: 0.42,
    },
    {
        id: 'agent_u1v2w3x4',
        name: 'Diana Reeves',
        profession: 'Retired Accountant',
        location: 'Scottsdale, AZ',
        age: 58,
        stakeholder_name: 'Anti-aging focused baby boomer, 58-year-old retiree',
        stakeholder_category: 'affected_community',
        agent_type: 'public',
        stance: 'for',
        score: 7.2,
        opinion: "At 58 I've tried everything. I gave up retinol three years ago because my skin couldn't handle it. If bakuchiol really delivers similar collagen stimulation without the irritation, this is exactly what I've been searching for at a price that doesn't feel absurd.",
        opinion_delta: 0.0,
        last_argument: "I spend $180 on Tatcha serums regularly. $49 is nothing if it works. The demographic CollagenRise is ignoring is women over 50 who have the disposable income AND the skin sensitivity that makes bakuchiol the perfect ingredient for them.",
        emotional_intensity: 'high',
        key_beliefs: [ 'Anti-aging results justify premium pricing', 'Retinol alternatives are the future for mature skin' ],
        confirmation_bias: 0.50,
        persuasion_resistance: 0.44,
        influence_weight: 0.58,
    },
]

// ── BUILD ROUNDS FROM AGENTS ──────────────────────────────────────
function buildRound(roundNum, agentUpdates) {
    return {
        round: roundNum,
        agents: MOCK_AGENTS.map(agent => {
            const update = agentUpdates[ agent.id ] || {}
            return { ...agent, ...update }
        })
    }
}

// Round 2 updates — after competitor comparison
const ROUND2_UPDATES = {
    'agent_a1b2c3d4': {
        score: 8.1, opinion_delta: 0.7, shifted: true, stance: 'for',
        opinion: "Maya's initial skepticism melted after Priya cited the BJD study. If a dermatology PA is recommending the active ingredient, that's the social proof I needed. And Rachel's loyalty to Drunk Elephant actually highlights the opportunity — DE doesn't have a bakuchiol product.",
        last_argument: "I just checked. Drunk Elephant doesn't make a bakuchiol serum. The Ordinary's version is $12 but uses a lower concentration. CollagenRise at $49 with clinical backing is actually filling a real gap in the market."
    },
    'agent_e5f6g7h8': {
        score: 6.2, opinion_delta: 1.1, shifted: true, stance: 'for',
        opinion: "Priya's clinical context changed my calculation. If The Ordinary's version uses a lower bakuchiol concentration, the $37 price gap starts to make sense. I might actually try a trial size.",
        last_argument: "The concentration argument is what moved me. I'm not paying for branding — I'm paying for efficacy. If the formulation is genuinely superior, $49 becomes reasonable."
    },
    'agent_i9j0k1l2': {
        score: 2.4, opinion_delta: 0.4, shifted: false, stance: 'against',
        opinion: "Rachel is unmoved. Drunk Elephant's Protini Polypeptide cream has a 10-year track record. One clinical study doesn't overcome that. I need 3+ years of real-world user data before I'd switch.",
        last_argument: "The BJD study is from 2018. That's promising but skincare efficacy in clinical settings often doesn't replicate in real-world use. I'll wait for the r/SkincareAddiction community verdict after 6 months."
    },
    'agent_m3n4o5p6': {
        score: 8.2, opinion_delta: 0.3, shifted: false, stance: 'for',
        opinion: "The clinical backing is solid. My remaining question is whether they publish the full ingredient list with concentrations. Transparency on bakuchiol percentage is the last data point I need.",
        last_argument: "At the right concentration — minimum 0.5% bakuchiol — this serum would outperform most of what I see on the market at twice the price. Priya's verdict stands."
    },
    'agent_q7r8s9t0': {
        score: 6.8, opinion_delta: 1.2, shifted: true, stance: 'for',
        opinion: "Jennifer is coming around after the sustainability angle was addressed. Vegan formula plus no synthetic fragrance is a strong baseline. Still need packaging clarity.",
        last_argument: "Two out of three criteria met. If packaging information is available and it's responsible, I'm genuinely interested. The clean formula is doing a lot of the work here."
    },
    'agent_u1v2w3x4': {
        score: 7.8, opinion_delta: 0.6, shifted: false, stance: 'for',
        opinion: "Diana is even more convinced after learning the boomer market is underserved. This product could specifically target women 50+ with sensitive skin who've abandoned retinol. That's a real and large market.",
        last_argument: "The 50+ sensitive-skin market is enormous and almost nobody is talking to us directly. If CollagenRise positions around that, they have a very loyal customer base waiting for them."
    },
}

// Round 3 updates — consensus building
const ROUND3_UPDATES = {
    'agent_a1b2c3d4': {
        score: 8.3, opinion_delta: 0.2, shifted: false, stance: 'for',
        opinion: "Maya has fully committed. The combination of clinical backing, no fragrance, and bakuchiol concentration argument sealed it. She'd buy.",
        last_argument: "I'm buying. The ingredient story is compelling, the price is fair for the formulation quality, and the gap in Drunk Elephant's lineup actually creates a real opening."
    },
    'agent_e5f6g7h8': {
        score: 6.5, opinion_delta: 0.3, shifted: false, stance: 'for',
        opinion: "Sarah is cautiously in. She'd start with a trial size and convert to full if results match promise.",
        last_argument: "Trial size first. If my skin shows improvement in 4 weeks, $49 for the full size is approved. That's my decision process."
    },
    'agent_i9j0k1l2': {
        score: 2.2, opinion_delta: 0.2, shifted: false, stance: 'against',
        opinion: "Rachel is the holdout. Brand trust is her immovable objection. Not enough market history to displace a trusted incumbent.",
        last_argument: "Come back to me in 18 months when you have 500 verified reviews on Amazon and a Sephora shelf spot. Then we'll talk."
    },
    'agent_m3n4o5p6': {
        score: 8.4, opinion_delta: 0.2, shifted: false, stance: 'for',
        opinion: "Priya remains the most credible voice. Her clinical endorsement shifted the room.",
        last_argument: "The ingredient science is settled. This serum works if formulated correctly. My endorsement stands."
    },
    'agent_q7r8s9t0': {
        score: 7.1, opinion_delta: 0.3, shifted: false, stance: 'for',
        opinion: "Jennifer is in, contingent on packaging. She'd recommend it to her community if packaging is responsible.",
        last_argument: "Sustainable packaging is the final gate. Pass that and you have a very vocal clean beauty community advocate."
    },
    'agent_u1v2w3x4': {
        score: 8.0, opinion_delta: 0.2, shifted: false, stance: 'for',
        opinion: "Diana is the strongest buyer. Fully convinced. She represents the underserved boomer market perfectly.",
        last_argument: "I'd buy two. One for me, one for my sister. We've both been looking for exactly this product for three years."
    },
}

// ── MOCK REPORT ───────────────────────────────────────────────────
const MOCK_REPORT = {
    simulation_id: 'sim_dtc_demo01',
    topic: '[DTC] CollagenRise Daily Serum at $49 — A vegan collagen-boosting serum with retinol alternative bakuchiol.',
    mode: 'dtc',

    summary: "CollagenRise Daily Serum generated strong market reception among 5 of 6 buyer personas across 3 structured debate rounds. The clinical bakuchiol narrative, combined with a genuine gap in Drunk Elephant's product lineup, proved to be the decisive competitive advantage. One brand-loyal holdout (Rachel Torres) remained unconvinced, citing insufficient market history — representing a real segment of incumbent-loyal buyers that new brands must plan for.",

    predicted_trajectory: "Strong initial adoption among clean beauty early adopters and sensitive-skin consumers aged 35+. The 50+ demographic — actively searching for retinol alternatives — represents an underserved market with high conversion potential. Key risk: brand trust takes 12–18 months to establish in the premium skincare segment. Recommended trajectory: seed with dermatologist endorsements, target the 50+ retinol-sensitive segment directly.",

    verdict: {
        statement: "CollagenRise is market-ready at $49 with a clear primary target segment and a defensible competitive position.",
        confidence_pct: 72,
        strength: 'strong',
        dominant_stance: 'for',
        dominant_count: 5,
        minority_stance: 'against',
        minority_count: 1,
        neutral_count: 0,
        decided_count: 6,
        decisive_factor: '"No synthetic fragrance" combined with a peer-reviewed clinical study (BJD 2018) was the argument that shifted the most skeptics. Use this in your headline — not vague "clinically tested" language.',
        minority_position: "Brand-loyal incumbent users (primarily Drunk Elephant, Tatcha customers) require 18+ months of market presence and 500+ verified reviews before considering a switch. This segment is not the launch target — they're the 12-month expansion target.",
        real_world_implication: "At $49, CollagenRise sits at the accessible premium tier where purchase decisions are made based on ingredient story rather than brand prestige. The bakuchiol clinical narrative is uniquely credible and currently underrepresented in this price bracket.",
    },

    actionable_insight: "Target women 35–58 who have abandoned retinol due to sensitivity. This is your highest-intent, lowest-resistance segment. Lead with the BJD 2018 bakuchiol study in your ad copy — not the vague 'clinically tested' claim. Partner with 3–5 dermatology-adjacent creators (PAs, aestheticians, not just influencers) for credibility-first launch. Address packaging sustainability before launch — it's a purchase gate for the sustainability-conscious segment.",

    consensus_level: 'high',
    agents_shifted: 2,
    agents_held: 4,

    decisive_arguments: [
        {
            agent_id: 'agent_m3n4o5p6',
            argument: "The BJD 2018 study showed equivalent efficacy to retinol with significantly fewer side effects. At the right concentration — minimum 0.5% bakuchiol — this serum would outperform most of what I see on the market at twice the price.",
            influenced_agents: [ 'agent_e5f6g7h8', 'agent_q7r8s9t0' ],
            evidence_used: [ 'British Journal of Dermatology 2018 bakuchiol study', 'Clinical concentration benchmarks' ],
        },
        {
            agent_id: 'agent_u1v2w3x4',
            argument: "The 50+ sensitive-skin market is enormous and almost nobody is talking to us directly. If CollagenRise positions around that, they have a very loyal customer base waiting.",
            influenced_agents: [ 'agent_a1b2c3d4' ],
            evidence_used: [ 'Market gap analysis', 'Drunk Elephant product lineup gap' ],
        },
    ],

    agent_summaries: [
        { agent_id: 'agent_a1b2c3d4', name: 'Maya Chen', stakeholder: 'Clean beauty early adopter', shifted: true, initial_stance: 'for', final_stance: 'for', key_moment: 'Shifted after Priya cited BJD bakuchiol study and discovered Drunk Elephant has no competing product' },
        { agent_id: 'agent_e5f6g7h8', name: 'Sarah Okonkwo', stakeholder: 'Price-conscious skincare enthusiast', shifted: true, initial_stance: 'neutral', final_stance: 'for', key_moment: 'Moved by concentration argument — realized the $37 premium reflects formulation quality, not just branding' },
        { agent_id: 'agent_i9j0k1l2', name: 'Rachel Torres', stakeholder: 'Loyal Drunk Elephant user', shifted: false, initial_stance: 'against', final_stance: 'against', key_moment: 'Held firm — brand trust requires 18+ months of market presence; not the launch target segment' },
        { agent_id: 'agent_m3n4o5p6', name: 'Priya Sharma', stakeholder: 'Dermatology PA', shifted: false, initial_stance: 'for', final_stance: 'for', key_moment: 'Most influential agent — clinical endorsement of bakuchiol shifted 2 skeptics; held conviction throughout' },
        { agent_id: 'agent_q7r8s9t0', name: 'Jennifer Walsh', stakeholder: 'Sustainability-driven minimalist', shifted: true, initial_stance: 'neutral', final_stance: 'for', key_moment: 'Converted after clean ingredient story addressed her core values; packaging remains final gate' },
        { agent_id: 'agent_u1v2w3x4', name: 'Diana Reeves', stakeholder: 'Anti-aging focused baby boomer', shifted: false, initial_stance: 'for', final_stance: 'for', key_moment: 'Held strongest conviction throughout — identified underserved 50+ retinol-sensitive market as key opportunity' },
    ],

    round_summaries: [
        { round: 1, key_development: 'Priya Sharma\'s clinical endorsement of bakuchiol (BJD 2018) immediately elevated the product\'s credibility and shifted the room\'s prior toward the ingredient story', dominant_argument: 'Peer-reviewed clinical backing for bakuchiol efficacy at proper concentration', who_shifted: [], who_held: [ 'Maya Chen', 'Sarah Okonkwo', 'Rachel Torres', 'Priya Sharma', 'Jennifer Walsh', 'Diana Reeves' ], avg_delta: 0.0 },
        { round: 2, key_development: 'Discovery that Drunk Elephant has no competing bakuchiol product created a clear competitive moat argument that converted Sarah and Jennifer from neutral to for', dominant_argument: 'Incumbent gap analysis — Drunk Elephant doesn\'t make a bakuchiol serum at any price point', who_shifted: [ 'Sarah Okonkwo', 'Jennifer Walsh' ], who_held: [ 'Maya Chen', 'Rachel Torres', 'Priya Sharma', 'Diana Reeves' ], avg_delta: 0.72 },
        { round: 3, key_development: 'Consensus built around the 50+ sensitive-skin positioning as the primary launch segment — Diana\'s framing of the underserved boomer market crystallized the target audience', dominant_argument: 'Women 50+ who abandoned retinol due to sensitivity are the highest-intent, lowest-resistance launch segment', who_shifted: [], who_held: [ 'Maya Chen', 'Sarah Okonkwo', 'Rachel Torres', 'Priya Sharma', 'Jennifer Walsh', 'Diana Reeves' ], avg_delta: 0.25 },
    ],

    sentiment_history: {
        simulation_id: 'sim_dtc_demo01',
        ticks: [
            { tick: 1, positive: 0.50, neutral: 0.33, negative: 0.17 },
            { tick: 2, positive: 0.67, neutral: 0.17, negative: 0.17 },
            { tick: 3, positive: 0.83, neutral: 0.00, negative: 0.17 },
        ],
    },
}

// ── TIMING SIMULATION ─────────────────────────────────────────────
// Simulates the backend processing timeline:
// 0-8s:   competitor intel running
// 8-20s:  buyer personas spawning
// 20-40s: Round 1 running
// 40-60s: Round 2 running
// 60-80s: Round 3 running
// 80s+:   report ready

let _startTime = null

function getElapsed() {
    if (!_startTime) return 0
    return (Date.now() - _startTime) / 1000
}

function getCurrentDebateState() {
    const elapsed = getElapsed()

    if (elapsed < 20) {
        return { rounds: [], status: 'running', agents_created: elapsed > 8 ? 6 : 0 }
    }

    const rounds = []

    if (elapsed >= 20) {
        rounds.push(buildRound(1, {}))
    }
    if (elapsed >= 40) {
        rounds.push(buildRound(2, ROUND2_UPDATES))
    }
    if (elapsed >= 60) {
        rounds.push(buildRound(3, ROUND3_UPDATES))
    }

    const status = elapsed >= 80 ? 'complete' : 'running'
    return { rounds, status, agents_created: 6 }
}

// ── MOCK ASSEMBLY API ─────────────────────────────────────────────
export const assembly = {

    async startSimulation({ topic, context, num_agents, num_rounds }) {
        _startTime = Date.now()
        console.log('[DTC MOCK] Simulation started:', topic)
        return {
            simulation_id: 'sim_dtc_demo01',
            status: 'running',
            message: 'DTC market simulation started.',
        }
    },

    async getStatus(simulationId) {
        const state = getCurrentDebateState()
        return {
            simulation_id: simulationId,
            status: state.status,
            agents_created: state.agents_created,
            error: null,
            error_message: null,
        }
    },

    async getDebate(simulationId) {
        const state = getCurrentDebateState()
        return {
            simulation_id: simulationId,
            rounds: state.rounds,
        }
    },

    async getReport(simulationId) {
        const elapsed = getElapsed()
        if (elapsed < 80) {
            throw new Error('Report not ready yet')
        }
        return MOCK_REPORT
    },

    async getSentimentHistory(simulationId) {
        return MOCK_REPORT.sentiment_history
    },

    // Unused in DTC mode but kept for API compatibility
    injectEvent() { return Promise.resolve({}) },
    branchSimulation() { return Promise.resolve({}) },
    getAgentMemory() { return Promise.resolve({}) },
}