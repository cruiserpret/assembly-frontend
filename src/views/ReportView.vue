<template>
  <div class="report-page">

    <!-- Loading -->
    <div v-if="loading" class="loading-screen">
      <span class="spinner" style="width:28px;height:28px;border-width:3px;"></span>
      <span class="mono muted">Generating God's Eye View...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-screen mono">
      ⚠ {{ error }}
      <router-link :to="`/simulation/${id}`" class="btn btn-ghost" style="margin-top:16px;">← Back to Simulation</router-link>
    </div>

    <!-- Report -->
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

        <!-- Left column -->
        <div class="report-main">

          <!-- Summary -->
          <section class="report-section fade-up fade-up-1">
            <div class="section-label mono">Executive Summary</div>
            <p class="summary-text">{{ report.summary }}</p>
          </section>

          <!-- Decisive Arguments -->
          <section class="report-section fade-up fade-up-2">
            <div class="section-label mono">Decisive Arguments</div>
            <div class="arguments-list">
              <div
                v-for="(arg, i) in report.decisive_arguments"
                :key="arg.agent_id"
                class="argument-card"
              >
                <div class="arg-rank display">{{ String(i + 1).padStart(2, '0') }}</div>
                <div class="arg-body">
                  <div class="arg-agent mono">{{ arg.agent_id }}</div>
                  <p class="arg-text">{{ arg.argument }}</p>
                  <div class="arg-influence mono">
                    <span class="muted">Influenced:</span>
                    <span
                      v-for="a in arg.influenced_agents"
                      :key="a"
                      class="influence-chip"
                    >{{ a }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Agent Summaries -->
          <section class="report-section fade-up fade-up-3">
            <div class="section-label mono">Agent Journey</div>
            <div class="agent-summaries">
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
          </section>

        </div>

        <!-- Right sidebar -->
        <aside class="report-sidebar">

          <!-- Stats -->
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
            <!-- Donut-style visual -->
            <div class="shift-visual">
              <div class="shift-bar">
                <div
                  class="shift-fill"
                  :style="`width:${(report.agents_shifted/(report.agents_shifted+report.agents_held))*100}%`"
                ></div>
              </div>
              <div class="mono muted" style="font-size:10px; margin-top:6px;">
                {{ ((report.agents_shifted/(report.agents_shifted+report.agents_held))*100).toFixed(0) }}% opinion shift rate
              </div>
            </div>
          </div>

          <!-- Predicted Trajectory -->
          <div class="card trajectory-card fade-up fade-up-1">
            <div class="section-label mono" style="margin-bottom:12px;">
              Predicted Trajectory
            </div>
            <div class="trajectory-icon">⟶</div>
            <p class="trajectory-text">{{ report.predicted_trajectory }}</p>
          </div>

          <!-- Actions -->
          <div class="card fade-up fade-up-2" style="padding:18px;">
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

const report  = ref(null)
const loading = ref(true)
const error   = ref('')

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

/* Loading / Error */
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
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.0;
  color: var(--text);
  margin-bottom: 16px;
}

.masthead-meta {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

/* Body layout */
.report-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 32px;
  align-items: start;
}

/* Section */
.report-section { margin-bottom: 40px; }
.section-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* Summary */
.summary-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text);
  font-weight: 300;
}

/* Arguments */
.arguments-list { display: flex; flex-direction: column; gap: 16px; }
.argument-card {
  display: flex;
  gap: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  transition: border-color var(--transition);
}
.argument-card:hover { border-color: var(--border-hi); }

.arg-rank {
  font-size: 36px;
  color: var(--text-dim);
  line-height: 1;
  flex-shrink: 0;
  width: 40px;
}

.arg-body { flex: 1; }
.arg-agent { font-size: 10px; letter-spacing: 0.08em; color: var(--accent); margin-bottom: 6px; }
.arg-text { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px; }
.arg-influence { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 10px; }
.influence-chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 2px 8px;
  font-size: 10px;
  color: var(--text-muted);
}

/* Agent Summaries */
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
}
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

/* Sidebar */
.report-sidebar { display: flex; flex-direction: column; gap: 16px; }

.stats-card { padding: 24px; }
.big-stat { margin-bottom: 8px; }
.big-val { font-size: 52px; display: block; line-height: 1; }
.big-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }

.shift-visual { margin-top: 8px; }
.shift-bar {
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
}
.shift-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), rgba(200,255,87,0.5));
  border-radius: 3px;
  transition: width 1s ease;
}

.trajectory-card { padding: 24px; }
.trajectory-icon { font-size: 32px; margin-bottom: 12px; color: var(--accent); }
.trajectory-text { font-size: 14px; color: var(--text-muted); line-height: 1.7; font-weight: 300; }

/* Responsive */
@media (max-width: 900px) {
  .report-body { grid-template-columns: 1fr; }
  .report-sidebar { order: -1; }
  .agent-summary-row { grid-template-columns: 1fr; }
}
</style>
