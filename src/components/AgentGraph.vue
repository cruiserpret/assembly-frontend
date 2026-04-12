<template>
  <div class="graph-wrap" ref="wrapper">
    <svg ref="svg" class="graph-svg">
      <!-- Glow filter -->
      <defs>
        <filter id="glow-for">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-against">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-neutral">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="node-for" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#7EFFC4"/>
          <stop offset="100%" stop-color="#1AAB6D"/>
        </radialGradient>
        <radialGradient id="node-against" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#FF8FAA"/>
          <stop offset="100%" stop-color="#CC1F45"/>
        </radialGradient>
        <radialGradient id="node-neutral" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#A0B0CC"/>
          <stop offset="100%" stop-color="#4A5568"/>
        </radialGradient>
      </defs>

      <!-- Edge lines -->
      <g class="edges" ref="edgesGroup"></g>

      <!-- Node circles -->
      <g class="nodes" ref="nodesGroup"></g>
    </svg>

    <!-- Floating empty state -->
    <div v-if="!agents.length" class="graph-empty">
      <div class="graph-empty-icon">◎</div>
      <div class="mono">Waiting for agents...</div>
    </div>

    <!-- Legend -->
    <div class="graph-legend">
      <div class="legend-item">
        <div class="legend-dot" style="background:var(--for);"></div>
        <span class="mono">For</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background:var(--against);"></div>
        <span class="mono">Against</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background:var(--neutral);"></div>
        <span class="mono">Neutral</span>
      </div>
      <div class="legend-sep"></div>
      <div class="legend-item">
        <div class="legend-line shifted"></div>
        <span class="mono">Shifted</span>
      </div>
      <div class="legend-item">
        <div class="legend-line held"></div>
        <span class="mono">Debating</span>
      </div>
    </div>

    <!-- Agent tooltip -->
    <div
      v-if="hoveredAgent"
      class="agent-tooltip"
      :style="`left:${tooltipX}px; top:${tooltipY}px`"
    >
      <div class="tt-name">{{ hoveredAgent.name }}</div>
      <div class="tt-stance tag" :class="`tag-${hoveredAgent.stance}`">{{ hoveredAgent.stance }}</div>
      <div class="tt-opinion">{{ hoveredAgent.opinion?.slice(0, 120) }}{{ hoveredAgent.opinion?.length > 120 ? '...' : '' }}</div>
      <div class="tt-score mono">Score: <span class="accent">{{ (hoveredAgent.score * 100).toFixed(0) }}</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  agents: { type: Array, default: () => [] },
  rounds: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-agent'])

const wrapper    = ref(null)
const svg        = ref(null)
const nodesGroup = ref(null)
const edgesGroup = ref(null)

const hoveredAgent = ref(null)
const tooltipX     = ref(0)
const tooltipY     = ref(0)

let simulation = null
let resizeObs  = null

const stanceColor = {
  for:     '#3EE8A0',
  against: '#FF4D6D',
  neutral: '#7A8BA6',
}

const stanceFill = {
  for:     'url(#node-for)',
  against: 'url(#node-against)',
  neutral: 'url(#node-neutral)',
}

