<template>
  <div class="sim-layout">

    <LoadingScreen
      v-if="showLoader"
      :numAgents="numAgents"
      @done="onLoaderDone"
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
        </div>
      </div>

      <div class="topbar-tabs">
        <button v-for="tab in ['Graph','Debate','Split']" :key="tab"
          class="tab-btn" :class="{ active: activeTab === tab }" @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>

      <div class="topbar-right">
        <!-- Issue 9: refresh button shows live status -->
        <div class="live-status mono" v-if="polling">
          <span class="live-dot"></span>
          {{ liveStatus }}
        </div>
        <!-- God's Eye View stays lime (btn-primary) -->
        <router-link :to="`/report/${id}`" class="btn btn-primary" style="font-size:10px;padding:7px 16px;">
          God's Eye View →
        </router-link>
      </div>
    </div>

    <!-- MAIN BODY -->
    <div class="sim-body">
      <div class="sim-main">

        <!-- Error banner -->
        <div v-if="simError" class="sim-error-banner mono">
          <span class="sim-error-icon">⚠</span>
          <div style="flex:1;">
            <div class="sim-error-title">Simulation failed</div>
            <div class="sim-error-msg">{{ simError }}</div>
          </div>
          <router-link to="/" class="btn btn-primary" style="font-size:10px;padding:6px 14px;flex-shrink:0;">+ New Simulation</router-link>
        </div>

        <!-- GRAPH PANEL -->
        <div v-show="activeTab === 'Graph' || activeTab === 'Split'"
          class="panel-wrap" :class="{ half: activeTab === 'Split' }">
          <div class="panel-header mono">
            <span>Agent Relationship Graph</span>
            <span class="muted">{{ allAgents.length }} agents · {{ edgeCount }} connections</span>
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

            <!-- Issue 9: real-time agent creation indicator -->
            <div v-if="!allAgents.length && !simError" class="graph-empty">
              <div class="graph-empty-icon">◎</div>
              <div class="mono" v-if="agentsCreated > 0">{{ agentsCreated }} agents spawning...</div>
              <div class="mono" v-else>Ingesting sources & building graph...</div>
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
            <span class="muted">{{ debate?.rounds?.length || 0 }} of {{ numRounds }} rounds</span>
          </div>
          <div class="debate-scroll">

            <!-- Issue 9: real-time loading states -->
            <div v-if="loading" class="debate-empty">
              <span class="spinner"></span>
              <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
                <span class="mono muted">{{ liveStatus }}</span>
                <div v-if="agentsCreated > 0" class="agents-progress mono">
                  <span class="accent">{{ agentsCreated }}</span> agents ready
                </div>
              </div>
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

              <!-- Issue 9: show "waiting for next round" while still polling -->
              <div v-if="polling && debate.rounds.length < numRounds" class="round-waiting mono">
                <span class="spinner" style="width:12px;height:12px;border-width:1.5px;"></span>
                Running round {{ debate.rounds.length + 1 }}...
              </div>
            </template>

            <div v-else class="debate-empty">
              <span class="mono muted">No debate data yet — checking again shortly...</span>
            </div>
          </div>
        </div>

      </div>

      <!-- WORKBENCH — issues 3, 4, 5, 6 -->
      <aside class="workbench">
        <div class="wb-header mono">Simulation Progress</div>

        <!-- Clean progress steps — no API endpoints -->
        <div class="progress-steps">
          <div v-for="(step, i) in steps" :key="step.id" class="progress-step" :class="step.status">
            <div class="ps-indicator">
              <span v-if="step.status==='complete'" class="ps-check">✓</span>
              <span v-else-if="step.status==='active'" class="spinner" style="width:10px;height:10px;border-width:1.5px;"></span>
              <span v-else class="ps-dot"></span>
            </div>
            <div class="ps-body">
              <div class="ps-title">{{ step.title }}</div>
              <div class="ps-desc muted">{{ step.desc }}</div>
            </div>
          </div>
        </div>

        <!-- Overall progress bar -->
        <div class="wb-progress-wrap" v-if="progressPct < 100">
          <div class="wb-progress-bar">
            <div class="wb-progress-fill" :style="`width:${progressPct}%`"></div>
          </div>
          <span class="mono muted" style="font-size:9px;margin-top:4px;">{{ progressPct }}% complete</span>
        </div>

        <div class="divider"></div>

        <!-- Live distribution -->
        <div class="wb-sec" v-if="latestRound">
          <div class="wb-sec-label mono">Live Distribution · Round {{ latestRound.round }}</div>
          <div class="dist-row">
            <span class="mono" style="color:var(--for);font-size:10px;width:36px;">FOR</span>
            <div class="dist-track"><div class="dist-fill" :style="`width:${(forCount(latestRound)/latestRound.agents.length)*100}%;background:var(--for)`"></div></div>
            <span class="mono muted" style="font-size:10px;width:24px;text-align:right;">{{ forCount(latestRound) }}</span>
          </div>
          <div class="dist-row">
            <span class="mono" style="color:var(--against);font-size:10px;width:36px;">AGN</span>
            <div class="dist-track"><div class="dist-fill" :style="`width:${(againstCount(latestRound)/latestRound.agents.length)*100}%;background:var(--against)`"></div></div>
            <span class="mono muted" style="font-size:10px;width:24px;text-align:right;">{{ againstCount(latestRound) }}</span>
          </div>
          <div class="dist-row">
            <span class="mono" style="color:var(--neutral);font-size:10px;width:36px;">NEU</span>
            <div class="dist-track"><div class="dist-fill" :style="`width:${(neutralCount(latestRound)/latestRound.agents.length)*100}%;background:var(--neutral)`"></div></div>
            <span class="mono muted" style="font-size:10px;width:24px;text-align:right;">{{ neutralCount(latestRound) }}</span>
          </div>
        </div>

        <div class="divider" v-if="latestRound"></div>

        <!-- Actions -->
        <div class="wb-sec">
          <div class="wb-sec-label mono">Actions</div>
          <router-link :to="`/report/${id}`" class="btn btn-primary" style="width:100%;justify-content:center;font-size:10px;margin-bottom:8px;">
            God's Eye View →
          </router-link>
          <button class="btn btn-ghost" style="width:100%;justify-content:center;font-size:10px;" @click="copyLink">
            {{ linkCopied ? '✓ Link Copied!' : '⤴ Share Simulation' }}
          </button>
        </div>

      </aside>
    </div>

    <!-- AGENT DETAIL PANEL -->
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

