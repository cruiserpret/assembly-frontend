<template>
  <div class="report-page">

    <div v-if="loading" class="loading-screen">
      <span class="spinner" style="width:28px;height:28px;border-width:3px;"></span>
      <span class="mono muted">Generating God's Eye View...</span>
    </div>

    <div v-else-if="error" class="error-screen">
      <div class="error-icon">⚠</div>
      <div class="error-title mono">{{ errorTitle }}</div>
      <p class="error-body mono">{{ error }}</p>
      <router-link to="/" class="btn btn-primary" style="margin-top:16px;">+ New Simulation</router-link>
      <router-link :to="`/simulation/${id}`" class="btn btn-ghost" style="margin-top:8px;">← Back to Debate</router-link>
    </div>

    <div v-else-if="report" class="report-wrap">

      <div class="share-banner">
        <span class="mono" style="font-size:10px; color:var(--text-muted);">
          ⤴ Share this report with your team
        </span>
        <div class="share-url-row">
          <span class="share-url mono">{{ shareUrl }}</span>
          <button class="btn btn-ghost" style="font-size:10px; padding:5px 12px; flex-shrink:0;" @click="shareReport">
            {{ copied ? '✓ Copied!' : 'Copy Link' }}
          </button>
        </div>
      </div>

      <!-- Masthead -->
      <header class="masthead fade-up">
        <div class="masthead-eyebrow mono">
          <span class="live-dot" style="background:var(--accent);"></span>
          God's Eye View Report
        </div>
        <h1 class="masthead-title">{{ report.topic }}</h1>
        <div class="masthead-meta mono">
  {{ report.agents_shifted + report.agents_held }} stakeholder groups &nbsp;·&nbsp;
  {{ new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) }}
</div>
        <div class="masthead-source-note mono">
          Simulated from real-world web data across hundreds of sources
        </div>
      </header>

      <div class="report-body">

        <!-- LEFT: main content -->
        <div class="report-main">

          <section class="report-section fade-up fade-up-1">
            <div class="section-label mono">Executive Summary</div>
            <p class="summary-text">{{ report.summary }}</p>
          </section>

          <section class="report-section fade-up fade-up-2">
            <div class="section-label mono">Predicted Trajectory</div>
            <div class="trajectory-block">
              <div class="trajectory-arrow">⟶</div>
              <p class="trajectory-text">{{ report.predicted_trajectory }}</p>
            </div>
          </section>

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

          <!-- Actions — View Debate removed (now in top nav) -->
          <div class="card fade-up fade-up-1" style="padding:18px;">
            <div class="section-label mono" style="margin-bottom:12px;">Actions</div>
            <button class="btn btn-ghost" style="width:100%; justify-content:center; margin-bottom:8px;" @click="shareReport">
              {{ copied ? '✓ Link Copied!' : '⤴ Share Report' }}
            </button>
            <button class="btn btn-ghost" style="width:100%; justify-content:center; margin-bottom:12px;" @click="exportPDF">
              ↓ Export PDF
            </button>
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
import { ref, onMounted, computed } from 'vue'
import { assembly } from '../api/assembly.js'

const props = defineProps({ id: String })

const report      = ref(null)
const loading     = ref(true)
const error       = ref('')
const errorTitle  = ref('Something went wrong')
const journeyOpen = ref(false)
const copied      = ref(false)
const shareUrl    = computed(() => window.location.href)

function shareReport() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2500)
  })
}

function exportPDF() {
  window.print()
}

