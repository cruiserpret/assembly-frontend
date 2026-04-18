<template>
  <div class="dtc-simulation">

    <!-- ── ERROR STATE ── -->
    <div v-if="simError" class="error-screen">
      <div class="error-icon">⚠</div>
      <h2 class="display error-title">SIMULATION FAILED</h2>
      <p class="error-msg">{{ simError }}</p>
      <router-link to="/dtc" class="btn btn-primary">← Try Again</router-link>
    </div>

    <template v-else>

      <!-- ── WORKBENCH HEADER ── -->
      <div class="workbench-header">
        <div class="workbench-meta">
          <div class="workbench-product mono">
            <span class="live-dot" v-if="isLive"></span>
            <span>{{ productName || 'Market Simulation' }}</span>
            <span v-if="productPrice" class="product-price mono">${{ productPrice }}</span>
          </div>
          <div class="workbench-status mono" :class="statusClass">
            {{ statusLabel }}
          </div>
        </div>

        <!-- Progress steps -->
        <div class="steps-row">
          <div
            v-for="step in steps"
            :key="step.id"
            class="step"
            :class="step.status"
          >
            <div class="step-dot">
              <span v-if="step.status === 'complete'">✓</span>
              <span v-else-if="step.status === 'active'" class="spinner-sm"></span>
              <span v-else>·</span>
            </div>
            <div class="step-label mono">{{ step.label }}</div>
          </div>
        </div>
      </div>

      <!-- ── MAIN GRID ── -->
      <div class="workbench-grid">

        <!-- LEFT: Agent feed -->
        <div class="agent-panel">

          <!-- Market distribution bar -->
          <div class="market-dist" v-if="allAgents.length > 0">
            <div class="dist-label mono">Market Signal</div>
            <div class="dist-bar-wrap">
              <div
                class="dist-bar-segment seg-buy"
                :style="`width:${buyPct}%`"
                :title="`${buyPct}% would buy`"
              ></div>
              <div
                class="dist-bar-segment seg-considering"
                :style="`width:${consideringPct}%`"
                :title="`${consideringPct}% considering`"
              ></div>
              <div
                class="dist-bar-segment seg-wont"
                :style="`width:${wontPct}%`"
                :title="`${wontPct}% won't buy`"
              ></div>
            </div>
            <div class="dist-legend">
              <span class="legend-item mono buy">▬ {{ buyPct }}% Buy</span>
              <span class="legend-item mono considering">▬ {{ consideringPct }}% Considering</span>
              <span class="legend-item mono wont">▬ {{ wontPct }}% Won't Buy</span>
            </div>
          </div>

          <!-- Rounds -->
          <div v-if="debate && debate.rounds && debate.rounds.length > 0">
            <div
              v-for="round in debate.rounds"
              :key="round.round"
              class="round-block"
            >
              <div class="round-header">
                <span class="round-num display">ROUND {{ round.round }}</span>
                <span class="round-name mono">{{ ROUND_NAMES[round.round - 1] || `Round ${round.round}` }}</span>
              </div>

              <div class="agent-cards">
                <div
                  v-for="agent in round.agents"
                  :key="agent.id"
                  class="agent-card"
                  :class="`stance-${agent.stance}`"
                >
                  <div class="agent-card-header">
                    <div class="agent-avatar" :class="`avatar-${agent.stance}`">
                      {{ agent.name.charAt(0) }}
                    </div>
                    <div class="agent-info">
                      <div class="agent-name">{{ agent.name }}</div>
                      <div class="agent-role mono">{{ agent.stakeholder_name || agent.agent_type }}</div>
                    </div>
                    <div class="agent-right">
                      <span class="dtc-stance-tag mono" :class="`stance-${agent.stance}`">
                        {{ stanceLabel(agent.stance) }}
                      </span>
                      <span v-if="agent.opinion_delta > 0.1" class="delta-badge mono">
                        ▲ {{ agent.opinion_delta.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <p class="agent-opinion">{{ agent.opinion }}</p>
                  <div class="agent-score-bar">
                    <div
                      class="agent-score-fill"
                      :style="`width:${agent.score * 10}%; background:${scoreColor(agent.score)}`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-else-if="isLive" class="loading-state">
            <div class="loading-steps">
              <div class="loading-step" v-for="(msg, i) in loadingMessages" :key="i" :class="{ active: i === currentLoadingMsg }">
                <span class="spinner-sm" v-if="i === currentLoadingMsg"></span>
                <span v-else-if="i < currentLoadingMsg" style="color:var(--for)">✓</span>
                <span v-else style="opacity:0.3">·</span>
                <span class="mono" style="font-size:12px;">{{ msg }}</span>
              </div>
            </div>
          </div>

          <!-- Running round indicator -->
          <div v-if="isLive && debate && debate.rounds && debate.rounds.length > 0" class="running-indicator mono">
            <span class="spinner-sm"></span>
            Running round {{ (debate.rounds?.length || 0) + 1 }}...
          </div>

        </div>

        <!-- RIGHT: Stats panel -->
        <div class="stats-panel">

          <!-- Agent count -->
          <div class="stat-block">
            <div class="stat-label mono">Buyer Personas</div>
            <div class="stat-value display">{{ agentsCreated || '—' }}</div>
            <div class="stat-sub mono">agents in simulation</div>
          </div>

          <div class="divider"></div>

          <!-- Score distribution -->
          <div class="stat-block" v-if="allAgents.length > 0">
            <div class="stat-label mono">Intent Distribution</div>
            <div class="intent-rows">
              <div class="intent-row">
                <span class="intent-label mono buy">Would Buy</span>
                <div class="intent-bar-wrap">
                  <div class="intent-bar" :style="`width:${buyPct}%; background:var(--for)`"></div>
                </div>
                <span class="intent-pct mono">{{ buyPct }}%</span>
              </div>
              <div class="intent-row">
                <span class="intent-label mono considering">Considering</span>
                <div class="intent-bar-wrap">
                  <div class="intent-bar" :style="`width:${consideringPct}%; background:#f59e0b`"></div>
                </div>
                <span class="intent-pct mono">{{ consideringPct }}%</span>
              </div>
              <div class="intent-row">
                <span class="intent-label mono wont">Won't Buy</span>
                <div class="intent-bar-wrap">
                  <div class="intent-bar" :style="`width:${wontPct}%; background:var(--against)`"></div>
                </div>
                <span class="intent-pct mono">{{ wontPct }}%</span>
              </div>
            </div>
          </div>

          <div class="divider" v-if="allAgents.length > 0"></div>

          <!-- Round progress -->
          <div class="stat-block">
            <div class="stat-label mono">Debate Progress</div>
            <div class="round-pills">
              <div
                v-for="n in 3"
                :key="n"
                class="round-pill"
                :class="{
                  complete: (debate?.rounds?.length || 0) >= n,
                  active: (debate?.rounds?.length || 0) === n - 1 && isLive
                }"
              >
                <span class="round-pill-num mono">{{ n }}</span>
                <span class="round-pill-name mono">{{ ROUND_NAMES[n-1] }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Predicted trial rate preview -->
          <div class="stat-block" v-if="predictedTrialRate !== null">
            <div class="stat-label mono">Predicted Trial Rate</div>
            <div class="trial-rate-display">
              <span class="trial-rate-num display accent">{{ predictedTrialRate }}%</span>
            </div>
            <div class="stat-sub mono">Juster probability composite</div>
          </div>

          <div class="divider" v-if="predictedTrialRate !== null"></div>

          <!-- CTA when complete -->
          <div v-if="reportFetched" class="report-ready">
            <div class="report-ready-label mono">
              <span style="color:var(--for)">✓</span>
              Market analysis complete
            </div>
            <router-link
              :to="`/dtc/report/${props.id}`"
              class="btn btn-primary report-btn"
            >
              View Market Report →
            </router-link>
          </div>

        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assemblyDTC as assembly } from '../api/assembly.js'

const props  = defineProps({ id: String })
const route  = useRoute()
const router = useRouter()

// ── URL params ────────────────────────────────────────────────
const productName  = computed(() => route.query.product || '')
const productPrice = computed(() => route.query.price   || '')
const numAgents    = computed(() => parseInt(route.query.agents || '20'))

// ── State ─────────────────────────────────────────────────────
const debate        = ref(null)
const isLive        = ref(true)
const simError      = ref('')
const agentsCreated = ref(0)
const reportFetched = ref(false)
const isRefreshing  = ref(false)
let pollTimer = null

const ROUND_NAMES = ['First Impression', 'Competitor Comparison', 'Consensus Building']

// ── Loading messages ──────────────────────────────────────────
const loadingMessages = [
  'Analyzing competitor products and reviews...',
  'Building buyer personas from real data...',
  'Running Round 1 — First Impression...',
  'Running Round 2 — Competitor Comparison...',
  'Running Round 3 — Consensus Building...',
  'Generating Market God\'s Eye View...',
]
const currentLoadingMsg = ref(0)
let loadingTimer = null

// ── Steps ─────────────────────────────────────────────────────
const steps = ref([
  { id: 'intel',    label: 'Competitor Intel',   status: 'active'  },
  { id: 'personas', label: 'Buyer Personas',      status: 'pending' },
  { id: 'debate',   label: 'Market Debate',       status: 'pending' },
  { id: 'report',   label: 'Market Report',       status: 'pending' },
])

// ── Computed ──────────────────────────────────────────────────
const allAgents = computed(() => {
  if (!debate.value?.rounds?.length) return []
  const last = debate.value.rounds[debate.value.rounds.length - 1]
  return last?.agents || []
})

const buyCount        = computed(() => allAgents.value.filter(a => a.stance === 'for').length)
const wontCount       = computed(() => allAgents.value.filter(a => a.stance === 'against').length)
const consideringCount = computed(() => allAgents.value.filter(a => a.stance === 'neutral').length)
const total           = computed(() => allAgents.value.length || 1)

const buyPct        = computed(() => Math.round(buyCount.value / total.value * 100))
const wontPct       = computed(() => Math.round(wontCount.value / total.value * 100))
const consideringPct = computed(() => Math.round(consideringCount.value / total.value * 100))

// Juster predicted trial rate from agent scores
// Brennan & Esslemont 1994: y = 0.8845x - 0.0481
// Maps agent score (1-10) to purchase probability
const predictedTrialRate = computed(() => {
  if (!allAgents.value.length) return null
  const avgScore = allAgents.value.reduce((s, a) => s + (a.score || 5), 0) / allAgents.value.length
  // Normalize score to 0-1 range then apply Juster regression
  const justerProb = Math.max(0, Math.min(1, 0.8845 * (avgScore / 10) - 0.0481))
  return Math.round(justerProb * 100)
})

const statusLabel = computed(() => {
  if (simError.value) return 'Failed'
  if (reportFetched.value) return 'Complete'
  if (isLive.value) return 'Running...'
  return 'Complete'
})

const statusClass = computed(() => ({
  'status-live':     isLive.value && !simError.value,
  'status-complete': reportFetched.value,
  'status-error':    !!simError.value,
}))

// ── Helpers ───────────────────────────────────────────────────
function stanceLabel(stance) {
  return { for: 'BUY', against: "WON'T BUY", neutral: 'CONSIDERING' }[stance] || stance.toUpperCase()
}

function scoreColor(score) {
  if (score >= 6.5) return 'var(--for)'
  if (score <= 3.5) return 'var(--against)'
  return '#f59e0b'
}

function updateSteps() {
  const rounds = debate.value?.rounds?.length || 0
  const agents = agentsCreated.value

  if (agents > 0) {
    steps.value[0].status = 'complete'
    steps.value[1].status = 'complete'
  }
  if (rounds >= 1) steps.value[2].status = rounds < 3 ? 'active' : 'complete'
  if (reportFetched.value) steps.value[3].status = 'complete'
  else if (rounds >= 3) steps.value[3].status = 'active'
}

// ── Poll ──────────────────────────────────────────────────────
async function refreshDebate() {
  if (isRefreshing.value) return
  isRefreshing.value = true

  try {
    let status = null
    let statusOk = false

    try {
      status = await assembly.getStatus(props.id)
      statusOk = true

      if (status?.status === 'failed') {
        simError.value = status.error_message || 'Market simulation failed. Please try again.'
        clearInterval(pollTimer)
        pollTimer = null
        isLive.value = false
        return
      }
      if (status?.agents_created > 0) {
        agentsCreated.value = status.agents_created
        if (currentLoadingMsg.value < 2) currentLoadingMsg.value = 2
      }
    } catch {
      // Status endpoint not ready — keep polling
      statusOk = false
    }

    // Fetch debate data to show rounds as they complete
    try {
      const debateData = await assembly.getDebate(props.id)
      if (debateData) {
        debate.value = debateData
        const roundCount = debateData.rounds?.length || 0
        if (roundCount >= 1) {
          currentLoadingMsg.value = Math.min(2 + roundCount, loadingMessages.length - 1)
        }
        updateSteps()
      }
    } catch { /* debate not ready, keep polling */ }

    // GODMODE FIX: Only fetch report when backend explicitly says status === 'complete'
    // DO NOT use roundCount >= 1 as a proxy for completion
    // GODMODE 3.1: Only mark complete when BOTH report AND full debate are present
if (statusOk && status?.status === 'complete' && !reportFetched.value) {
  try {
    const reportData = await assembly.getReport(props.id)
    const fullDebate = await assembly.getDebate(props.id)

    const hasFullDebate = fullDebate?.rounds?.length === 3 &&
                          fullDebate.rounds[2]?.agents?.length > 0

    if (reportData &&
        Object.keys(reportData).length > 0 &&
        !reportData.error &&
        hasFullDebate) {
      debate.value = fullDebate  // ensure latest debate is stored
      reportFetched.value = true
      currentLoadingMsg.value = loadingMessages.length - 1
      updateSteps()
    }
  } catch {
    // Not ready, keep polling
  }
}

    // Stop polling only after report is actually fetched
    if (reportFetched.value) {
      clearInterval(pollTimer)
      pollTimer = null
      isLive.value = false
      steps.value.forEach(s => { if (s.status !== 'complete') s.status = 'complete' })
    }

  } catch { /* network blip, keep polling */ } finally {
    isRefreshing.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  // GODMODE 3.1 FIX: Always fetch latest debate data on mount,
  // even if we already have cached data from a previous visit
  try {
    const freshDebate = await assembly.getDebate(props.id)
    if (freshDebate?.rounds?.length > 0) {
      debate.value = freshDebate
      const lastRound = freshDebate.rounds[freshDebate.rounds.length - 1]
      if (lastRound?.agents?.length > 0) {
        agentsCreated.value = lastRound.agents.length
      }
    }

    const freshStatus = await assembly.getStatus(props.id)
    if (freshStatus?.status === 'complete') {
      reportFetched.value = true
      isLive.value = false
      currentLoadingMsg.value = loadingMessages.length - 1
      updateSteps()
      steps.value.forEach(s => s.status = 'complete')
    }
  } catch (e) {
    // If fetch fails, continue with normal polling flow
  }

  // Continue with normal polling (will refresh if not complete)
  if (!reportFetched.value) {
    refreshDebate()
    pollTimer = setInterval(refreshDebate, 2500)

    loadingTimer = setInterval(() => {
      if (!reportFetched.value && currentLoadingMsg.value < 2) {
        currentLoadingMsg.value++
      }
    }, 8000)
  }
})

onUnmounted(() => {
  clearInterval(pollTimer)
  clearInterval(loadingTimer)
})
</script>

<style scoped>
.dtc-simulation {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 60px;
}

/* ── Error ── */
.error-screen {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.error-icon   { font-size: 32px; color: var(--against); }
.error-title  { font-size: 32px; color: var(--against); }
.error-msg    { font-size: 14px; color: var(--text-muted); max-width: 480px; }

/* ── Workbench Header ── */
.workbench-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.workbench-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.workbench-product {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text);
  letter-spacing: 0.02em;
}
.product-price {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(200,255,87,0.1);
  border: 1px solid rgba(200,255,87,0.2);
  color: var(--accent);
}
.workbench-status {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.status-live     { color: var(--accent); }
.status-complete { color: var(--for); }
.status-error    { color: var(--against); }

/* Steps */
.steps-row { display: flex; align-items: center; gap: 0; }
.step {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px 6px 0;
  position: relative;
}
.step:not(:last-child)::after {
  content: '→';
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-dim);
  margin-right: 0;
}
.step-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  flex-shrink: 0;
}
.step.complete .step-dot { border-color: var(--for);    background: rgba(62,232,160,0.1);  color: var(--for); }
.step.active   .step-dot { border-color: var(--accent); background: rgba(200,255,87,0.1); color: var(--accent); }
.step.pending  .step-dot { color: var(--text-dim); }
.step-label { font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em; }
.step.complete .step-label { color: var(--for); }
.step.active   .step-label { color: var(--accent); }

