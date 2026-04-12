<template>
  <div class="sim-layout">

    <LoadingScreen
      v-if="showLoader"
      :numAgents="numAgents"
      @done="showLoader = false"
    />

    <!-- TOP BAR -->
    <div class="sim-topbar">
      <div class="topbar-left">
        <div class="sim-topic-label" v-if="debate">{{ debate.topic || `Simulation ${id.slice(0,8)}` }}</div>
        <div class="sim-topic-label muted" v-else>Loading simulation...</div>
        <div class="topbar-badges">
          <span class="tag" :class="polling ? 'tag-for' : 'tag-neutral'">
            <span v-if="polling" class="live-dot"></span>
            {{ polling ? 'LIVE' : 'COMPLETE' }}
          </span>
          <span class="mono muted" style="font-size:10px;">#{{ id.slice(0,12) }}</span>
        </div>
      </div>

      <div class="topbar-tabs">
        <button v-for="tab in ['Graph','Debate','Split']" :key="tab"
          class="tab-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>

      <div class="topbar-right">
        <button class="btn btn-ghost" @click="refreshDebate" :disabled="polling" style="font-size:10px;padding:6px 14px;">
          <span v-if="polling" class="spinner"></span>
          {{ polling ? 'Polling...' : '↺ Refresh' }}
        </button>
        <router-link :to="`/report/${id}`" class="btn btn-primary" style="font-size:10px;padding:7px 16px;">
          God's Eye View →
        </router-link>
      </div>
    </div>

    <!-- MAIN BODY -->
    <div class="sim-body">
      <div class="sim-main">

        <!-- GRAPH PANEL -->
        <div v-show="activeTab === 'Graph' || activeTab === 'Split'"
          class="panel-wrap" :class="{ half: activeTab === 'Split' }">
          <div class="panel-header mono">
            <span>Agent Relationship Graph</span>
            <span class="muted">{{ allAgents.length }} nodes · {{ edgeCount }} edges</span>
          </div>
          <div class="graph-area" ref="graphArea">
            <svg ref="graphSvg" class="graph-svg">
              <defs>
                <filter id="glow-for"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-against"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-neutral"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <radialGradient id="ng-for" cx="35%" cy="35%"><stop offset="0%" stop-color="#7EFFC4"/><stop offset="100%" stop-color="#1AAB6D"/></radialGradient>
                <radialGradient id="ng-against" cx="35%" cy="35%"><stop offset="0%" stop-color="#FF8FAA"/><stop offset="100%" stop-color="#CC1F45"/></radialGradient>
                <radialGradient id="ng-neutral" cx="35%" cy="35%"><stop offset="0%" stop-color="#A0B0CC"/><stop offset="100%" stop-color="#4A5568"/></radialGradient>
              </defs>
              <g ref="edgesG"></g>
              <g ref="nodesG"></g>
            </svg>

            <div v-if="!allAgents.length" class="graph-empty">
              <div class="graph-empty-icon">◎</div>
              <div class="mono">Waiting for agents...</div>
            </div>

            <div class="graph-legend">
              <div class="legend-item"><div class="legend-dot" style="background:var(--for)"></div><span class="mono">For</span></div>
              <div class="legend-item"><div class="legend-dot" style="background:var(--against)"></div><span class="mono">Against</span></div>
              <div class="legend-item"><div class="legend-dot" style="background:var(--neutral)"></div><span class="mono">Neutral</span></div>
              <div class="legend-sep"></div>
              <div class="legend-item"><div class="legend-line shifted"></div><span class="mono">Shifted</span></div>
              <div class="legend-item"><div class="legend-line held"></div><span class="mono">Debating</span></div>
            </div>

            <div v-if="hoveredAgent" class="agent-tooltip" :style="`left:${ttX}px;top:${ttY}px`">
              <div class="tt-name">{{ hoveredAgent.name }}</div>
              <div class="tag" :class="`tag-${hoveredAgent.stance}`" style="margin-bottom:6px;">{{ hoveredAgent.stance }}</div>
              <div class="tt-opinion">{{ hoveredAgent.opinion?.slice(0,120) }}{{ hoveredAgent.opinion?.length > 120 ? '...' : '' }}</div>
            </div>
          </div>
        </div>

        <!-- DEBATE PANEL -->
        <div v-show="activeTab === 'Debate' || activeTab === 'Split'"
          class="panel-wrap" :class="{ half: activeTab === 'Split' }">
          <div class="panel-header mono">
            <span>Debate Transcript</span>
            <span class="muted">{{ debate?.rounds?.length || 0 }} rounds</span>
          </div>
          <div class="debate-scroll">
            <div v-if="loading" class="debate-empty">
              <span class="spinner"></span>
              <span class="mono muted">Generating agents & seeding knowledge graph...</span>
            </div>
            <template v-else-if="debate?.rounds?.length">
              <div v-for="round in debate.rounds" :key="round.round" class="round-block">
                <div class="round-divider">
                  <div class="round-line"></div>
                  <span class="round-label display">ROUND {{ round.round }}</span>
                  <div class="round-line"></div>
                </div>
                <div class="stance-bar">
                  <div class="sb-seg" :style="`width:${(forCount(round)/round.agents.length)*100}%;background:var(--for)`"></div>
                  <div class="sb-seg" :style="`width:${(neutralCount(round)/round.agents.length)*100}%;background:var(--neutral)`"></div>
                  <div class="sb-seg" :style="`width:${(againstCount(round)/round.agents.length)*100}%;background:var(--against)`"></div>
                </div>
                <div v-for="agent in round.agents" :key="agent.id"
                  class="statement" :class="`stmt-${agent.stance}`"
                  @click="selectAgent(agent)">
                  <div class="stmt-who">
                    <div class="sm-avatar" :class="`avatar-${agent.stance}`">{{ agent.name?.charAt(0) }}</div>
                    <span class="stmt-name mono">{{ agent.name }}</span>
                    <span class="tag" :class="`tag-${agent.stance}`" style="font-size:9px;padding:2px 6px;">{{ agent.stance }}</span>
                    <span v-if="agent.opinion_delta" class="mono" :class="agent.opinion_delta>0?'delta-positive':'delta-negative'" style="font-size:10px;margin-left:auto;">
                      {{ agent.opinion_delta>0?'▲':'▼' }} {{ Math.abs(agent.opinion_delta).toFixed(2) }}
                    </span>
                  </div>
                  <p class="stmt-text">{{ agent.opinion }}</p>
                </div>
              </div>
            </template>
            <div v-else class="debate-empty">
              <span class="mono muted">No debate data yet. Try refreshing.</span>
            </div>
          </div>
        </div>

      </div>

      <!-- WORKBENCH -->
      <aside class="workbench">
        <div class="wb-header mono">Workbench</div>

        <div class="steps-list">
          <div v-for="(step, i) in steps" :key="step.id"
            class="step-item" :class="step.status">
            <div class="step-connector" v-if="i > 0"></div>
            <div class="step-dot">
              <span v-if="step.status==='complete'">✓</span>
              <span v-else-if="step.status==='active'" class="spinner" style="width:10px;height:10px;border-width:1.5px;"></span>
              <span v-else>{{ i+1 }}</span>
            </div>
            <div class="step-body">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc muted">{{ step.desc }}</div>
              <div v-if="step.endpoint" class="step-ep mono">{{ step.endpoint }}</div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="wb-sec">
          <div class="wb-sec-label mono">⚡ Inject Event</div>
          <textarea v-model="injectText" class="textarea" style="font-size:12px;min-height:60px;"
            placeholder="Breaking: A major study reveals..." :disabled="injecting"></textarea>
          <button class="btn btn-danger" style="width:100%;justify-content:center;margin-top:8px;font-size:10px;"
            :disabled="!injectText.trim()||injecting" @click="inject">
            <span v-if="injecting" class="spinner"></span>
            {{ injecting ? 'Broadcasting...' : 'Broadcast to agents' }}
          </button>
          <div v-if="injectResult" class="inject-result">
            <div class="mono muted" style="font-size:10px;margin-bottom:4px;">Tick {{ injectResult.injected_at_tick }}</div>
            <div v-for="r in injectResult.reactions?.slice(0,5)" :key="r.agent_id" class="inject-row mono">
              <span style="font-size:10px;">{{ r.name }}</span>
              <span :class="r.shifted?'delta-positive':'muted'" style="font-size:10px;">{{ r.shifted?'↻ shifted':'— held' }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="wb-sec">
          <div class="wb-sec-label mono">⑂ Branch Timeline</div>
          <input v-model.number="branchTick" type="number" class="input" style="font-size:12px;" placeholder="From tick (e.g. 2)"/>
          <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:8px;font-size:10px;"
            :disabled="!branchTick||branching" @click="branch">
            <span v-if="branching" class="spinner"></span>
            {{ branching ? 'Branching...' : 'Create parallel branch' }}
          </button>
          <div v-if="branchResult" class="mono" style="margin-top:8px;font-size:10px;">
            <span class="accent">✓ </span>
            <router-link :to="`/simulation/${branchResult.branch_id}`" class="accent">{{ branchResult.branch_id?.slice(0,10) }} →</router-link>
          </div>
        </div>

        <div class="divider"></div>

        <div class="wb-sec" v-if="latestRound">
          <div class="wb-sec-label mono">Distribution · Round {{ latestRound.round }}</div>
          <div class="dist-row">
            <span class="mono" style="color:var(--for);font-size:10px;width:36px;">FOR</span>
            <div class="dist-track"><div class="dist-fill" :style="`width:${(forCount(latestRound)/latestRound.agents.length)*100}%;background:var(--for)`"></div></div>
            <span class="mono muted" style="font-size:10px;width:18px;text-align:right;">{{ forCount(latestRound) }}</span>
          </div>
          <div class="dist-row">
            <span class="mono" style="color:var(--against);font-size:10px;width:36px;">AGN</span>
            <div class="dist-track"><div class="dist-fill" :style="`width:${(againstCount(latestRound)/latestRound.agents.length)*100}%;background:var(--against)`"></div></div>
            <span class="mono muted" style="font-size:10px;width:18px;text-align:right;">{{ againstCount(latestRound) }}</span>
          </div>
          <div class="dist-row">
            <span class="mono" style="color:var(--neutral);font-size:10px;width:36px;">NEU</span>
            <div class="dist-track"><div class="dist-fill" :style="`width:${(neutralCount(latestRound)/latestRound.agents.length)*100}%;background:var(--neutral)`"></div></div>
            <span class="mono muted" style="font-size:10px;width:18px;text-align:right;">{{ neutralCount(latestRound) }}</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- SYSTEM LOG -->
    <div class="sys-log" :class="{ expanded: logExpanded }">
      <div class="log-bar" @click="logExpanded = !logExpanded">
        <span class="mono" style="font-size:10px;letter-spacing:0.1em;">SYSTEM LOG</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="live-dot" v-if="polling"></span>
          <span class="mono muted" style="font-size:10px;">{{ logLines.length }} events</span>
          <span class="mono muted">{{ logExpanded ? '▾' : '▸' }}</span>
        </div>
      </div>
      <div class="log-body" ref="logBody">
        <div v-for="(l, i) in logLines" :key="i" class="log-line">
          <span class="log-time mono">{{ l.time }}</span>
          <span class="log-msg mono" :class="l.type">{{ l.msg }}</span>
        </div>
      </div>
    </div>

    <!-- AGENT DETAIL -->
    <transition name="slide-in">
      <div v-if="selectedAgent" class="agent-panel">
        <div class="ap-head">
          <div class="ap-avatar" :class="`avatar-${selectedAgent.stance}`">{{ selectedAgent.name?.charAt(0) }}</div>
          <div style="flex:1;min-width:0;">
            <div class="ap-name">{{ selectedAgent.name }}</div>
            <div class="tag" :class="`tag-${selectedAgent.stance}`" style="margin-top:4px;">{{ selectedAgent.stance }}</div>
          </div>
          <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" @click="selectedAgent=null">✕</button>
        </div>
        <div class="divider" style="margin:12px 0;"></div>
        <div class="ap-label mono">Persona</div>
        <p class="ap-text muted">{{ selectedAgent.persona }}</p>
        <div class="ap-label mono" style="margin-top:10px;">Opinion</div>
        <p class="ap-text">{{ selectedAgent.opinion }}</p>
        <div class="ap-stats">
          <div class="ap-stat">
            <span class="mono muted" style="font-size:10px;">Delta</span>
            <span class="mono" :class="(selectedAgent.opinion_delta||0)>0?'delta-positive':'delta-negative'">
              {{ selectedAgent.opinion_delta>0?'+':'' }}{{ (selectedAgent.opinion_delta||0).toFixed(3) }}
            </span>
          </div>
        </div>
        <router-link :to="`/agent/${selectedAgent.id}`" class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:12px;font-size:10px;">Memory across simulations →</router-link>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as d3 from 'd3'
import LoadingScreen from '../components/LoadingScreen.vue'
import { assembly } from '../api/assembly.js'

const props = defineProps({ id: String })

// ── Read agent count from URL ──────────────────────────────
const route     = useRoute()
const numAgents = parseInt(route.query.agents) || 20

// ── Refs ──────────────────────────────────────────────────
const debate        = ref(null)
const loading       = ref(true)
const showLoader    = ref(true)
const polling       = ref(false)
const activeTab     = ref('Debate')
const selectedAgent = ref(null)
const hoveredAgent  = ref(null)
const ttX           = ref(0)
const ttY           = ref(0)
const logExpanded   = ref(false)
const logLines      = ref([])
const logBody       = ref(null)

const graphSvg  = ref(null)
const graphArea = ref(null)
const edgesG    = ref(null)
const nodesG    = ref(null)

const injectText   = ref('')
const injecting    = ref(false)
const injectResult = ref(null)
const branchTick   = ref(null)
const branching    = ref(false)
const branchResult = ref(null)

let simulation = null
let resizeObs  = null
let pollTimer  = null

// ── Steps ─────────────────────────────────────────────────
const steps = ref([
  { id:1, title:'Knowledge Ingestion',  desc:'Web search + PDF parsing',            endpoint:'POST /api/simulation/start',      status:'pending' },
  { id:2, title:'Graph Build',          desc:'NetworkX + PageRank entity graph',     endpoint:'GET  /api/simulation/:id',        status:'pending' },
  { id:3, title:'Agent Generation',     desc:'Personas with demographics',           endpoint:null,                              status:'pending' },
  { id:4, title:'Structured Debate',    desc:'form → challenge → revise',            endpoint:'GET  /api/simulation/:id/debate', status:'pending' },
  { id:5, title:"God's Eye View",       desc:'ReportAgent synthesizes output',       endpoint:'GET  /api/report/:id',            status:'pending' },
])

// ── Computed ──────────────────────────────────────────────
const allAgents = computed(() => {
  if (!debate.value?.rounds?.length) return []
  return debate.value.rounds[debate.value.rounds.length-1].agents || []
})

const latestRound = computed(() => {
  if (!debate.value?.rounds?.length) return null
  return debate.value.rounds[debate.value.rounds.length-1]
})

const edgeCount = computed(() => {
  if (!debate.value?.rounds) return 0
  let c = 0
  debate.value.rounds.forEach(r => {
    const a = r.agents||[]
    for (let i=0;i<a.length;i++) for (let j=i+1;j<a.length;j++) if (a[i].stance!==a[j].stance) c++
  })
  return Math.min(c, 80)
})

const forCount     = r => r.agents.filter(a=>a.stance==='for').length
const againstCount = r => r.agents.filter(a=>a.stance==='against').length
const neutralCount = r => r.agents.filter(a=>a.stance==='neutral').length

// ── Log ───────────────────────────────────────────────────
function addLog(msg, type='info') {
  const t = new Date()
  const time = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}.${String(t.getMilliseconds()).padStart(3,'0')}`
  logLines.value.push({ time, msg, type })
  nextTick(() => { if (logBody.value) logBody.value.scrollTop = logBody.value.scrollHeight })
}

// ── Steps updater ─────────────────────────────────────────
function updateSteps() {
  const rounds = debate.value?.rounds?.length || 0
  steps.value[0].status = 'complete'
  steps.value[1].status = 'complete'
  steps.value[2].status = allAgents.value.length ? 'complete' : 'active'
  steps.value[3].status = rounds>0 ? (rounds>=3?'complete':'active') : 'pending'
  steps.value[4].status = rounds>=3 ? 'active' : 'pending'
}

// ── D3 Graph ──────────────────────────────────────────────
const stanceColor = { for:'#3EE8A0', against:'#FF4D6D', neutral:'#7A8BA6' }
const stanceFill  = { for:'url(#ng-for)', against:'url(#ng-against)', neutral:'url(#ng-neutral)' }
const NODE_R      = 16  // fixed equal size for all nodes

function buildGraph() {
  if (!graphSvg.value || !graphArea.value || !allAgents.value.length) return
  const W = graphArea.value.clientWidth
  const H = graphArea.value.clientHeight
  if (W < 10 || H < 10) return

  d3.select(graphSvg.value).attr('width', W).attr('height', H)

  const links = []
  ;(debate.value?.rounds || []).forEach(round => {
    const agents = round.agents || []
    for (let i=0;i<agents.length;i++) {
      for (let j=i+1;j<agents.length;j++) {
        if (agents[i].stance !== agents[j].stance) {
          const ex = links.find(l =>
            (l.source===agents[i].id&&l.target===agents[j].id) ||
            (l.source===agents[j].id&&l.target===agents[i].id)
          )
          if (!ex) links.push({
            source: agents[i].id, target: agents[j].id,
            shifted: agents[i].opinion_delta!==0 || agents[j].opinion_delta!==0,
          })
        }
      }
    }
  })

  // Equal size nodes — r is fixed
  const nodes = allAgents.value.map(a => ({ ...a, r: NODE_R }))
  const nodeMap = new Map(nodes.map(n=>[n.id,n]))
  const validLinks = links.filter(l=>nodeMap.has(l.source)&&nodeMap.has(l.target)).slice(0,80)

  d3.select(nodesG.value).selectAll('*').remove()
  d3.select(edgesG.value).selectAll('*').remove()
  if (simulation) simulation.stop()

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(validLinks).id(d=>d.id).distance(70).strength(0.25))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('collide', d3.forceCollide(NODE_R + 8))
    .force('x', d3.forceX(W/2).strength(0.03))
    .force('y', d3.forceY(H/2).strength(0.03))

  const edgeSel = d3.select(edgesG.value)
    .selectAll('line').data(validLinks).join('line')
    .attr('stroke', d => d.shifted ? 'rgba(62,232,160,0.3)' : 'rgba(255,255,255,0.06)')
    .attr('stroke-width', d => d.shifted ? 1.5 : 1)
    .attr('stroke-dasharray', d => d.shifted ? null : '3,5')

  const nodeSel = d3.select(nodesG.value)
    .selectAll('g').data(nodes).join('g').attr('cursor','pointer')
    .call(d3.drag()
      .on('start', (e,d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y })
      .on('drag',  (e,d) => { d.fx=e.x; d.fy=e.y })
      .on('end',   (e,d) => { if (!e.active) simulation.alphaTarget(0); d.fx=null; d.fy=null })
    )
    .on('mouseenter', (event, d) => {
      hoveredAgent.value = d
      const rect = graphArea.value.getBoundingClientRect()
      ttX.value = event.clientX - rect.left + 16
      ttY.value = event.clientY - rect.top - 10
    })
    .on('mouseleave', () => { hoveredAgent.value = null })
    .on('click', (e, d) => selectAgent(d))

  nodeSel.append('circle').attr('r', NODE_R+6).attr('fill','none')
    .attr('stroke', d=>stanceColor[d.stance]||'#7A8BA6').attr('stroke-width', 1).attr('opacity', 0.18)

  nodeSel.append('circle').attr('r', NODE_R)
    .attr('fill', d=>stanceFill[d.stance]||stanceFill.neutral)
    .attr('filter', d=>`url(#glow-${d.stance})`)
    .attr('stroke', d=>stanceColor[d.stance]||'#7A8BA6').attr('stroke-width', 1.5)

  nodeSel.filter(d=>Math.abs(d.opinion_delta||0)>0.05)
    .append('circle').attr('r', NODE_R+4).attr('fill','none')
    .attr('stroke', d=>(d.opinion_delta||0)>0?'rgba(200,255,87,0.5)':'rgba(255,77,109,0.5)')
    .attr('stroke-width',1.5).attr('stroke-dasharray','3,3')

  nodeSel.append('text').text(d=>d.name?.charAt(0)||'?')
    .attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('font-family','Bebas Neue,sans-serif').attr('font-size', NODE_R * 0.9)
    .attr('fill','rgba(255,255,255,0.9)').attr('pointer-events','none')

  nodeSel.append('text').text(d=>d.name?.split(' ')[0]||'')
    .attr('text-anchor','middle').attr('dy', NODE_R+14)
    .attr('font-family','JetBrains Mono,monospace').attr('font-size',9)
    .attr('fill','rgba(255,255,255,0.4)').attr('pointer-events','none')

  simulation.on('tick', () => {
    edgeSel.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
            .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y)
    nodeSel.attr('transform',d=>`translate(${d.x},${d.y})`)
  })
}

