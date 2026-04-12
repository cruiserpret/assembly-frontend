<template>
  <div class="home">

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-eyebrow fade-up mono">
        <span class="live-dot"></span>
        Predictive public opinion engine
      </div>

      <div class="hero-logo-wrap fade-up fade-up-1">
        <div class="hero-logo-bg">
          <div class="logo-grid-lines"></div>
        </div>
        <div class="hero-logo-inner">
          <div class="hero-bracket">[</div>
          <div class="display hero-wordmark">ASSEMBLY</div>
          <div class="hero-bracket">]</div>
        </div>
        <h1 class="hero-h1">
          Model where public opinion<br/>lands — before it does.
        </h1>
        <div class="hero-tagline display">REHEARSE REALITY.</div>
      </div>

      <p class="hero-sub fade-up fade-up-2">
        Spawn hundreds of AI agents grounded in real-world data. Watch them argue,
        shift, and converge — producing a God's Eye View of where consensus is actually headed.
      </p>

      <div class="stats-row fade-up fade-up-3">
        <div class="hero-stat-card">
          <div class="hsc-icon">◎</div>
          <div class="hsc-title mono">Simulate</div>
          <div class="hsc-desc">Real agents with distinct personas debate your topic across structured rounds</div>
        </div>
        <div class="hero-stat-card">
          <div class="hsc-icon">⟳</div>
          <div class="hsc-title mono">Evolve</div>
          <div class="hsc-desc">Agents shift opinions, challenge each other, and form emergent consensus</div>
        </div>
        <div class="hero-stat-card">
          <div class="hsc-icon">◈</div>
          <div class="hsc-title mono">Predict</div>
          <div class="hsc-desc">God's Eye View reveals who shifted, what argued mattered, and where opinion heads</div>
        </div>
      </div>
    </section>

    <!-- ── LIVE DEMO PREVIEW ── -->
    <section class="demo-section fade-up">
      <div class="demo-label mono">
        <span class="live-dot"></span>
        Live simulation preview
      </div>

      <div class="demo-window">
        <div class="demo-topbar">
          <span class="demo-topic mono">Should TikTok be banned in the USA?</span>
          <span class="tag tag-for" style="font-size:9px;">
            <span class="live-dot"></span> LIVE
          </span>
        </div>

        <div class="demo-body">
          <div class="demo-graph">
            <svg :width="graphW" :height="graphH" class="demo-svg">
              <line v-for="e in demoEdges" :key="e.id"
                :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
                :stroke="e.shifted ? 'rgba(62,232,160,0.4)' : 'rgba(255,255,255,0.08)'"
                :stroke-dasharray="e.shifted ? null : '3,4'"
                stroke-width="1"
              />
              <g v-for="node in demoNodes" :key="node.id"
                :transform="`translate(${node.x},${node.y})`">
                <circle :r="node.r + 5" fill="none"
                  :stroke="stanceColors[node.stance]" stroke-width="1" opacity="0.2"/>
                <circle :r="node.r"
                  :fill="stanceFills[node.stance]"
                  :stroke="stanceColors[node.stance]"
                  stroke-width="1.5"
                  style="transition: fill 1.5s ease, stroke 1.5s ease;"
                />
                <text text-anchor="middle" dominant-baseline="central"
                  font-family="Bebas Neue, sans-serif"
                  :font-size="node.r * 0.9"
                  fill="rgba(255,255,255,0.9)"
                  style="pointer-events:none">{{ node.label }}</text>
                <text text-anchor="middle" :dy="node.r + 12"
                  font-family="JetBrains Mono, monospace"
                  font-size="8"
                  fill="rgba(255,255,255,0.35)"
                  style="pointer-events:none">{{ node.name }}</text>
              </g>
            </svg>
            <div class="demo-graph-label mono">
              {{ demoNodes.filter(n=>n.stance==='for').length }} for ·
              {{ demoNodes.filter(n=>n.stance==='against').length }} against ·
              {{ demoNodes.filter(n=>n.stance==='neutral').length }} neutral
            </div>
          </div>

          <div class="demo-feed" ref="demoFeedEl">
            <div class="demo-round-label display">ROUND {{ demoRound }}</div>
            <transition-group name="stmt-fade" tag="div" style="display:flex;flex-direction:column;gap:8px;">
              <div v-for="stmt in visibleStatements" :key="stmt.id"
                class="demo-stmt" :class="`stmt-${stmt.stance}`">
                <div class="demo-stmt-who">
                  <div class="sm-avatar" :class="`avatar-${stmt.stance}`">{{ stmt.name.charAt(0) }}</div>
                  <span class="mono" style="font-size:10px;">{{ stmt.name }}</span>
                  <span class="tag" :class="`tag-${stmt.stance}`" style="font-size:8px;padding:1px 5px;">{{ stmt.stance }}</span>
                  <span v-if="stmt.shifted" class="mono delta-positive" style="font-size:9px;margin-left:auto;">▲ shifted</span>
                </div>
                <p class="demo-stmt-text">{{ stmt.text }}</p>
              </div>
            </transition-group>
          </div>

          <div class="demo-report">
            <div class="mono" style="font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">God's Eye View</div>
            <div class="demo-report-stat">
              <span class="demo-big-num display accent">{{ demoShifted }}</span>
              <span class="mono muted" style="font-size:9px;">agents shifted</span>
            </div>
            <div class="demo-shift-bar">
              <div class="demo-shift-fill" :style="`width:${demoShiftPct}%`"></div>
            </div>
            <p class="demo-trajectory">{{ demoTrajectory }}</p>
            <div class="demo-args">
              <div class="mono muted" style="font-size:9px;margin-bottom:6px;">Decisive argument</div>
              <div class="demo-arg-text">{{ demoArg }}</div>
            </div>
          </div>
        </div>
      </div>
      <p class="demo-cta mono">↑ This is what Assembly produces for every topic you run</p>
    </section>

    <!-- ── LAUNCH FORM ── -->
    <section class="launch-section fade-up fade-up-4">
      <div class="launch-card">
        <div class="launch-header">
          <span class="mono" style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted)">
            New Simulation
          </span>
        </div>
        <div class="divider" style="margin:16px 0;"></div>

        <div class="form-group">
          <label class="form-label mono">Topic</label>
          <textarea v-model="form.topic" class="textarea"
            placeholder="Should AI be regulated by governments?" rows="3" :disabled="loading"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label mono">Agents <span class="accent mono">{{ form.num_agents }}</span></label>
            <input v-model.number="form.num_agents" type="range" min="5" max="50" step="5" class="range" :disabled="loading"/>
            <div class="range-labels mono"><span>5</span><span>50</span></div>
          </div>
          <div class="form-group">
            <label class="form-label mono">Rounds <span class="accent mono">{{ form.num_rounds }}</span></label>
            <input v-model.number="form.num_rounds" type="range" min="1" max="10" step="1" class="range" :disabled="loading"/>
            <div class="range-labels mono"><span>1</span><span>10</span></div>
          </div>
        </div>

        <p v-if="error" class="error-msg mono">⚠ {{ error }}</p>

        <button class="btn btn-primary launch-btn" :disabled="!form.topic.trim() || loading" @click="launch">
          <span v-if="loading" class="spinner"></span>
          <span v-else>▶</span>
          {{ loading ? 'Launching...' : 'Launch Simulation' }}
        </button>

        <p class="launch-hint mono">Assembly will ingest real-world data, generate agents, and run a structured debate.</p>
      </div>
    </section>

    <!-- ── GOD'S EYE VIEW PREVIEW ── -->
    <section class="gev-section fade-up">
      <div class="gev-header">
        <div class="gev-eyebrow mono">
          <span style="color:var(--accent);">◈</span>
          The deliverable
        </div>
        <h2 class="gev-title display">GOD'S EYE VIEW</h2>
        <p class="gev-desc">
          After every simulation, Assembly produces a synthesis report —
          who shifted, what argument was decisive, and where public opinion is actually headed.
          This is what you're buying.
        </p>
      </div>

      <div class="gev-window">
        <div class="gev-content">
          <div class="gev-topic mono">Topic: "Should TikTok be banned in the USA?"</div>

          <div class="gev-summary-block">
            <div class="gev-block-label mono">Executive Summary</div>
            <p class="gev-summary-text">
              The simulation revealed strong convergence toward a conditional ban over 3 rounds.
              National security arguments proved decisive — 4 of 6 agents revised their position
              after Elena Vasquez's intelligence-sharing evidence. The holdouts cited free speech
              concerns but acknowledged they were in the minority.
            </p>
          </div>

          <div class="gev-trajectory-block">
            <div class="gev-block-label mono">Predicted Trajectory</div>
            <div class="gev-trajectory">
              <span class="gev-arrow">⟶</span>
              <span>Public opinion converges toward a targeted device ban within 12 months,
              with bipartisan support emerging around national security framing rather than
              censorship concerns.</span>
            </div>
          </div>

          <div class="gev-decisive">
            <div class="gev-block-label mono">Decisive Argument</div>
            <div class="gev-arg-card">
              <div class="gev-arg-who">
                <div class="sm-avatar avatar-for">E</div>
                <span class="mono" style="font-size:11px;">Elena Vasquez</span>
                <span class="tag tag-for" style="font-size:9px;padding:2px 6px;">for</span>
                <span class="mono muted" style="font-size:10px;margin-left:auto;">Influenced 4 agents</span>
              </div>
              <p class="gev-arg-text">
                "15 countries have already restricted TikTok based on classified intelligence
                briefings the public hasn't seen. The US is late to act, not early."
              </p>
            </div>
          </div>
        </div>

        <div class="gev-stats">
          <div class="gev-stat-header mono">Outcome Stats</div>
          <div class="gev-big-stat">
            <span class="gev-big-num display accent">4</span>
            <span class="mono muted" style="font-size:10px;">agents shifted</span>
          </div>
          <div class="gev-shift-bar-wrap">
            <div class="gev-shift-bar">
              <div class="gev-shift-fill" style="width:67%"></div>
            </div>
            <span class="mono muted" style="font-size:10px;margin-top:4px;">67% shift rate</span>
          </div>
          <div class="divider"></div>
          <div class="gev-agents">
            <div class="gev-block-label mono">Agent Journey</div>
            <div class="gev-agent-row" v-for="a in gevAgents" :key="a.name">
              <div class="sm-avatar" :class="`avatar-${a.stance}`">{{ a.name.charAt(0) }}</div>
              <span class="gev-agent-name">{{ a.name }}</span>
              <span class="gev-badge" :class="a.shifted ? 'shifted-badge' : 'held-badge'">
                {{ a.shifted ? '↻' : '—' }}
              </span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="gev-cta-note mono">Every simulation produces this report automatically.</div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { assembly } from '../api/assembly.js'