onMounted(async () => {
  try {
    report.value = await assembly.getReport(props.id)
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('thin_data') || msg.toLowerCase().includes('not enough')) {
      errorTitle.value = 'Not enough data found'
      error.value = "We couldn't find enough real-world data on this topic. Try a broader or more well-known question."
    } else if (msg.includes('no_agents') || msg.toLowerCase().includes('stakeholders')) {
      errorTitle.value = 'Could not generate agents'
      error.value = "Assembly couldn't generate stakeholders for this topic. Try rephrasing your question or adding more context."
    } else if (msg.includes('still be running') || msg.includes('404')) {
      errorTitle.value = 'Report not ready yet'
      error.value = 'The simulation may still be running. Go back and wait a moment, then try again.'
    } else {
      errorTitle.value = 'Something went wrong'
      error.value = msg || 'An unexpected error occurred. Please try again or rephrase your question.'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.report-page {
  min-height: calc(100vh - 72px); /* account for taller nav on report page */
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.loading-screen {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px; min-height: 50vh;
  font-size: 13px; color: var(--text-muted);
}

.error-screen {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; min-height: 50vh;
  text-align: center; padding: 40px 24px;
}
.error-icon { font-size: 40px; color: var(--against); opacity: 0.6; margin-bottom: 8px; }
.error-title { font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text); margin-bottom: 4px; }
.error-body { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 420px; }

.masthead { margin-bottom: 48px; border-bottom: 1px solid var(--border); padding-bottom: 32px; }
.masthead-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
.masthead-title { font-family: var(--display); font-size: clamp(32px, 5vw, 60px); line-height: 1.0; color: var(--text); margin-bottom: 16px; }
.masthead-meta { font-size: 11px; color: var(--text-dim); letter-spacing: 0.05em; }
.masthead-source-note { font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
.masthead-source-note::before { content: '◎'; color: var(--accent); opacity: 0.5; font-size: 10px; }

.report-body { display: grid; grid-template-columns: 1fr 260px; gap: 32px; align-items: start; }
.report-section { margin-bottom: 40px; }

.section-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); font-family: var(--mono); }
.section-label.collapsible { display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: color var(--transition); }
.section-label.collapsible:hover { color: var(--text); }
.collapse-arrow { font-size: 12px; transition: transform 0.25s ease; display: inline-block; }
.collapse-arrow.open { transform: rotate(90deg); }

.summary-text { font-size: 16px; line-height: 1.8; color: var(--text); font-weight: 300; }

.trajectory-block { display: flex; gap: 16px; align-items: flex-start; background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius); padding: 20px; }
.trajectory-arrow { font-size: 24px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.trajectory-text { font-size: 15px; color: var(--text-muted); line-height: 1.7; font-weight: 300; }

.consensus-block { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
.consensus-bars { display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.consensus-bar-row { display: flex; align-items: center; gap: 10px; }
.cbar-track { flex: 1; height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
.cbar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
.consensus-summary { display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--border); padding-left: 24px; }
.consensus-pct { font-size: 56px; line-height: 1; }
.consensus-desc { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-top: 4px; }

.agent-summaries { display: flex; flex-direction: column; gap: 8px; }
.agent-summary-row { display: grid; grid-template-columns: 160px 1fr auto; align-items: center; gap: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; transition: border-color var(--transition); }
.agent-summary-row:hover { border-color: var(--border-hi); }
.agent-summary-row.shifted { border-left: 2px solid rgba(62,232,160,0.4); }
.agent-summary-row.held    { border-left: 2px solid var(--border); }
.as-left { display: flex; align-items: center; gap: 10px; }
.as-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.avatar-for     { background: rgba(62,232,160,0.15); color: var(--for); }
.avatar-against { background: rgba(255,77,109,0.15);  color: var(--against); }
.avatar-neutral { background: rgba(122,139,166,0.15); color: var(--neutral); }
.as-name { font-size: 13px; font-weight: 500; }
.as-moment { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
.shift-badge { font-family: var(--mono); font-size: 10px; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
.shifted-badge { background: rgba(62,232,160,0.12); color: var(--for); border: 1px solid rgba(62,232,160,0.25); }
.held-badge    { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
.journey-collapsed { font-size: 11px; color: var(--text-dim); padding: 12px 0; letter-spacing: 0.04em; }

.report-sidebar { display: flex; flex-direction: column; gap: 16px; }
.stats-card { padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.big-stat { margin-bottom: 8px; }
.big-val { font-size: 52px; display: block; line-height: 1; }
.big-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); font-family: var(--mono); }
.shift-visual { margin-top: 8px; }
.shift-bar { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
.shift-fill { height: 100%; background: linear-gradient(90deg, var(--accent), rgba(200,255,87,0.5)); border-radius: 3px; transition: width 1s ease; }

.share-banner { background: var(--surface); border: 1px solid rgba(200,255,87,0.2); border-radius: var(--radius); padding: 14px 18px; margin-bottom: 32px; display: flex; flex-direction: column; gap: 10px; }
.share-url-row { display: flex; align-items: center; gap: 10px; background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; }
.share-url { flex: 1; font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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

@media print {
  .share-banner, .report-sidebar { display: none; }
  body { background: white !important; color: black !important; }
  .report-page { padding: 20px !important; max-width: 100% !important; }
  .report-body { grid-template-columns: 1fr !important; }
  nav { display: none !important; }
}
</style>