const route     = useRoute()
const numAgents = parseInt(route.query.agents) || 20
const numRounds = parseInt(route.query.rounds) || 3

const loaderKey  = `assembly_loader_${props.id}`
const showLoader = ref(!sessionStorage.getItem(loaderKey))

function onLoaderDone() {
  showLoader.value = false
  sessionStorage.setItem(loaderKey, '1')
}

// ── Refs ──────────────────────────────────────────────────────────
const debate        = ref(null)
const loading       = ref(true)
const reportFetched = ref(false)
const polling       = ref(false)
const activeTab     = ref('Split')
const selectedAgent = ref(null)
const hoveredAgent  = ref(null)
const ttX           = ref(0)
const ttY           = ref(0)
const simError      = ref('')
const agentsCreated = ref(0)       // issue 9: real-time agent count
const liveStatus    = ref('Ingesting sources...')  // issue 9: status text
const linkCopied    = ref(false)

const graphSvg  = ref(null)
const graphArea = ref(null)
const edgesG    = ref(null)
const nodesG    = ref(null)

let simulation    = null
let resizeObs     = null
let pollTimer     = null
let particleTimer = null

// ── Clean steps — no API endpoints ────────────────────────────────
const steps = ref([
  { id:1, title:'Knowledge Ingestion',  desc:'Reading 400–600 real web sources',    status:'pending' },
  { id:2, title:'Knowledge Graph',      desc:'Building entity relationship network', status:'pending' },
  { id:3, title:'Agent Generation',     desc:'Spawning stakeholder personas',        status:'pending' },
  { id:4, title:'Structured Debate',    desc:'Running opinion dynamics simulation',  status:'pending' },
  { id:5, title:"God's Eye View",       desc:'Synthesizing final report',            status:'pending' },
])