/* ── Workbench Grid ── */
.workbench-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

/* ── Agent Panel ── */
.agent-panel { display: flex; flex-direction: column; gap: 16px; }

/* Market distribution bar */
.market-dist {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}
.dist-label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.dist-bar-wrap {
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--surface-2);
  display: flex;
  margin-bottom: 8px;
}
.dist-bar-segment { height: 100%; transition: width 0.8s ease; }
.seg-buy        { background: var(--for); }
.seg-considering { background: #f59e0b; }
.seg-wont       { background: var(--against); }
.dist-legend { display: flex; gap: 16px; }
.legend-item { font-size: 10px; letter-spacing: 0.04em; }
.legend-item.buy        { color: var(--for); }
.legend-item.considering { color: #f59e0b; }
.legend-item.wont       { color: var(--against); }

/* Round blocks */
.round-block { margin-bottom: 24px; }
.round-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.round-num  { font-size: 22px; color: var(--text-muted); opacity: 0.4; }
.round-name { font-size: 11px; color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; }

/* Agent cards */
.agent-cards { display: flex; flex-direction: column; gap: 8px; }
.agent-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  transition: border-color 0.2s;
}
.agent-card.stance-for     { border-left: 2px solid rgba(62,232,160,0.5); }
.agent-card.stance-against { border-left: 2px solid rgba(255,77,109,0.5); }
.agent-card.stance-neutral { border-left: 2px solid rgba(245,158,11,0.4); }

.agent-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.agent-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.avatar-for     { background: rgba(62,232,160,0.2);  color: var(--for); }
.avatar-against { background: rgba(255,77,109,0.2);  color: var(--against); }
.avatar-neutral { background: rgba(245,158,11,0.15); color: #f59e0b; }

.agent-info { flex: 1; min-width: 0; }
.agent-name { font-size: 13px; color: var(--text); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agent-role { font-size: 10px; color: var(--text-dim); letter-spacing: 0.02em; }

.agent-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.dtc-stance-tag {
  font-size: 8px;
  letter-spacing: 0.1em;
  padding: 2px 7px;
  border-radius: 100px;
}
.dtc-stance-tag.stance-for     { background: rgba(62,232,160,0.12);  color: var(--for);     border: 1px solid rgba(62,232,160,0.25); }
.dtc-stance-tag.stance-against { background: rgba(255,77,109,0.12);  color: var(--against); border: 1px solid rgba(255,77,109,0.25); }
.dtc-stance-tag.stance-neutral { background: rgba(245,158,11,0.1);   color: #f59e0b;        border: 1px solid rgba(245,158,11,0.2); }

.delta-badge { font-size: 9px; color: var(--for); letter-spacing: 0.04em; }

.agent-opinion { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-bottom: 8px; }

.agent-score-bar {
  height: 2px;
  background: var(--surface-2);
  border-radius: 1px;
  overflow: hidden;
}
.agent-score-fill { height: 100%; border-radius: 1px; transition: width 0.5s ease; }

/* Loading */
.loading-state {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
}
.loading-steps { display: flex; flex-direction: column; gap: 12px; }
.loading-step {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.4;
  transition: opacity 0.3s;
}
.loading-step.active { opacity: 1; }

.running-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  letter-spacing: 0.04em;
}

/* ── Stats Panel ── */
.stats-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-block { display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }
.stat-value { font-size: 40px; line-height: 1; color: var(--accent); }
.stat-sub   { font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em; }

/* Intent rows */
.intent-rows { display: flex; flex-direction: column; gap: 8px; }
.intent-row  { display: flex; align-items: center; gap: 8px; }
.intent-label {
  font-size: 9px;
  letter-spacing: 0.04em;
  width: 80px;
  flex-shrink: 0;
}
.intent-label.buy        { color: var(--for); }
.intent-label.considering { color: #f59e0b; }
.intent-label.wont       { color: var(--against); }
.intent-bar-wrap {
  flex: 1;
  height: 3px;
  background: var(--surface-2);
  border-radius: 2px;
  overflow: hidden;
}
.intent-bar { height: 100%; border-radius: 2px; transition: width 0.8s ease; min-width: 2px; }
.intent-pct { font-size: 10px; color: var(--text-dim); width: 28px; text-align: right; }

/* Round pills */
.round-pills { display: flex; flex-direction: column; gap: 6px; }
.round-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.round-pill.complete { border-color: rgba(62,232,160,0.25); background: rgba(62,232,160,0.05); }
.round-pill.active   { border-color: rgba(200,255,87,0.3);  background: rgba(200,255,87,0.05); }
.round-pill-num { font-size: 10px; color: var(--text-dim); width: 12px; }
.round-pill.complete .round-pill-num { color: var(--for); }
.round-pill.active   .round-pill-num { color: var(--accent); }
.round-pill-name { font-size: 9px; color: var(--text-dim); letter-spacing: 0.04em; }
.round-pill.complete .round-pill-name { color: var(--for); }
.round-pill.active   .round-pill-name { color: var(--accent); }

/* Trial rate */
.trial-rate-display { display: flex; align-items: baseline; gap: 4px; }
.trial-rate-num { font-size: 48px; line-height: 1; }

/* Report ready */
.report-ready { display: flex; flex-direction: column; gap: 10px; }
.report-ready-label {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.report-btn { justify-content: center; }

/* Spinner sm */
.spinner-sm {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(200,255,87,0.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 768px) {
  .workbench-grid { grid-template-columns: 1fr; }
  .stats-panel { position: static; }
  .steps-row { flex-wrap: wrap; gap: 4px; }
}
</style>