watch(allAgents, () => nextTick(buildGraph), { deep:true })

// ── API — only refreshDebate here, never startSimulation ───
async function refreshDebate() {
  polling.value = true
  addLog(`Polling simulation ${props.id.slice(0,8)}...`)
  try {
    debate.value = await assembly.getDebate(props.id)
    addLog(`${debate.value.rounds?.length||0} rounds · ${allAgents.value.length} agents`, 'success')
    updateSteps()
    nextTick(buildGraph)
  } catch(e) {
    addLog(`Error: ${e.message}`, 'error')
  } finally {
    polling.value = false
    loading.value = false
  }
}

async function inject() {
  injecting.value = true; injectResult.value = null
  addLog(`Injecting: "${injectText.value.slice(0,40)}..."`)
  try {
    injectResult.value = await assembly.injectEvent({ simulation_id:props.id, event:injectText.value })
    const s = injectResult.value.reactions?.filter(r=>r.shifted).length||0
    addLog(`Injected at tick ${injectResult.value.injected_at_tick} · ${s} shifted`, 'success')
    injectText.value = ''
    setTimeout(refreshDebate, 1500)
  } catch(e) { addLog(`Inject failed: ${e.message}`, 'error') }
  finally { injecting.value = false }
}

async function branch() {
  branching.value = true; branchResult.value = null
  addLog(`Branching from tick ${branchTick.value}...`)
  try {
    branchResult.value = await assembly.branchSimulation({ simulation_id:props.id, from_tick:branchTick.value })
    addLog(`Branch: ${branchResult.value.branch_id?.slice(0,10)}`, 'success')
  } catch(e) { addLog(`Branch failed: ${e.message}`, 'error') }
  finally { branching.value = false }
}