const progressPct = computed(() => {
  const done = steps.value.filter(s => s.status === 'complete').length
  const active = steps.value.some(s => s.status === 'active') ? 0.5 : 0
  return Math.round(((done + active) / steps.value.length) * 100)
})

// ── Computed ──────────────────────────────────────────────────────
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

// ── Steps updater ─────────────────────────────────────────────────
function updateSteps() {
  const rounds    = debate.value?.rounds?.length || 0
  const hasAgents = allAgents.value.length > 0

  steps.value[0].status = 'complete'
  steps.value[1].status = 'complete'

  if (!hasAgents) {
    steps.value[2].status = 'active'
    steps.value[3].status = 'pending'
    steps.value[4].status = 'pending'
    liveStatus.value = agentsCreated.value > 0
      ? `Spawning agents (${agentsCreated.value} ready)...`
      : 'Building knowledge graph...'
  } else if (hasAgents && rounds === 0) {
    steps.value[2].status = 'complete'
    steps.value[3].status = 'active'
    steps.value[4].status = 'pending'
    liveStatus.value = 'Running debate round 1...'
  } else if (rounds > 0 && rounds < numRounds) {
    steps.value[2].status = 'complete'
    steps.value[3].status = 'active'
    steps.value[4].status = 'pending'
    liveStatus.value = `Running debate round ${rounds + 1}...`
  } else if (rounds >= numRounds && !reportFetched.value) {
    steps.value[2].status = 'complete'
    steps.value[3].status = 'complete'
    steps.value[4].status = 'active'
    liveStatus.value = 'Generating God\'s Eye View...'
  } else if (reportFetched.value) {
    steps.value.forEach(s => s.status = 'complete')
    liveStatus.value = 'Complete'
  }
}

// ── D3 Graph ──────────────────────────────────────────────────────
const stanceColor = { for:'#3EE8A0', against:'#FF4D6D', neutral:'#7A8BA6' }
const stanceFill  = { for:'url(#ng-for)', against:'url(#ng-against)', neutral:'url(#ng-neutral)' }
const NODE_R      = 16

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

  startParticleAnimation(nodes, validLinks)
}

// ── Particle animation ────────────────────────────────────────────
function startParticleAnimation(nodes, validLinks) {
  if (particleTimer) clearInterval(particleTimer)
  if (!validLinks.length || !edgesG.value) return

  d3.select(edgesG.value).select('.particles-layer').remove()
  const particlesG = d3.select(edgesG.value).append('g').attr('class', 'particles-layer')

  particleTimer = setInterval(() => {
    if (!edgesG.value || !validLinks.length) return
    const batch = [...validLinks].sort(() => Math.random() - 0.5).slice(0, 4)

    batch.forEach(link => {
      const src = link.source
      const tgt = link.target
      if (!src || !tgt || src.x == null || tgt.x == null) return

      const fromNode = Math.random() > 0.5 ? src : tgt
      const toNode   = fromNode === src ? tgt : src
      const color    = stanceColor[fromNode.stance] || '#7A8BA6'

      const dot = particlesG.append('circle')
        .attr('r', 4).attr('fill', color)
        .attr('cx', fromNode.x).attr('cy', fromNode.y)
        .attr('opacity', 0)
        .attr('filter', `url(#glow-${fromNode.stance})`)

      dot.transition().duration(120).attr('opacity', 0.9)
        .transition().duration(850).ease(d3.easeLinear)
        .attr('cx', toNode.x).attr('cy', toNode.y)
        .transition().duration(130).attr('opacity', 0).remove()
    })
  }, 650)
}

watch(allAgents, () => nextTick(buildGraph), { deep:true })