const router  = useRouter()
const form    = ref({ topic: '', num_agents: 20, num_rounds: 3 })
const loading = ref(false)
const error   = ref('')

const gevAgents = [
  { name:'Sarah',  stance:'for',     shifted:false },
  { name:'Marcus', stance:'neutral', shifted:true  },
  { name:'Elena',  stance:'for',     shifted:false },
  { name:'James',  stance:'for',     shifted:true  },
  { name:'Priya',  stance:'for',     shifted:true  },
  { name:'Tom',    stance:'for',     shifted:true  },
]

async function launch() {
  if (!form.value.topic.trim() || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await assembly.startSimulation(form.value)
    router.push(`/simulation/${res.simulation_id}?agents=${form.value.num_agents}`)
  } catch (e) {
    error.value = e.message || 'Failed to start simulation'
    loading.value = false
  }
}

// ── Demo animation ──────────────────────────────────────
const graphW = 260
const graphH = 200
const stanceColors = { for:'#3EE8A0', against:'#FF4D6D', neutral:'#7A8BA6' }
const stanceFills  = { for:'rgba(62,232,160,0.3)', against:'rgba(255,77,109,0.3)', neutral:'rgba(122,139,166,0.2)' }

const demoRound         = ref(1)
const demoShifted       = ref(0)
const demoShiftPct      = ref(0)
const demoFeedEl        = ref(null)
const visibleStatements = ref([])
const demoTrajectory    = ref('Public opinion trending toward conditional ban with data protection requirements.')
const demoArg           = ref('"15 countries have already restricted TikTok. The US is late to act on documented intelligence threats."')

