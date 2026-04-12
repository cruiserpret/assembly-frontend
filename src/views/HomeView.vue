<template>
  <div class="home">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-eyebrow fade-up mono">
        <span class="live-dot"></span>
        Multi-agent debate simulation engine
      </div>

      <h1 class="hero-title fade-up fade-up-1">
        Rehearse<br/>
        <span class="accent">Reality.</span>
      </h1>

      <p class="hero-sub fade-up fade-up-2">
        Feed it a topic. Assembly spawns AI agents grounded in real-world data —<br/>
        they argue, shift opinions, and reveal where public consensus is headed.
      </p>

      <!-- Stats row -->
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

    <!-- Launch Form -->
    <section class="launch-section fade-up fade-up-4">
      <div class="launch-card">

        <div class="launch-header">
          <span class="mono" style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted)">
            New Simulation
          </span>
        </div>

        <div class="divider" style="margin:16px 0;"></div>

        <!-- Topic -->
        <div class="form-group">
          <label class="form-label mono">Topic</label>
          <textarea
            v-model="form.topic"
            class="textarea"
            placeholder="Should AI be regulated by governments?"
            rows="3"
            :disabled="loading"
          ></textarea>
        </div>

        <!-- Agent count & rounds -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label mono">
              Agents
              <span class="accent mono">{{ form.num_agents }}</span>
            </label>
            <input
              v-model.number="form.num_agents"
              type="range" min="5" max="50" step="5"
              class="range"
              :disabled="loading"
            />
            <div class="range-labels mono">
              <span>5</span><span>50</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label mono">
              Rounds
              <span class="accent mono">{{ form.num_rounds }}</span>
            </label>
            <input
              v-model.number="form.num_rounds"
              type="range" min="1" max="10" step="1"
              class="range"
              :disabled="loading"
            />
            <div class="range-labels mono">
              <span>1</span><span>10</span>
            </div>
          </div>
        </div>

        <!-- Error -->
        <p v-if="error" class="error-msg mono">
          ⚠ {{ error }}
        </p>

        <!-- Submit -->
        <button
          class="btn btn-primary launch-btn"
          :disabled="!form.topic.trim() || loading"
          @click="launch"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>▶</span>
          {{ loading ? 'Spawning agents...' : 'Launch Simulation' }}
        </button>

        <p class="launch-hint mono">
          Assembly will ingest real-world data, generate agents, and run a structured debate.
        </p>
      </div>

      <!-- Feature pills -->
      <div class="feature-pills">
        <div class="pill" v-for="f in features" :key="f.label">
          <span class="pill-dot" :style="`background:${f.color}`"></span>
          <span>{{ f.label }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { assembly } from '../api/assembly.js'

const router = useRouter()

const form = ref({ topic: '', num_agents: 20, num_rounds: 3 })
const loading = ref(false)
const error = ref('')

const features = [
  { label: 'Structured debate engine',    color: 'var(--accent)' },
  { label: 'Evolving agent personas',     color: 'var(--for)' },
  { label: 'God\'s Eye View report',      color: '#A78BFA' },
  { label: 'Live event injection',        color: 'var(--against)' },
  { label: 'Sentiment trajectory',        color: '#60A5FA' },
  { label: 'Simulation branching',        color: '#FBBF24' },
]

async function launch() {
  if (!form.value.topic.trim()) return
  loading.value = true
  error.value = ''
  try {
    const res = await assembly.startSimulation(form.value)
    router.push(`/simulation/${res.simulation_id}`)
  } catch (e) {
    error.value = e.message || 'Failed to start simulation'
    loading.value = false
  }
}
</script>

<style scoped>
.stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:100%; }
.hero-stat-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px 16px; text-align:left; transition:border-color var(--transition); }
.hero-stat-card:hover { border-color:rgba(200,255,87,0.2); }
.hsc-icon  { font-size:18px; color:var(--accent); margin-bottom:10px; display:block; }
.hsc-title { font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin-bottom:8px; font-family:var(--mono); }
.hsc-desc  { font-size:12px; color:var(--text-muted); line-height:1.6; }
@media (max-width:640px) { .stats-row { grid-template-columns:1fr; } }

.home {
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px 60px;
}

/* Hero */
.hero {
  text-align: center;
  max-width: 680px;
  margin-bottom: 64px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.hero-title {
  font-family: var(--display);
  font-size: clamp(72px, 10vw, 120px);
  line-height: 0.9;
  letter-spacing: -0.01em;
  color: var(--text);
  margin-bottom: 28px;
}

.hero-sub {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.7;
  font-weight: 300;
  margin-bottom: 40px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.stat { text-align: center; }
.stat-val { font-size: 36px; display: block; color: var(--text); }
.stat-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
.stat-sep { width: 1px; height: 40px; background: var(--border); }

/* Launch card */
.launch-section {
  width: 100%;
  max-width: 620px;
}

.launch-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  margin-bottom: 20px;
}

.launch-header { }

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Range slider */
.range {
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  background: var(--surface-2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  margin-bottom: 6px;
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(200,255,87,0.5);
  transition: transform var(--transition);
}
.range::-webkit-slider-thumb:hover { transform: scale(1.2); }

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-dim);
}

.error-msg {
  font-size: 12px;
  color: var(--against);
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(255,77,109,0.08);
  border: 1px solid rgba(255,77,109,0.2);
  border-radius: var(--radius);
}

.launch-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 12px;
  margin-bottom: 12px;
}
.launch-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.launch-hint {
  text-align: center;
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.03em;
}

/* Feature pills */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  padding: 5px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 100px;
}
.pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
</style>