<template>
  <div class="report-page">

    <div v-if="loading" class="loading-screen">
      <span class="spinner" style="width:28px;height:28px;border-width:3px;"></span>
      <span class="mono muted">Generating God's Eye View...</span>
    </div>

    <div v-else-if="error" class="error-screen mono">
      ⚠ {{ error }}
      <router-link :to="`/simulation/${id}`" class="btn btn-ghost" style="margin-top:16px;">← Back to Simulation</router-link>
    </div>

    <div v-else-if="report" class="report-wrap">

      <!-- Masthead -->
      <header class="masthead fade-up">
        <div class="masthead-eyebrow mono">
          <span class="live-dot" style="background:var(--accent);"></span>
          God's Eye View Report
        </div>
        <h1 class="masthead-title">{{ report.topic }}</h1>
        <div class="masthead-meta mono">
          Simulation #{{ id.slice(0,12) }} &nbsp;·&nbsp;
          {{ report.agents_shifted + report.agents_held }} agents &nbsp;·&nbsp;
          {{ new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) }}
        </div>
      </header>

      <div class="report-body">

        <!-- LEFT: main content -->
        <div class="report-main">

          <!-- Executive Summary -->
          <section class="report-section fade-up fade-up-1">
            <div class="section-label mono">Executive Summary</div>
            <p class="summary-text">{{ report.summary }}</p>
          </section>

          <!-- Predicted Trajectory — moved here -->
          <section class="report-section fade-up fade-up-2">
            <div class="section-label mono">Predicted Trajectory</div>
            <div class="trajectory-block">
              <div class="trajectory-arrow">⟶</div>
              <p class="trajectory-text">{{ report.predicted_trajectory }}</p>
            </div>
          </section>

          <!-- Final Consensus (replaces Decisive Arguments) -->
          <section class="report-section fade-up fade-up-3">
            <div class="section-label mono">Final Consensus</div>
            <div class="consensus-block">
              <div class="consensus-bars">
                <div class="consensus-bar-row">
                  <span class="mono" style="color:var(--for);font-size:10px;width:60px;">FOR</span>
                  <div class="cbar-track">
                    <div class="cbar-fill" :style="`width:${(report.agents_shifted/(report.agents_shifted+report.agents_held))*100}%;background:var(--for)`"></div>
                  </div>
                  <span class="mono muted" style="font-size:10px;">{{ report.agents_shifted }}</span>
                </div>
                <div class="consensus-bar-row">
                  <span class="mono" style="color:var(--against);font-size:10px;width:60px;">HELD</span>
                  <div class="cbar-track">
                    <div class="cbar-fill" :style="`width:${(report.agents_held/(report.agents_shifted+report.agents_held))*100}%;background:var(--against)`"></div>
                  </div>
                  <span class="mono muted" style="font-size:10px;">{{ report.agents_held }}</span>
                </div>
              </div>
              <div class="consensus-summary">
                <div class="consensus-pct display accent">
                  {{ Math.round((report.agents_shifted/(report.agents_shifted+report.agents_held))*100) }}%
                </div>
                <div class="mono muted" style="font-size:11px;">opinion shift rate across all agents</div>
                <p class="consensus-desc">
                  {{ report.agents_shifted }} out of {{ report.agents_shifted + report.agents_held }} agents
                  revised their position during the simulation. The debate produced
                  {{ report.agents_shifted >= report.agents_held ? 'strong' : 'partial' }} consensus movement
                  toward a shared position.
                </p>
              </div>
            </div>
          </section>

          <!-- Agent Journey — collapsible -->
          <section class="report-section fade-up fade-up-4">
            <div class="section-label mono collapsible" @click="journeyOpen = !journeyOpen">
              Agent Journey
              <span class="collapse-arrow" :class="{ open: journeyOpen }">▸</span>
            </div>

            <div v-if="journeyOpen" class="agent-summaries">
              <div
                v-for="agent in report.agent_summaries"
                :key="agent.agent_id"
                class="agent-summary-row"
                :class="agent.shifted ? 'shifted' : 'held'"
              >
                <div class="as-left">
                  <div class="as-avatar" :class="`avatar-${agent.final_stance}`">
                    {{ agent.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="as-name">{{ agent.name }}</div>
                    <div class="tag" :class="`tag-${agent.final_stance}`" style="margin-top:4px;">
                      {{ agent.final_stance }}
                    </div>
                  </div>
                </div>
                <div class="as-center">
                  <p class="as-moment">{{ agent.key_moment }}</p>
                </div>
                <div class="as-right">
                  <div class="shift-badge" :class="agent.shifted ? 'shifted-badge' : 'held-badge'">
                    {{ agent.shifted ? '↻ Shifted' : '— Held' }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="journey-collapsed mono">
              {{ report.agent_summaries?.length }} agents · click to expand
            </div>
          </section>

        </div>

        <!-- RIGHT: sidebar -->
        <aside class="report-sidebar">

          <!-- Outcome Stats -->
          <div class="card stats-card fade-up">
            <div class="section-label mono" style="margin-bottom:16px;">Outcome Stats</div>
            <div class="big-stat">
              <span class="big-val display accent">{{ report.agents_shifted }}</span>
              <span class="big-label mono">Agents Shifted</span>
            </div>
            <div class="divider"></div>
            <div class="big-stat">
              <span class="big-val display" style="color:var(--text-muted)">{{ report.agents_held }}</span>
              <span class="big-label mono">Agents Held</span>
            </div>
            <div class="divider"></div>
            <div class="shift-visual">
              <div class="shift-bar">
                <div class="shift-fill"
                  :style="`width:${(report.agents_shifted/(report.agents_shifted+report.agents_held))*100}%`">
                </div>
              </div>
              <div class="mono muted" style="font-size:10px; margin-top:6px;">
                {{ Math.round((report.agents_shifted/(report.agents_shifted+report.agents_held))*100) }}% opinion shift rate
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card fade-up fade-up-1" style="padding:18px;">
            <div class="section-label mono" style="margin-bottom:12px;">Actions</div>
            <router-link :to="`/simulation/${id}`" class="btn btn-ghost" style="width:100%; justify-content:center; margin-bottom:8px;">
              ← View Debate
            </router-link>
            <router-link to="/" class="btn btn-primary" style="width:100%; justify-content:center;">
              + New Simulation
            </router-link>
          </div>

        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { assembly } from '../api/assembly.js'

const props = defineProps({ id: String })

const report      = ref(null)
const loading     = ref(true)
const error       = ref('')
const journeyOpen = ref(false)

onMounted(async () => {
  try {
    report.value = await assembly.getReport(props.id)
  } catch (e) {
    error.value = e.message || 'Report not available yet. Simulation may still be running.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.report-page {
  min-height: calc(100vh - 56px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.loading-screen, .error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 50vh;
  font-size: 13px;
  color: var(--text-muted);
}

/* Masthead */
.masthead { margin-bottom: 48px; border-bottom: 1px solid var(--border); padding-bottom: 32px; }
.masthead-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
}
.masthead-title {
  font-family: var(--display);
  font-size: clamp(32px, 5vw, 60px);
  line-height: 1.0;
  color: var(--text);
  margin-bottom: 16px;
}
.masthead-meta { font-size: 11px; color: var(--text-dim); letter-spacing: 0.05em; }

/* Layout */
.report-body {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 32px;
  align-items: start;
}
.report-section { margin-bottom: 40px; }

.section-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  font-family: var(--mono);
}

.section-label.collapsible {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: color var(--transition);
}
.section-label.collapsible:hover { color: var(--text); }

.collapse-arrow {
  font-size: 12px;
  transition: transform 0.25s ease;
  display: inline-block;
}
.collapse-arrow.open { transform: rotate(90deg); }

/* Summary */
.summary-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text);
  font-weight: 300;
}

/* Trajectory */
.trajectory-block {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 20px;
}
.trajectory-arrow { font-size: 24px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.trajectory-text { font-size: 15px; color: var(--text-muted); line-height: 1.7; font-weight: 300; }

/* Final Consensus */
.consensus-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.consensus-bars { display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.consensus-bar-row { display: flex; align-items: center; gap: 10px; }
.cbar-track { flex: 1; height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
.cbar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
.consensus-summary { display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--border); padding-left: 24px; }
.consensus-pct { font-size: 56px; line-height: 1; }
.consensus-desc { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-top: 4px; }

/* Agent Journey */
.agent-summaries { display: flex; flex-direction: column; gap: 8px; }
.agent-summary-row {
  display: grid;
  grid-template-columns: 160px 1fr auto;
  align-items: center;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 18px;
  transition: border-color var(--transition);
}
.agent-summary-row:hover { border-color: var(--border-hi); }
.agent-summary-row.shifted { border-left: 2px solid rgba(62,232,160,0.4); }
.agent-summary-row.held    { border-left: 2px solid var(--border); }

.as-left { display: flex; align-items: center; gap: 10px; }
.as-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}
.avatar-for     { background: rgba(62,232,160,0.15); color: var(--for); }
.avatar-against { background: rgba(255,77,109,0.15);  color: var(--against); }
.avatar-neutral { background: rgba(122,139,166,0.15); color: var(--neutral); }
.as-name { font-size: 13px; font-weight: 500; }
.as-moment { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

.shift-badge {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 100px;
  white-space: nowrap;
}
.shifted-badge { background: rgba(62,232,160,0.12); color: var(--for); border: 1px solid rgba(62,232,160,0.25); }
.held-badge    { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }

.journey-collapsed {
  font-size: 11px;
  color: var(--text-dim);
  padding: 12px 0;
  letter-spacing: 0.04em;
}

/* Sidebar */
.report-sidebar { display: flex; flex-direction: column; gap: 16px; }
.stats-card { padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.big-stat { margin-bottom: 8px; }
.big-val { font-size: 52px; display: block; line-height: 1; }
.big-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); font-family: var(--mono); }
.shift-visual { margin-top: 8px; }
.shift-bar { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
.shift-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), rgba(200,255,87,0.5));
  border-radius: 3px;
  transition: width 1s ease;
}

/* Responsive */
@media (max-width: 900px) {
  .report-body { grid-template-columns: 1fr; }
  .report-sidebar { order: -1; }
}
@media (max-width: 640px) {
  .report-page { padding: 24px 16px 60px; }
  .masthead-title { font-size: 28px; }
  .consensus-block { grid-template-columns: 1fr; }
  .consensus-summary { border-left: none; padding-left: 0; border-top: 1px solid var(--border); padding-top: 16px; }
  .agent-summary-row { grid-template-columns: 1fr; }
}
</style>