// ── API + Real-time polling ────────────────────────────────────────
async function refreshDebate() {
  if (polling.value) return  // prevent overlapping calls
  polling.value = true

  try {
    // Check status — get real-time agent count (issue 9)
    const status = await assembly.getStatus(props.id)

    if (status.status === 'failed') {
      simError.value = status.error_message || status.error || 'Simulation failed. Please try again.'
      clearInterval(pollTimer)
      polling.value = false
      loading.value = false
      return
    }

    // Update real-time agent count for UI
    if (status.agents_created > 0) {
      agentsCreated.value = status.agents_created
    }

    // Fetch debate data
    const debateData = await assembly.getDebate(props.id)
    const prevRounds = debate.value?.rounds?.length || 0
    debate.value = debateData

    // New round arrived — rebuild graph
    if (debateData.rounds?.length > prevRounds) {
      nextTick(buildGraph)
    }

    // Try fetching report when debate complete
    if (debateData.rounds?.length >= numRounds && !reportFetched.value) {
      try {
        await assembly.getReport(props.id)
        reportFetched.value = true
      } catch {}
    }

    updateSteps()

    // Stop polling when fully complete
    if (reportFetched.value || debateData.rounds?.length >= numRounds) {
      clearInterval(pollTimer)
      pollTimer = null
    }

    if (allAgents.value.length > 0) {
      loading.value = false
      nextTick(buildGraph)
    }

  } catch(e) {
    // Silent fail — just try again next poll
  } finally {
    polling.value = false
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    linkCopied.value = true
    setTimeout(() => linkCopied.value = false, 2500)
  })
}

function selectAgent(agent) {
  selectedAgent.value = selectedAgent.value?.id===agent.id ? null : agent
}

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  steps.value[0].status = 'active'
  liveStatus.value = 'Ingesting sources...'

  // Initial fetch
  await refreshDebate()

  nextTick(() => {
    buildGraph()
    resizeObs = new ResizeObserver(() => buildGraph())
    if (graphArea.value) resizeObs.observe(graphArea.value)
  })

  // Issue 9: poll every 2.5s for real-time updates
  pollTimer = setInterval(() => {
    if (!simError.value) refreshDebate()
  }, 2500)
})

onUnmounted(() => {
  if (simulation)   simulation.stop()
  if (resizeObs)    resizeObs.disconnect()
  if (pollTimer)    clearInterval(pollTimer)
  if (particleTimer) clearInterval(particleTimer)
})
</script>

<style scoped>
.sim-layout { display:flex; flex-direction:column; height:calc(100vh - 52px); overflow:hidden; }

/* Top bar */
.sim-topbar { display:flex; align-items:center; gap:16px; padding:0 20px; height:52px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--bg-2); }
.topbar-left  { flex:1; display:flex; align-items:center; gap:12px; min-width:0; }
.topbar-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.topbar-badges { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.sim-topic-label { font-weight:500; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.topbar-tabs { display:flex; gap:3px; background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:3px; }
.tab-btn { font-family:var(--mono); font-size:10px; letter-spacing:.06em; text-transform:uppercase; padding:5px 14px; border-radius:4px; border:none; background:transparent; color:var(--text-muted); cursor:pointer; transition:all var(--transition); }
.tab-btn.active { background:var(--surface-2); color:var(--text); border:1px solid var(--border-hi); }

/* Real-time status */
.live-status { display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-muted); letter-spacing:0.04em; }

/* Main body */
.sim-body { flex:1; display:grid; grid-template-columns:1fr 240px; overflow:hidden; position:relative; }
.sim-main { display:flex; overflow:hidden; }

/* Error */
.sim-error-banner { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:flex; align-items:center; gap:16px; background:var(--surface-2); border:1px solid rgba(255,77,109,0.3); border-radius:var(--radius-lg); padding:20px 24px; max-width:480px; width:90%; z-index:50; }
.sim-error-icon { font-size:24px; color:var(--against); flex-shrink:0; }
.sim-error-title { font-size:12px; color:var(--against); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:4px; }
.sim-error-msg { font-size:12px; color:var(--text-muted); line-height:1.5; }

/* Panels */
.panel-wrap { display:flex; flex-direction:column; flex:1; overflow:hidden; border-right:1px solid var(--border); }
.panel-wrap.half { flex:1; }
.panel-header { display:flex; justify-content:space-between; align-items:center; padding:10px 16px; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border); flex-shrink:0; }