function buildGraph() {
  if (!svg.value || !props.agents.length) return

  const W = wrapper.value.clientWidth
  const H = wrapper.value.clientHeight

  const svgEl = d3.select(svg.value)
    .attr('width', W)
    .attr('height', H)

  // Build edges from rounds: connect agents who are in the same round
  const links = []
  props.rounds.forEach(round => {
    const agents = round.agents || []
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        // Only connect some pairs to avoid clutter — connect if different stances
        if (agents[i].stance !== agents[j].stance) {
          const existingLink = links.find(
            l => (l.source === agents[i].id && l.target === agents[j].id) ||
                 (l.source === agents[j].id && l.target === agents[i].id)
          )
          if (!existingLink) {
            links.push({
              source: agents[i].id,
              target: agents[j].id,
              shifted: agents[i].opinion_delta !== 0 || agents[j].opinion_delta !== 0,
              round: round.round,
            })
          }
        }
      }
    }
  })

  // Use latest round agents as nodes
  const latestAgents = props.agents.map(a => ({
    ...a,
    r: 10 + (a.score || 0.5) * 12,  // node radius based on score
  }))

  const nodes = latestAgents
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // Filter links to only valid node pairs
  const validLinks = links
    .filter(l => nodeMap.has(l.source) && nodeMap.has(l.target))
    .slice(0, 60) // cap for performance

  // Clear previous
  d3.select(nodesGroup.value).selectAll('*').remove()
  d3.select(edgesGroup.value).selectAll('*').remove()

  // Stop old sim
  if (simulation) simulation.stop()

  // Force simulation
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(validLinks).id(d => d.id).distance(80).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collide', d3.forceCollide(d => d.r + 8))
    .force('x', d3.forceX(W / 2).strength(0.04))
    .force('y', d3.forceY(H / 2).strength(0.04))

  // Draw edges
  const edgeSel = d3.select(edgesGroup.value)
    .selectAll('line')
    .data(validLinks)
    .join('line')
    .attr('stroke', d => d.shifted ? 'rgba(62,232,160,0.25)' : 'rgba(255,255,255,0.06)')
    .attr('stroke-width', d => d.shifted ? 1.5 : 1)
    .attr('stroke-dasharray', d => d.shifted ? null : '4,4')

  // Draw node groups
  const nodeSel = d3.select(nodesGroup.value)
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragStart)
      .on('drag',  dragging)
      .on('end',   dragEnd)
    )
    .on('mouseenter', (event, d) => {
      hoveredAgent.value = d
      const rect = wrapper.value.getBoundingClientRect()
      tooltipX.value = event.clientX - rect.left + 14
      tooltipY.value = event.clientY - rect.top - 10
    })
    .on('mouseleave', () => { hoveredAgent.value = null })
    .on('click', (event, d) => { emit('select-agent', d) })

  // Outer glow ring
  nodeSel.append('circle')
    .attr('r', d => d.r + 6)
    .attr('fill', 'none')
    .attr('stroke', d => stanceColor[d.stance] || '#7A8BA6')
    .attr('stroke-width', 1)
    .attr('opacity', 0.2)

  // Main circle
  nodeSel.append('circle')
    .attr('r', d => d.r)
    .attr('fill', d => stanceFill[d.stance] || stanceFill.neutral)
    .attr('filter', d => `url(#glow-${d.stance})`)
    .attr('stroke', d => stanceColor[d.stance] || '#7A8BA6')
    .attr('stroke-width', 1.5)

  // Delta indicator ring (if shifted)
  nodeSel.filter(d => Math.abs(d.opinion_delta) > 0.05)
    .append('circle')
    .attr('r', d => d.r + 3)
    .attr('fill', 'none')
    .attr('stroke', d => d.opinion_delta > 0 ? 'rgba(200,255,87,0.6)' : 'rgba(255,77,109,0.6)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '3,3')

  // Initial letter
  nodeSel.append('text')
    .text(d => d.name?.charAt(0) || '?')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-family', 'Bebas Neue, sans-serif')
    .attr('font-size', d => d.r * 0.9)
    .attr('fill', 'rgba(255,255,255,0.9)')
    .attr('pointer-events', 'none')

  // Name label below
  nodeSel.append('text')
    .text(d => d.name?.split(' ')[0] || '')
    .attr('text-anchor', 'middle')
    .attr('dy', d => d.r + 14)
    .attr('font-family', 'JetBrains Mono, monospace')
    .attr('font-size', 9)
    .attr('fill', 'rgba(255,255,255,0.45)')
    .attr('pointer-events', 'none')

  // Tick
  simulation.on('tick', () => {
    edgeSel
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`)
  })
}

function dragStart(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x; d.fy = d.y
}
function dragging(event, d) {
  d.fx = event.x; d.fy = event.y
}
function dragEnd(event, d) {
  if (!event.active) simulation.alphaTarget(0)
  d.fx = null; d.fy = null
}

watch(() => [props.agents, props.rounds], () => {
  nextTick(buildGraph)
}, { deep: true })

onMounted(() => {
  nextTick(buildGraph)
  resizeObs = new ResizeObserver(() => buildGraph())
  if (wrapper.value) resizeObs.observe(wrapper.value)
})

onUnmounted(() => {
  if (simulation) simulation.stop()
  if (resizeObs) resizeObs.disconnect()
})
</script>

<style scoped>
.graph-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.graph-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.graph-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-dim);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}
.graph-empty-icon {
  font-size: 40px;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
}

.graph-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(6,8,15,0.8);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 14px;
  backdrop-filter: blur(8px);
}
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--text-muted); }
.legend-dot  { width: 8px; height: 8px; border-radius: 50%; }
.legend-sep  { width: 1px; height: 16px; background: var(--border); }
.legend-line { width: 18px; height: 1.5px; }
.legend-line.shifted { background: rgba(62,232,160,0.5); }
.legend-line.held    { background: rgba(255,255,255,0.15); }

.agent-tooltip {
  position: absolute;
  pointer-events: none;
  background: var(--surface-2);
  border: 1px solid var(--border-hi);
  border-radius: 8px;
  padding: 12px 14px;
  width: 220px;
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.tt-name { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
.tt-stance { margin-bottom: 8px; }
.tt-opinion { font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px; }
.tt-score { font-size: 10px; color: var(--text-muted); }
</style>