const baseNodes = [
  { id:'a', label:'S', name:'Sarah',  x:60,  y:60,  r:14, stance:'for'     },
  { id:'b', label:'M', name:'Marcus', x:130, y:45,  r:12, stance:'against' },
  { id:'c', label:'E', name:'Elena',  x:200, y:70,  r:16, stance:'for'     },
  { id:'d', label:'J', name:'James',  x:80,  y:140, r:11, stance:'neutral' },
  { id:'e', label:'P', name:'Priya',  x:170, y:150, r:13, stance:'against' },
  { id:'f', label:'T', name:'Tom',    x:230, y:130, r:10, stance:'neutral' },
]
const demoNodes = ref(baseNodes.map(n => ({ ...n })))
const demoEdges = [
  { id:'e1', x1:60,  y1:60,  x2:130, y2:45,  shifted:false },
  { id:'e2', x1:130, y1:45,  x2:200, y2:70,  shifted:false },
  { id:'e3', x1:60,  y1:60,  x2:80,  y2:140, shifted:false },
  { id:'e4', x1:200, y1:70,  x2:170, y2:150, shifted:true  },
  { id:'e5', x1:80,  y1:140, x2:170, y2:150, shifted:false },
  { id:'e6', x1:170, y1:150, x2:230, y2:130, shifted:true  },
]
const allStatements = [
  { id:1, name:'Sarah',  stance:'for',    shifted:false, text:"TikTok's data collection practices present a clear national security risk that cannot be ignored." },
  { id:2, name:'Marcus', stance:'against', shifted:false, text:"A ban sets a dangerous precedent for government censorship of private platforms." },
  { id:3, name:'Elena',  stance:'for',    shifted:false, text:"15 countries have already restricted TikTok. The US is late to act on documented threats." },
  { id:4, name:'James',  stance:'neutral', shifted:false, text:"I understand both sides. Perhaps mandatory data localization is a middle ground." },
  { id:5, name:'Priya',  stance:'neutral', shifted:true,  text:"Elena's evidence is compelling. I'm revising toward conditional support for a ban." },
  { id:6, name:'Tom',    stance:'for',    shifted:true,  text:"After this debate, a targeted ban on government devices is the minimum necessary response." },
]

