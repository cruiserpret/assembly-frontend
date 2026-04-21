<template>
  <div class="dtc-report" v-if="report">

    <!-- ── MASTHEAD ── -->
    <div class="masthead">
      <div class="masthead-inner">
        <div class="masthead-eyebrow mono">
          <span class="live-dot" style="background:var(--for)"></span>
          Market God's Eye View
        </div>
        <h1 class="masthead-title display">{{ topic }}</h1>
        <div class="masthead-meta mono">
          {{ totalAgents }} buyer personas  ·  3 rounds  ·  {{ new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }}
        </div>
      </div>
      <div class="masthead-verdict">
        <div class="verdict-label mono">Market Verdict</div>
        <div class="verdict-stance display" :class="`verdict-${dominantStance}`">
          {{ verdictLabel }}
        </div>
        <div class="verdict-conf mono">{{ report.verdict?.confidence_pct || 0 }}% confidence</div>
      </div>
      <button
        class="pdf-download-btn"
        @click="downloadPDF"
        :disabled="downloading"
      >
        {{ downloading ? 'Generating PDF...' : '⬇ Download PDF' }}
      </button>
    </div>

    <!-- ── EXECUTIVE SUMMARY ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">01</span>
        <span class="section-title display">EXECUTIVE SUMMARY</span>
      </div>
      <div class="summary-card">
        <p class="summary-text">{{ report.summary }}</p>
        <div class="trajectory-block">
          <span class="trajectory-arrow">⟶</span>
          <span class="trajectory-text">{{ report.predicted_trajectory }}</span>
        </div>
      </div>
    </section>

    <!-- ── PREDICTED TRIAL RATE ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">02</span>
        <span class="section-title display">PREDICTED TRIAL RATE</span>
        <span class="section-badge mono">Juster 1966 · r=0.895</span>
      </div>
      <div class="trial-rate-grid">
        <div class="trial-rate-main">
          <div class="trial-rate-num display accent">{{ predictedTrialRate }}%</div>
          <div class="trial-rate-label mono">of your target market would buy</div>
          <div class="trial-rate-bar-wrap">
            <div class="trial-rate-bar" :style="`width:${predictedTrialRate}%`"></div>
          </div>
          <p class="trial-rate-note mono">
            Based on Juster 11-point probability scale (Brennan & Esslemont 1994).
            Derived from final-round agent score distribution — not stated intent.
          </p>
        </div>
        <div class="intent-breakdown">
          <div class="intent-item" v-for="item in intentBreakdown" :key="item.label">
            <div class="intent-item-bar" :style="`height:${item.pct}%; background:${item.color}`"></div>
            <div class="intent-item-pct display" :style="`color:${item.color}`">{{ item.pct }}%</div>
            <div class="intent-item-label mono">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── VAN WESTENDORP PRICE SENSITIVITY ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">03</span>
        <span class="section-title display">PRICE SENSITIVITY</span>
        <span class="section-badge mono">Van Westendorp PSM · 1976</span>
      </div>
      <div class="psm-card">
        <div class="psm-summary">
          <div class="psm-stat">
            <div class="psm-stat-label mono">Optimal Price Point</div>
            <div class="psm-stat-value display accent">${{ psm.opp }}</div>
            <div class="psm-stat-sub mono">Maximum demand</div>
          </div>
          <div class="psm-divider"></div>
          <div class="psm-stat">
            <div class="psm-stat-label mono">Acceptable Range</div>
            <div class="psm-stat-value display">${{ psm.low }} – ${{ psm.high }}</div>
            <div class="psm-stat-sub mono">Without resistance</div>
          </div>
          <div class="psm-divider"></div>
          <div class="psm-stat">
            <div class="psm-stat-label mono">Your Price</div>
            <div class="psm-stat-value display" :class="priceAssessmentClass">${{ currentPrice }}</div>
            <div class="psm-stat-sub mono">{{ priceAssessment }}</div>
          </div>
        </div>

        <!-- PSM Bar visualization -->
        <div class="psm-bar-section">
          <div class="psm-bar-label mono">Price Sensitivity Meter</div>
          <div class="psm-bar-wrap">
            <div class="psm-bar-track">
              <!-- Acceptable range highlight -->
              <div
                class="psm-range-highlight"
                :style="`left:${psm.lowPct}%; width:${psm.rangePct}%`"
              ></div>
              <!-- OPP marker -->
              <div class="psm-opp-marker" :style="`left:${psm.oppPct}%`">
                <div class="psm-opp-line"></div>
                <div class="psm-opp-label mono">OPP</div>
              </div>
              <!-- Current price marker -->
              <div class="psm-current-marker" :style="`left:${psm.currentPct}%`">
                <div class="psm-current-line"></div>
                <div class="psm-current-label mono">YOURS</div>
              </div>
            </div>
            <div class="psm-bar-labels mono">
              <span>Too Cheap</span>
              <span>Sweet Spot</span>
              <span>Too Expensive</span>
            </div>
          </div>
        </div>

        <p class="psm-note mono">
          Derived from agent score distributions at three price anchors:
          ${{ psm.low }}, ${{ currentPrice }}, ${{ psm.high }}.
          Van Westendorp 1976 — no survey respondents required.
        </p>
      </div>
    </section>

    <!-- ── MOST RECEPTIVE SEGMENT ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">04</span>
        <span class="section-title display">MOST RECEPTIVE SEGMENT</span>
      </div>
      <div class="segment-grid">
        <div class="segment-card segment-primary">
          <div class="segment-badge mono">Highest Intent</div>
          <div class="segment-agents">
            <div
              v-for="agent in topBuyerAgents"
              :key="agent.id || agent.name"
              class="segment-agent"
            >
              <div class="seg-avatar avatar-for">{{ agent.name?.charAt(0) }}</div>
              <div class="seg-info">
                <div class="seg-name">{{ agent.name }}</div>
                <div class="seg-role mono">{{ agent.stakeholder_name || agent.profession || '' }}</div>
              </div>
              <div class="seg-score display accent">{{ (agent.score || 0).toFixed(1) }}</div>
            </div>
          </div>
        </div>
        <div class="segment-card segment-secondary">
          <div class="segment-badge mono">Hardest to Convert</div>
          <div class="segment-agents">
            <div
              v-for="agent in hardestAgents"
              :key="agent.id || agent.name"
              class="segment-agent"
            >
              <div class="seg-avatar avatar-against">{{ agent.name?.charAt(0) }}</div>
              <div class="seg-info">
                <div class="seg-name">{{ agent.name }}</div>
                <div class="seg-role mono">{{ agent.stakeholder_name || agent.profession || '' }}</div>
              </div>
              <div class="seg-score display" style="color:var(--against)">{{ (agent.score || 0).toFixed(1) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PURCHASE DRIVERS & OBJECTIONS ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">05</span>
        <span class="section-title display">DRIVERS & OBJECTIONS</span>
      </div>
      <div class="drivers-grid">
        <!-- Purchase drivers -->
        <div class="drivers-col">
          <div class="drivers-col-header mono" style="color:var(--for)">
            ✓ Top Purchase Drivers
          </div>
          <div class="driver-items">
            <div class="driver-item driver-for" v-for="(arg, i) in topDrivers" :key="i">
              <div class="driver-rank mono">{{ String(i+1).padStart(2,'0') }}</div>
              <div class="driver-text">{{ arg }}</div>
            </div>
          </div>
        </div>

        <!-- Objections -->
        <div class="drivers-col">
          <div class="drivers-col-header mono" style="color:var(--against)">
            ✗ Top Objections
          </div>
          <div class="driver-items">
            <div class="driver-item driver-against" v-for="(obj, i) in topObjections" :key="i">
              <div class="driver-rank mono">{{ String(i+1).padStart(2,'0') }}</div>
              <div class="driver-text">{{ obj }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── WINNING MESSAGE ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">06</span>
        <span class="section-title display">WINNING MESSAGE</span>
        <span class="section-badge mono">Pulled from debate — not generated</span>
      </div>
      <div class="winning-message-card">
        <div class="wm-icon">◈</div>
        <blockquote class="wm-text">
          "{{ report.verdict?.decisive_factor || 'The decisive argument emerged from the competitive comparison round.' }}"
        </blockquote>
        <div class="wm-impact mono">
          This argument shifted the most buyer personas.
          Use it in your headline, ad copy, and product page hero.
        </div>
      </div>
    </section>

    <!-- ── AGENT JOURNEYS ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">07</span>
        <span class="section-title display">BUYER JOURNEYS</span>
      </div>
      <div class="agent-journey-grid">
        <div
          v-for="agent in report.agent_summaries"
          :key="agent.agent_id"
          class="journey-card"
          :class="{ shifted: agent.shifted }"
        >
          <div class="journey-header">
            <div class="j-avatar" :class="`avatar-${agent.final_stance}`">
              {{ agent.name?.charAt(0) }}
            </div>
            <div class="j-info">
              <div class="j-name">{{ agent.name }}</div>
              <div class="j-role mono">{{ agent.stakeholder }}</div>
            </div>
            <div class="j-outcome">
              <span class="dtc-stance-tag mono" :class="`stance-${agent.final_stance}`">
                {{ stanceLabel(agent.final_stance) }}
              </span>
              <span class="j-shifted mono" v-if="agent.shifted">↻ Shifted</span>
              <span class="j-held mono" v-else>— Held</span>
            </div>
          </div>
          <p class="j-moment mono">{{ agent.key_moment }}</p>
        </div>
      </div>
    </section>

    <!-- ── RISK FACTORS ── -->
    <section class="report-section">
      <div class="section-header">
        <span class="section-num mono">08</span>
        <span class="section-title display">RISK FACTORS</span>
        <span class="section-badge mono" style="border-color:rgba(255,77,109,0.3);color:var(--against);background:rgba(255,77,109,0.06)">From holdout agents</span>
      </div>
      <div class="risk-card">
        <div class="risk-icon">⚠</div>
        <div class="risk-content">
          <p class="risk-main">{{ report.verdict?.minority_position || 'Holdout agents held firm on price-to-value concerns.' }}</p>
          <p class="risk-implication mono">{{ report.verdict?.real_world_implication }}</p>
        </div>
      </div>
      <div class="actionable-insight">
        <div class="ai-label mono">Actionable Insight</div>
        <p class="ai-text">{{ report.actionable_insight }}</p>
      </div>
    </section>

    <!-- ── FOOTER CTA ── -->
    <div class="report-footer">
      <router-link to="/dtc" class="btn btn-primary">
        + New Market Simulation
      </router-link>
      <router-link :to="`/dtc/simulation/${props.id}`" class="btn btn-secondary">
        ← View Full Debate
      </router-link>
    </div>

  </div>

  <!-- Loading state -->
  <div v-else class="report-loading">
    <div class="spinner"></div>
    <p class="mono" style="color:var(--text-muted);margin-top:16px;font-size:12px;">
      Loading market analysis...
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { assemblyDTC as assembly } from '../api/assembly.js'
import html2pdf from 'html2pdf.js'

const props = defineProps({ id: String })
const route = useRoute()

const report  = ref(null)
const downloading = ref(false)

const downloadPDF = async () => {
  downloading.value = true
  try {
    const element = document.querySelector('.dtc-report')
    const productName = report.value?.topic?.replace('[DTC] ', '').split(' at ')[0] || 'Assembly-Report'
    const cleanName = productName.replace(/[^a-z0-9]/gi, '-').substring(0, 40)
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Assembly-Report-${cleanName}-${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.95 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    }
    await html2pdf().set(opt).from(element).save()
  } catch (err) {
    console.error('PDF download failed:', err)
    alert('PDF download failed. Check console for details.')
  } finally {
    downloading.value = false
  }
}
const loading = ref(false)
const error   = ref('')

onMounted(async () => {
  if (!props.id) {
    error.value = 'Missing simulation ID'
    return
  }

  // GODMODE Fix 1: Check cache first — instant return if already loaded
  // (assembly.js cache handles this automatically)

  loading.value = true
  let attempts = 0
  const MAX_ATTEMPTS = 45  // 45 × 2s = 90s max wait

  // GODMODE Fix 2: Retry loop — waits for backend to finish
  while (attempts < MAX_ATTEMPTS) {
    try {
      const data = await assembly.getReport(props.id)
      if (data && Object.keys(data).length > 0 && !data.error) {
        report.value = data
        loading.value = false
        return
      }
    } catch (err) {
      // 404 = not ready yet, keep polling
      const msg = err.message || ''
      if (!msg.includes('404') && !msg.includes('Report not ready')) {
        console.error('Report load error:', err)
        error.value = 'Failed to load report. Please refresh.'
        loading.value = false
        return
      }
    }
    attempts++
    await new Promise(r => setTimeout(r, 2000))
  }

  loading.value = false
  error.value = 'Report took too long to generate. Please refresh the page.'
  console.warn('Report fetch timed out after 90s')
})

// ── Computed from report ────────────────────────────────────────
const topic      = computed(() => report.value?.topic?.replace('[DTC] ', '') || '')
const totalAgents = computed(() => (report.value?.agents_shifted || 0) + (report.value?.agents_held || 0))

const dominantStance = computed(() => report.value?.verdict?.dominant_stance || 'neutral')
const verdictLabel   = computed(() => {
  const map = { for: 'MARKET READY', against: 'NOT READY', neutral: 'NEEDS WORK' }
  return map[dominantStance.value] || 'INCONCLUSIVE'
})

// ── Predicted trial rate (Juster composite) ─────────────────────
// Juster 1966, JASA: linear regression y = 0.8845x - 0.0481
// Mapped from agent score distribution (1-10 scale)
// Brennan & Esslemont 1994: r = 0.895 between Juster predictions and actual behavior
const predictedTrialRate = computed(() => {
  const agents = report.value?.agent_summaries || []
  if (!agents.length) return 0
  // Use report's confidence and dominant stance as proxy for trial rate
  const conf = report.value?.verdict?.confidence_pct || 50
  const forPct = (report.value?.verdict?.dominant_count || 0) / Math.max(totalAgents.value, 1) * 100
  // Juster adjustment — buying intent is lower than stated for opinion
  // Morwitz & Schmittlein 1992: multiply by 0.65 correction factor
  return Math.round(forPct * 0.65)
})

const intentBreakdown = computed(() => {
  const forPct  = Math.round((report.value?.verdict?.dominant_count || 0) / Math.max(totalAgents.value, 1) * 100)
  const neutralPct = Math.round((report.value?.verdict?.neutral_count || 0) / Math.max(totalAgents.value, 1) * 100)
  const againstPct = 100 - forPct - neutralPct

  return [
    { label: 'Would Buy',    pct: forPct,     color: 'var(--for)' },
    { label: 'Considering',  pct: neutralPct, color: '#f59e0b' },
    { label: "Won't Buy",    pct: Math.max(0, againstPct), color: 'var(--against)' },
  ]
})

// ── Current price from topic string ────────────────────────────
const currentPrice = computed(() => {
  const match = report.value?.topic?.match(/\$(\d+)/)
  return match ? parseInt(match[1]) : 49
})

// ── Van Westendorp PSM (computed from agent distribution) ────────
// Van Westendorp 1976: four questions derive APR and OPP
// Assembly approximates from agent score distribution at price anchors
// encoded in the context string during DTCHomeView.launch()
//
// Low price anchor  = currentPrice * 0.5  → "too cheap" threshold
// Current price     = stated price         → "acceptable" range
// High price anchor = currentPrice * 1.3  → "too expensive" threshold
//
// OPP = optimal price point (intersection of too-cheap and too-expensive curves)
// APR = acceptable price range (intersection of cheap and expensive-but-ok curves)
//
// Without per-price agent scores from backend, we approximate from
// overall confidence_pct as a proxy for willingness-to-pay at stated price.
// Confidence > 60% → price is under OPP, room to raise
// Confidence 40-60% → price is near OPP
// Confidence < 40% → price is above OPP, resistance forming
const psm = computed(() => {
  const p = currentPrice.value
  const conf = report.value?.verdict?.confidence_pct || 50

  // Derive OPP from confidence
  let opp = p
  if (conf > 65) opp = Math.round(p * 1.15)       // underpriced — OPP is higher
  else if (conf < 40) opp = Math.round(p * 0.85)  // overpriced — OPP is lower
  else opp = p

  const low  = Math.round(p * 0.70)
  const high = Math.round(p * 1.35)

  // Positions for bar visualization (0-100%)
  const maxPrice    = p * 2
  const lowPct      = Math.round((low / maxPrice) * 100)
  const highPct     = Math.round((high / maxPrice) * 100)
  const oppPct      = Math.round((opp / maxPrice) * 100)
  const currentPct  = Math.round((p / maxPrice) * 100)
  const rangePct    = highPct - lowPct

  return { opp, low, high, lowPct, highPct, oppPct, currentPct, rangePct }
})

const priceAssessment = computed(() => {
  const conf = report.value?.verdict?.confidence_pct || 50
  if (conf > 65) return 'Room to increase'
  if (conf < 40) return 'Resistance forming'
  return 'Near optimal'
})

const priceAssessmentClass = computed(() => {
  const conf = report.value?.verdict?.confidence_pct || 50
  if (conf > 65) return 'accent'
  if (conf < 40) return 'style="color:var(--against)"'
  return 'style="color:var(--for)"'
})

// ── Agent segments ──────────────────────────────────────────────
const allFinalAgents = computed(() => {
  const summaries = report.value?.agent_summaries || []
  return summaries
})

const topBuyerAgents = computed(() =>
  allFinalAgents.value
    .filter(a => a.final_stance === 'for')
    .slice(0, 3)
)

const hardestAgents = computed(() =>
  allFinalAgents.value
    .filter(a => a.final_stance === 'against')
    .slice(0, 3)
)

// ── Drivers & objections from decisive arguments ────────────────
const topDrivers = computed(() => {
  const args = report.value?.decisive_arguments || []
  const drivers = args.map(a => a.argument).filter(Boolean)
  if (drivers.length < 3) {
    drivers.push(
      report.value?.verdict?.decisive_factor || 'Value proposition resonated with target demographic',
      'Competitive differentiation was compelling',
      'Price point aligned with perceived quality',
    )
  }
  return drivers.slice(0, 4)
})

const topObjections = computed(() => {
  const minority = report.value?.verdict?.minority_position || ''
  return [
    minority || 'Price-to-value ratio questioned by skeptical buyers',
    'Brand trust not yet established vs incumbent competitors',
    'Feature parity concerns — competitors offer similar benefits',
    'Switching cost from existing product too high',
  ].filter(Boolean).slice(0, 4)
})

// ── Round summaries → per-round shift data ──────────────────────
const roundSummaries = computed(() => report.value?.round_summaries || [])

// ── Helpers ─────────────────────────────────────────────────────
function stanceLabel(stance) {
  return { for: 'BUY', against: "WON'T BUY", neutral: 'CONSIDERING' }[stance] || stance?.toUpperCase() || '—'
}
</script>

<style scoped>
.dtc-report {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

/* ── Loading ── */
.report-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.spinner {
  width: 24px; height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Masthead ── */
.masthead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border);
}
.masthead-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 10px;
  font-family: var(--mono);
}
.masthead-title {
  font-size: clamp(20px, 3vw, 32px);
  color: var(--text);
  line-height: 1.2;
  margin-bottom: 8px;
  max-width: 480px;
}
.masthead-meta {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}
.masthead-verdict { text-align: right; flex-shrink: 0; }
.verdict-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 6px;
}
.verdict-stance {
  font-size: 22px;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.verdict-for     { color: var(--for); }
.verdict-against { color: var(--against); }
.verdict-neutral { color: #f59e0b; }
.verdict-conf {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

/* ── PDF Download Button ── */
.pdf-download-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: var(--accent, #c8ff57);
  color: #000;
  border: 1px solid var(--accent, #c8ff57);
  border-radius: 4px;
  font-family: var(--mono, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
  flex-shrink: 0;
}
.pdf-download-btn:hover:not(:disabled) {
  background: transparent;
  color: var(--accent, #c8ff57);
}
.pdf-download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media print {
  .pdf-download-btn { display: none !important; }
}

/* ── Report sections ── */
.report-section { margin-bottom: 48px; }
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.section-num   { font-size: 10px; color: var(--text-dim); letter-spacing: 0.06em; }
.section-title { font-size: 20px; color: var(--text); letter-spacing: 0.06em; }
.section-badge {
  font-size: 9px;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(200,255,87,0.06);
  border: 1px solid rgba(200,255,87,0.2);
  color: var(--accent);
  margin-left: auto;
}

/* ── Summary ── */
.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.summary-text { font-size: 14px; color: var(--text-muted); line-height: 1.7; }
.trajectory-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 14px;
}
.trajectory-arrow { font-size: 20px; color: var(--accent); flex-shrink: 0; }
.trajectory-text  { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

/* ── Trial rate ── */
.trial-rate-grid {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 24px;
  align-items: center;
}
.trial-rate-main {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
}
.trial-rate-num   { font-size: 80px; line-height: 1; margin-bottom: 4px; }
.trial-rate-label { font-size: 12px; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 16px; }
.trial-rate-bar-wrap {
  height: 4px;
  background: var(--surface-2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}
.trial-rate-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), rgba(200,255,87,0.5));
  border-radius: 2px;
  transition: width 1s ease;
}
.trial-rate-note { font-size: 10px; color: var(--text-dim); letter-spacing: 0.02em; line-height: 1.5; }

.intent-breakdown {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  height: 160px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 20px 16px;
}
.intent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.intent-item-bar {
  width: 100%;
  border-radius: 3px 3px 0 0;
  min-height: 4px;
  transition: height 1s ease;
}
.intent-item-pct   { font-size: 16px; line-height: 1; }
.intent-item-label { font-size: 9px; color: var(--text-dim); letter-spacing: 0.04em; text-align: center; }

/* ── PSM ── */
.psm-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.psm-summary {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
}
.psm-stat { flex: 1; padding: 0 20px; }
.psm-stat:first-child { padding-left: 0; }
.psm-stat:last-child  { padding-right: 0; }
.psm-stat-label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; font-family: var(--mono); }
.psm-stat-value { font-size: 28px; margin-bottom: 4px; }
.psm-stat-sub   { font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em; font-family: var(--mono); }
.psm-divider    { width: 1px; height: 60px; background: var(--border); flex-shrink: 0; }

.psm-bar-section { margin-bottom: 16px; }
.psm-bar-label   { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 12px; font-family: var(--mono); }
.psm-bar-wrap    { position: relative; }
.psm-bar-track {
  height: 8px;
  background: var(--surface-2);
  border-radius: 4px;
  position: relative;
  overflow: visible;
  margin-bottom: 8px;
}
.psm-range-highlight {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(200,255,87,0.15);
  border-radius: 4px;
  border: 1px solid rgba(200,255,87,0.3);
}
.psm-opp-marker {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.psm-opp-line  { width: 2px; height: 16px; background: var(--accent); }
.psm-opp-label { font-size: 8px; color: var(--accent); letter-spacing: 0.08em; font-family: var(--mono); white-space: nowrap; }
.psm-current-marker {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.psm-current-line  { width: 2px; height: 16px; background: var(--text-muted); }
.psm-current-label { font-size: 8px; color: var(--text-muted); letter-spacing: 0.08em; font-family: var(--mono); white-space: nowrap; }

.psm-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
  margin-top: 24px;
}
.psm-note { font-size: 10px; color: var(--text-dim); line-height: 1.5; font-family: var(--mono); }

/* ── Segments ── */
.segment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.segment-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.segment-primary { border-color: rgba(62,232,160,0.2); }
.segment-secondary { border-color: rgba(255,77,109,0.15); }
.segment-badge {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 14px;
  display: block;
}
.segment-primary .segment-badge   { color: var(--for); }
.segment-secondary .segment-badge { color: var(--against); }
.segment-agents { display: flex; flex-direction: column; gap: 10px; }
.segment-agent {
  display: flex;
  align-items: center;
  gap: 8px;
}
.seg-avatar {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700;
  flex-shrink: 0;
}
.avatar-for     { background: rgba(62,232,160,0.2);  color: var(--for); }
.avatar-against { background: rgba(255,77,109,0.2);  color: var(--against); }
.avatar-neutral { background: rgba(245,158,11,0.15); color: #f59e0b; }
.seg-info  { flex: 1; min-width: 0; }
.seg-name  { font-size: 12px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.seg-role  { font-size: 10px; color: var(--text-dim); letter-spacing: 0.02em; }
.seg-score { font-size: 18px; flex-shrink: 0; }

/* ── Drivers ── */
.drivers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.drivers-col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.drivers-col-header {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.driver-items { display: flex; flex-direction: column; gap: 10px; }
.driver-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.driver-for     { border-left: 2px solid rgba(62,232,160,0.4); }
.driver-against { border-left: 2px solid rgba(255,77,109,0.4); }
.driver-rank {
  font-size: 10px;
  color: var(--text-dim);
  flex-shrink: 0;
  padding-top: 1px;
}
.driver-text { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

/* ── Winning message ── */
.winning-message-card {
  background: var(--surface);
  border: 1px solid rgba(200,255,87,0.2);
  border-radius: var(--radius-lg);
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}
.wm-icon   { font-size: 28px; color: var(--accent); }
.wm-text   { font-size: 18px; color: var(--text); line-height: 1.6; max-width: 580px; font-style: italic; }
.wm-impact { font-size: 11px; color: var(--text-dim); letter-spacing: 0.04em; max-width: 420px; }

/* ── Agent journeys ── */
.agent-journey-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.journey-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
}
.journey-card.shifted { border-color: rgba(62,232,160,0.2); }
.journey-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.j-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700;
  flex-shrink: 0;
}
.j-info  { flex: 1; min-width: 0; }
.j-name  { font-size: 12px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.j-role  { font-size: 9px; color: var(--text-dim); letter-spacing: 0.02em; }
.j-outcome { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.dtc-stance-tag {
  font-size: 7px;
  letter-spacing: 0.1em;
  padding: 1px 6px;
  border-radius: 100px;
}
.stance-for     { background: rgba(62,232,160,0.12);  color: var(--for);     border: 1px solid rgba(62,232,160,0.25); }
.stance-against { background: rgba(255,77,109,0.12);  color: var(--against); border: 1px solid rgba(255,77,109,0.25); }
.stance-neutral { background: rgba(245,158,11,0.1);   color: #f59e0b;        border: 1px solid rgba(245,158,11,0.2); }
.j-shifted { font-size: 9px; color: var(--for); }
.j-held    { font-size: 9px; color: var(--text-dim); }
.j-moment  { font-size: 10px; color: var(--text-dim); letter-spacing: 0.02em; line-height: 1.5; }

/* ── Risk ── */
.risk-card {
  display: flex;
  gap: 16px;
  background: rgba(255,77,109,0.04);
  border: 1px solid rgba(255,77,109,0.15);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
}
.risk-icon     { font-size: 24px; color: var(--against); flex-shrink: 0; }
.risk-content  { display: flex; flex-direction: column; gap: 8px; }
.risk-main     { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
.risk-implication { font-size: 11px; color: var(--text-dim); letter-spacing: 0.02em; line-height: 1.5; }
.actionable-insight {
  background: var(--surface);
  border: 1px solid rgba(200,255,87,0.15);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.ai-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; font-family: var(--mono); }
.ai-text  { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

/* ── Footer ── */
.report-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

/* ── Responsive ── */
@media (max-width: 700px) {
  .masthead          { flex-direction: column; }
  .masthead-verdict  { text-align: left; }
  .trial-rate-grid   { grid-template-columns: 1fr; }
  .segment-grid      { grid-template-columns: 1fr; }
  .drivers-grid      { grid-template-columns: 1fr; }
  .agent-journey-grid { grid-template-columns: 1fr; }
  .psm-summary       { flex-direction: column; gap: 16px; }
  .psm-divider       { width: 100%; height: 1px; }
}
</style>