function selectAgent(agent) {
  selectedAgent.value = selectedAgent.value?.id===agent.id ? null : agent
  if (agent) addLog(`Selected: ${agent.name} (${agent.stance})`)
}

// ── Lifecycle — NO startSimulation call here ───────────────
onMounted(async () => {
  addLog('Simulation view initialised.')
  steps.value[0].status = 'active'
  await refreshDebate()
  nextTick(() => {
    buildGraph()
    resizeObs = new ResizeObserver(() => buildGraph())
    if (graphArea.value) resizeObs.observe(graphArea.value)
  })
  pollTimer = setInterval(() => {
    if (!allAgents.value.length || (debate.value?.rounds?.length||0) < 3) {
      refreshDebate()
    }
  }, 8000)
})

onUnmounted(() => {
  if (simulation) simulation.stop()
  if (resizeObs)  resizeObs.disconnect()
  clearInterval(pollTimer)
})
</script>

<style scoped>
.sim-layout { display:flex; flex-direction:column; height:calc(100vh - 56px); overflow:hidden; }

.sim-topbar { display:flex; align-items:center; gap:16px; padding:0 20px; height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--bg-2); }
.topbar-left  { flex:1; display:flex; align-items:center; gap:12px; min-width:0; }
.topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.topbar-badges { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.sim-topic-label { font-weight:500; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.topbar-tabs { display:flex; gap:3px; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:3px; }
.tab-btn { font-family:var(--mono); font-size:10px; letter-spacing:.06em; text-transform:uppercase; padding:5px 14px; border-radius:4px; border:none; background:transparent; color:var(--text-muted); cursor:pointer; transition:all var(--transition); }
.tab-btn.active { background:var(--surface-2); color:var(--text); border:1px solid var(--border-hi); }

.sim-body { flex:1; display:grid; grid-template-columns:1fr 256px; overflow:hidden; }
.sim-main { display:flex; overflow:hidden; }

.panel-wrap { display:flex; flex-direction:column; flex:1; overflow:hidden; border-right:1px solid var(--border); }
.panel-wrap.half { flex:1; }
.panel-header { display:flex; justify-content:space-between; align-items:center; padding:10px 16px; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border); flex-shrink:0; }

.graph-area { flex:1; overflow:hidden; position:relative; background:var(--bg); }
.graph-svg  { width:100%; height:100%; display:block; }
.graph-empty { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--text-dim); font-size:11px; letter-spacing:.08em; text-transform:uppercase; pointer-events:none; }
.graph-empty-icon { font-size:40px; opacity:.15; animation:pulse 2s ease-in-out infinite; }
.graph-legend { position:absolute; bottom:14px; left:14px; display:flex; align-items:center; gap:12px; background:rgba(6,8,15,.85); border:1px solid var(--border); border-radius:6px; padding:7px 12px; backdrop-filter:blur(8px); }
.legend-item { display:flex; align-items:center; gap:5px; font-size:10px; color:var(--text-muted); }
.legend-dot  { width:8px; height:8px; border-radius:50%; }
.legend-sep  { width:1px; height:14px; background:var(--border); }
.legend-line { width:18px; height:1.5px; }
.legend-line.shifted { background:rgba(62,232,160,.5); }
.legend-line.held    { background:rgba(255,255,255,.15); }
.agent-tooltip { position:absolute; pointer-events:none; background:var(--surface-2); border:1px solid var(--border-hi); border-radius:8px; padding:12px 14px; width:210px; z-index:50; box-shadow:0 8px 32px rgba(0,0,0,.5); }
.tt-name   { font-weight:600; font-size:13px; margin-bottom:6px; }
.tt-opinion { font-size:11px; color:var(--text-muted); line-height:1.5; }