let demoTimer = null

function runDemoLoop() {
  let i = 0
  visibleStatements.value = []
  demoRound.value = 1
  demoShifted.value = 0
  demoShiftPct.value = 0
  demoNodes.value = baseNodes.map(n => ({ ...n }))

  demoTimer = setInterval(() => {
    if (i < allStatements.length) {
      visibleStatements.value = [...visibleStatements.value, allStatements[i]]
      if (allStatements[i].shifted) {
        const node = demoNodes.value.find(n => n.name === allStatements[i].name)
        if (node) {
          node.stance = 'for'
          demoShifted.value++
          demoShiftPct.value = Math.round((demoShifted.value / 6) * 100)
        }
      }
      if (i === 2) demoRound.value = 2
      if (i === 4) demoRound.value = 3
      i++
    } else {
      setTimeout(() => {
        visibleStatements.value = []
        i = 0
        demoRound.value = 1
        demoShifted.value = 0
        demoShiftPct.value = 0
        demoNodes.value = baseNodes.map(n => ({ ...n }))
      }, 4000)
    }
  }, 2400)
}

onMounted(() => setTimeout(runDemoLoop, 1000))
onUnmounted(() => clearInterval(demoTimer))
</script>

<style scoped>
.home { min-height: calc(100vh - 56px); display: flex; flex-direction: column; align-items: center; padding: 80px 24px 60px; }