/* Graph */
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

/* Debate */
.debate-scroll { flex:1; overflow-y:auto; padding:16px; }
.debate-empty  { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; height:200px; color:var(--text-muted); font-size:12px; }
.agents-progress { background:rgba(62,232,160,0.1); border:1px solid rgba(62,232,160,0.2); border-radius:100px; padding:4px 12px; font-size:10px; color:var(--for); }
.round-block   { margin-bottom:24px; }
.round-divider { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.round-line    { flex:1; height:1px; background:var(--border); }
.round-label   { font-size:13px; color:var(--text-muted); white-space:nowrap; }
.stance-bar    { display:flex; height:3px; border-radius:2px; overflow:hidden; margin-bottom:12px; }
.sb-seg        { transition:width .5s ease; }
.round-waiting { display:flex; align-items:center; gap:8px; padding:12px 0; font-size:11px; color:var(--text-dim); }
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

/* Workbench — reworked clean design */
.workbench { display:flex; flex-direction:column; overflow-y:auto; background:var(--bg-2); border-left:1px solid var(--border); }
.wb-header { padding:14px 16px; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border); flex-shrink:0; font-family:var(--mono); }

/* Clean progress steps */
.progress-steps { padding:16px; display:flex; flex-direction:column; gap:10px; }
.progress-step { display:flex; align-items:flex-start; gap:10px; }
.ps-indicator { width:18px; height:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
.ps-check { width:16px; height:16px; border-radius:50%; background:rgba(62,232,160,.15); border:1px solid var(--for); color:var(--for); font-size:9px; display:flex; align-items:center; justify-content:center; }
.ps-dot { width:6px; height:6px; border-radius:50%; background:var(--border); display:block; margin:auto; }
.progress-step.active .ps-dot { background:var(--accent); box-shadow:0 0 6px rgba(200,255,87,.4); }
.ps-body { flex:1; }
.ps-title { font-size:11px; font-weight:500; color:var(--text-muted); margin-bottom:1px; transition:color var(--transition); }
.ps-desc  { font-size:9px; color:var(--text-dim); line-height:1.4; }
.progress-step.complete .ps-title { color:var(--text); }
.progress-step.active   .ps-title { color:var(--accent); }

/* Progress bar */
.wb-progress-wrap { padding:0 16px 12px; display:flex; flex-direction:column; }
.wb-progress-bar { height:3px; background:var(--surface-2); border-radius:2px; overflow:hidden; }
.wb-progress-fill { height:100%; background:linear-gradient(90deg, var(--accent), rgba(200,255,87,0.6)); border-radius:2px; transition:width 0.8s ease; }

.wb-sec       { padding:14px 16px; border-top:1px solid var(--border); }
.wb-sec-label { font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; font-family:var(--mono); }
.dist-row   { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.dist-track { flex:1; height:3px; background:var(--surface-2); border-radius:2px; overflow:hidden; }
.dist-fill  { height:100%; border-radius:2px; transition:width .5s ease; }

/* Agent detail */
.agent-panel { position:fixed; bottom:20px; right:256px; width:270px; background:var(--surface-2); border:1px solid var(--border-hi); border-radius:12px; padding:16px; z-index:200; box-shadow:0 16px 48px rgba(0,0,0,.6); }
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
  .live-status { display:none; }
  .sim-main { flex-direction:column; }
  .graph-area { height:300px; min-height:300px; }
  .debate-scroll { padding:10px; max-height:60vh; }
  .agent-panel { position:fixed; bottom:0; left:0; right:0; width:100%; border-radius:16px 16px 0 0; padding:20px 16px 32px; z-index:300; }
}
@media (max-width: 480px) {
  .graph-legend { gap:8px; padding:5px 10px; font-size:9px; }
  .legend-dot { width:6px; height:6px; }
}
</style>