.debate-scroll { flex:1; overflow-y:auto; padding:16px; }
.debate-empty  { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; height:200px; color:var(--text-muted); font-size:12px; }
.round-block   { margin-bottom:24px; }
.round-divider { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.round-line    { flex:1; height:1px; background:var(--border); }
.round-label   { font-size:13px; color:var(--text-muted); white-space:nowrap; }
.stance-bar    { display:flex; height:3px; border-radius:2px; overflow:hidden; margin-bottom:12px; }
.sb-seg        { transition:width .5s ease; }
.statement { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:10px 12px; margin-bottom:6px; cursor:pointer; transition:all var(--transition); }
.statement:hover { border-color:var(--border-hi); background:var(--surface-2); }
.stmt-for     { border-left:2px solid rgba(62,232,160,.4); }
.stmt-against { border-left:2px solid rgba(255,77,109,.4); }
.stmt-neutral { border-left:2px solid rgba(122,139,166,.2); }
.stmt-who  { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.sm-avatar { width:18px; height:18px; border-radius:50%; font-size:8px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.avatar-for     { background:rgba(62,232,160,.2);  color:var(--for); }
.avatar-against { background:rgba(255,77,109,.2);  color:var(--against); }
.avatar-neutral { background:rgba(122,139,166,.2); color:var(--neutral); }
.stmt-name { font-size:11px; font-weight:500; }
.stmt-text { font-size:12px; color:var(--text-muted); line-height:1.6; }

.workbench { display:flex; flex-direction:column; overflow-y:auto; background:var(--bg-2); border-left:1px solid var(--border); }
.wb-header { padding:14px 16px; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border); flex-shrink:0; }
.steps-list { padding:16px; }
.step-item  { display:flex; gap:10px; position:relative; padding-bottom:14px; }
.step-connector { position:absolute; left:9px; top:-14px; width:1px; height:14px; background:var(--border); }
.step-dot { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; flex-shrink:0; border:1px solid var(--border); background:var(--surface); color:var(--text-muted); transition:all var(--transition); }
.step-item.complete .step-dot { background:rgba(62,232,160,.15); border-color:var(--for); color:var(--for); }
.step-item.active   .step-dot { border-color:var(--accent); box-shadow:0 0 8px rgba(200,255,87,.3); }
.step-body { flex:1; min-width:0; }
.step-title { font-size:12px; font-weight:500; margin-bottom:2px; color:var(--text-muted); }
.step-desc  { font-size:10px; color:var(--text-dim); line-height:1.4; }
.step-ep    { font-family:var(--mono); font-size:9px; color:var(--accent); margin-top:3px; opacity:.55; }
.step-item.complete .step-title { color:var(--text); }
.step-item.active   .step-title { color:var(--accent); }
.wb-sec       { padding:14px 16px; border-top:1px solid var(--border); }
.wb-sec-label { font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; font-family:var(--mono); }
.inject-result { margin-top:8px; }
.inject-row    { display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid var(--border); }
.dist-row   { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.dist-track { flex:1; height:3px; background:var(--surface-2); border-radius:2px; overflow:hidden; }
.dist-fill  { height:100%; border-radius:2px; transition:width .5s ease; }

.sys-log { border-top:1px solid var(--border); background:var(--bg); flex-shrink:0; height:36px; overflow:hidden; transition:height var(--transition); }
.sys-log.expanded { height:150px; }
.log-bar  { display:flex; justify-content:space-between; align-items:center; padding:0 16px; height:36px; cursor:pointer; }
.log-bar:hover { background:var(--surface); }
.log-body { height:114px; overflow-y:auto; padding:6px 16px; }
.log-line { display:flex; gap:12px; padding:2px 0; }
.log-time { font-size:10px; color:var(--text-dim); flex-shrink:0; }
.log-msg  { font-size:10px; color:var(--text-muted); }
.log-msg.success { color:var(--for); }
.log-msg.error   { color:var(--against); }

.agent-panel { position:fixed; bottom:50px; right:270px; width:270px; background:var(--surface-2); border:1px solid var(--border-hi); border-radius:12px; padding:16px; z-index:200; box-shadow:0 16px 48px rgba(0,0,0,.6); }
.ap-head { display:flex; align-items:center; gap:10px; }
.ap-avatar { width:38px; height:38px; border-radius:50%; font-family:var(--display); font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ap-name  { font-size:14px; font-weight:600; }
.ap-label { font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:4px; }
.ap-text  { font-size:12px; line-height:1.6; }
.ap-stats { display:flex; gap:20px; margin-top:12px; }
.ap-stat  { display:flex; flex-direction:column; gap:2px; }

.slide-in-enter-active, .slide-in-leave-active { transition:all .25s cubic-bezier(.16,1,.3,1); }
.slide-in-enter-from { opacity:0; transform:translateX(16px); }
.slide-in-leave-to   { opacity:0; transform:translateX(16px); }

@media (max-width: 900px) { .sim-body { grid-template-columns:1fr; } .workbench { display:none; } }
@media (max-width: 768px) {
  .sim-topbar { padding:8px 12px; height:auto; flex-wrap:wrap; gap:6px; }
  .sim-topic-label { font-size:11px; width:100%; }
  .topbar-badges { order:-1; }
  .topbar-tabs { order:2; width:100%; justify-content:center; }
  .tab-btn { flex:1; text-align:center; padding:6px 4px; font-size:9px; }
  .topbar-right { order:1; margin-left:auto; }
  .topbar-right .btn-ghost { display:none; }
  .sim-main { flex-direction:column; }
  .graph-area { height:300px; min-height:300px; }
  .debate-scroll { padding:10px; max-height:60vh; }
  .agent-panel { position:fixed; bottom:0; left:0; right:0; width:100%; border-radius:16px 16px 0 0; padding:20px 16px 32px; z-index:300; }
  .sys-log { height:32px; }
  .sys-log.expanded { height:120px; }
}
@media (max-width: 480px) {
  .graph-legend { gap:8px; padding:5px 10px; font-size:9px; }
  .legend-dot { width:6px; height:6px; }
}
</style>