/* Hero */
.hero { text-align: center; max-width: 720px; width: 100%; margin-bottom: 64px; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 24px; }
.hero-logo-wrap { position: relative; display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
.hero-logo-bg { position: absolute; inset: -20px -60px; border: 1px solid rgba(200,255,87,0.08); border-radius: 4px; overflow: hidden; pointer-events: none; }
.logo-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(200,255,87,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,87,0.05) 1px, transparent 1px); background-size: 32px 32px; }
.hero-logo-inner { display: flex; align-items: center; gap: 12px; position: relative; }
.hero-bracket { font-family: var(--mono); font-size: clamp(24px, 5vw, 56px); color: var(--accent); opacity: 0.5; line-height: 1; font-weight: 300; }
.hero-wordmark { font-size: clamp(48px, 10vw, 100px); line-height: 0.9; letter-spacing: -0.02em; background: linear-gradient(180deg, #fff 0%, rgba(228,234,245,0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-h1 { font-family: var(--body); font-size: clamp(22px, 3.5vw, 36px); font-weight: 300; line-height: 1.3; color: var(--text); margin-top: 20px; margin-bottom: 0; letter-spacing: -0.01em; }
.hero-tagline { font-family: var(--display); font-size: clamp(12px, 1.8vw, 18px); letter-spacing: 0.25em; color: var(--accent); margin-top: 12px; opacity: 0.6; }
.hero-tagline::after { content: ''; display: block; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); margin-top: 6px; opacity: 0.4; }
.hero-sub { font-size: 15px; color: var(--text-muted); line-height: 1.7; font-weight: 300; margin-bottom: 36px; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
.hero-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 16px; text-align: left; transition: border-color var(--transition); }
.hero-stat-card:hover { border-color: rgba(200,255,87,0.2); }
.hsc-icon  { font-size: 18px; color: var(--accent); margin-bottom: 10px; display: block; }
.hsc-title { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; font-family: var(--mono); }
.hsc-desc  { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

/* Demo */
.demo-section { width: 100%; max-width: 900px; margin-bottom: 48px; }
.demo-label { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px; }
.demo-window { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); }
.demo-topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--bg-2); border-bottom: 1px solid var(--border); }
.demo-topic { font-size: 11px; color: var(--text-muted); }
.demo-body { display: grid; grid-template-columns: 260px 1fr 180px; min-height: 260px; }
.demo-graph { border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; background: var(--bg); }
.demo-svg { display: block; }
.demo-graph-label { font-size: 9px; color: var(--text-dim); letter-spacing: 0.06em; margin-top: 6px; text-align: center; }
.demo-feed { padding: 14px; overflow: hidden; display: flex; flex-direction: column; max-height: 300px; overflow-y: auto; }
.demo-round-label { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; flex-shrink: 0; }
.demo-stmt { background: var(--bg-2); border: 1px solid var(--border); border-radius: 4px; padding: 8px 10px; margin-bottom: 8px; }
.demo-stmt.stmt-for     { border-left: 2px solid rgba(62,232,160,0.4); }
.demo-stmt.stmt-against { border-left: 2px solid rgba(255,77,109,0.4); }
.demo-stmt.stmt-neutral { border-left: 2px solid rgba(122,139,166,0.2); }
.demo-stmt-who { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
.demo-stmt-text { font-size: 11px; color: var(--text-muted); line-height: 1.5; }
.demo-report { border-left: 1px solid var(--border); padding: 14px 12px; display: flex; flex-direction: column; gap: 10px; background: var(--bg-2); }
.demo-report-stat { display: flex; flex-direction: column; gap: 2px; }
.demo-big-num { font-size: 40px; line-height: 1; }
.demo-shift-bar { height: 3px; background: var(--surface-2); border-radius: 2px; overflow: hidden; }
.demo-shift-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 1s ease; }
.demo-trajectory { font-size: 10px; color: var(--text-muted); line-height: 1.5; }
.demo-arg-text { font-size: 10px; color: var(--text-muted); line-height: 1.5; font-style: italic; border-left: 2px solid rgba(200,255,87,0.4); padding-left: 8px; }
.demo-cta { text-align: center; font-size: 10px; color: var(--text-dim); letter-spacing: 0.06em; margin-top: 10px; }
.stmt-fade-enter-active { transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
.stmt-fade-enter-from   { opacity: 0; transform: translateY(10px); }

/* Launch */
.launch-section { width: 100%; max-width: 620px; margin-bottom: 48px; }
.launch-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px 32px; }
.form-group { margin-bottom: 24px; }
.form-label { display: flex; justify-content: space-between; align-items: center; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.range { -webkit-appearance: none; width: 100%; height: 2px; background: var(--surface-2); border-radius: 2px; outline: none; cursor: pointer; margin-bottom: 6px; }
.range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; box-shadow: 0 0 10px rgba(200,255,87,0.5); transition: transform var(--transition); }
.range::-webkit-slider-thumb:hover { transform: scale(1.2); }
.range-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-dim); }
.error-msg { font-size: 12px; color: var(--against); margin-bottom: 16px; padding: 10px 14px; background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2); border-radius: var(--radius); }
.launch-btn { width: 100%; justify-content: center; padding: 14px; font-size: 12px; margin-bottom: 12px; }
.launch-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.launch-hint { text-align: center; font-size: 10px; color: var(--text-dim); letter-spacing: 0.03em; }

/* God's Eye View */
.gev-section { width: 100%; max-width: 900px; margin-bottom: 60px; }
.gev-header { text-align: center; margin-bottom: 24px; }
.gev-eyebrow { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--mono); }
.gev-title { font-size: clamp(36px, 6vw, 64px); color: var(--text); line-height: 1; margin-bottom: 14px; }
.gev-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; max-width: 560px; margin: 0 auto; font-weight: 300; }
.gev-window { display: grid; grid-template-columns: 1fr 220px; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); }
.gev-content { padding: 24px; border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 20px; }
.gev-topic { font-size: 10px; letter-spacing: 0.08em; color: var(--text-dim); padding-bottom: 14px; border-bottom: 1px solid var(--border); font-family: var(--mono); }
.gev-block-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; font-family: var(--mono); }
.gev-summary-text { font-size: 13px; color: var(--text-muted); line-height: 1.7; }
.gev-trajectory { display: flex; gap: 12px; align-items: flex-start; background: var(--bg-2); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius); padding: 14px; font-size: 12px; color: var(--text-muted); line-height: 1.6; }
.gev-arrow { color: var(--accent); font-size: 18px; flex-shrink: 0; }
.gev-arg-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
.gev-arg-who { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.gev-arg-text { font-size: 12px; color: var(--text-muted); line-height: 1.6; font-style: italic; }
.gev-stats { padding: 20px 16px; background: var(--bg-2); display: flex; flex-direction: column; gap: 12px; }
.gev-stat-header { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); font-family: var(--mono); }
.gev-big-stat { display: flex; flex-direction: column; gap: 2px; }
.gev-big-num { font-size: 52px; line-height: 1; }
.gev-shift-bar-wrap { display: flex; flex-direction: column; }
.gev-shift-bar { height: 4px; background: var(--surface-2); border-radius: 2px; overflow: hidden; }
.gev-shift-fill { height: 100%; background: linear-gradient(90deg, var(--accent), rgba(200,255,87,0.5)); border-radius: 2px; }
.gev-agents { display: flex; flex-direction: column; gap: 6px; }
.gev-agent-row { display: flex; align-items: center; gap: 6px; }
.gev-agent-name { flex: 1; font-size: 11px; color: var(--text-muted); }
.gev-badge { font-size: 10px; padding: 2px 6px; border-radius: 100px; font-family: var(--mono); }
.shifted-badge { background: rgba(62,232,160,0.12); color: var(--for); border: 1px solid rgba(62,232,160,0.25); }
.held-badge    { background: var(--surface-2); color: var(--text-dim); border: 1px solid var(--border); }
.gev-cta-note { font-size: 9px; color: var(--text-dim); letter-spacing: 0.04em; line-height: 1.5; font-family: var(--mono); }

/* Avatars */
.sm-avatar { width: 18px; height: 18px; border-radius: 50%; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-for     { background: rgba(62,232,160,0.2);  color: var(--for); }
.avatar-against { background: rgba(255,77,109,0.2);  color: var(--against); }
.avatar-neutral { background: rgba(122,139,166,0.2); color: var(--neutral); }

/* Mobile */
@media (max-width: 768px) {
  .demo-body { grid-template-columns: 1fr; }
  .demo-graph { border-right: none; border-bottom: 1px solid var(--border); }
  .demo-report { border-left: none; border-top: 1px solid var(--border); }
  .gev-window { grid-template-columns: 1fr; }
  .gev-content { border-right: none; border-bottom: 1px solid var(--border); }
}
@media (max-width: 640px) {
  .home { padding: 40px 16px 40px; }
  .hero { margin-bottom: 32px; }
  .hero-logo-bg { inset: -12px -16px; }
  .hero-h1 { font-size: 20px; }
  .hero-sub { font-size: 13px; }
  .stats-row { grid-template-columns: 1fr; gap: 8px; }
  .hero-stat-card { padding: 14px 12px; }
  .launch-card { padding: 20px 16px; }
  .form-row { grid-template-columns: 1fr; gap: 16px; }
}
</style>