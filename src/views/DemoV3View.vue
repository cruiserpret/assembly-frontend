<template>
  <div class="v3-demo">
    <!-- Header -->
    <header class="header">
      <h1>Assembly v3-lite</h1>
      <p class="tagline">
        Pre-launch market simulator. Anchored on real comparable brands.
        Deterministic. Honest about confidence.
      </p>
    </header>

    <!-- Product Selector -->
    <section class="selector-row">
      <label class="mono">Product:</label>
      <select v-model="selectedKey" class="product-select" @change="onSelect">
        <option v-for="p in products" :key="p.key" :value="p.key">
          {{ p.label }}
        </option>
      </select>
      <button class="run-btn" :disabled="loading" @click="runLive">
        {{ loading ? 'Running…' : 'Run Live Forecast' }}
      </button>
    </section>

    <!-- Status banner -->
    <div v-if="liveError" class="banner banner-warn mono">
      ⚠ Live backend unavailable — showing cached demo output.
    </div>
    <div v-else-if="isLive" class="banner banner-ok mono">
      ✓ Live forecast from {{ baseUrl }}
    </div>
    <div v-else class="banner banner-info mono">
      📁 Cached demo response (click "Run Live Forecast" to hit production)
    </div>

    <!-- Forecast Card -->
    <section v-if="data" class="forecast-card">
      <div class="rate-block">
        <div class="rate-pct">{{ ratePct }}%</div>
        <div class="rate-range mono">
          Likely range: {{ rateLow }}% – {{ rateHigh }}%
        </div>
        <div class="confidence mono">
          Confidence: <strong>{{ data.confidence }}</strong>
        </div>
      </div>

      <div class="verdict-block">
        <div class="verdict-badge" :class="verdictClass">
          {{ verdictDisplay }}
        </div>
        <div class="headline">{{ data.headline }}</div>
      </div>
    </section>

    <!-- Two-column body -->
    <section v-if="data" class="body-grid">
      <!-- Left: Anchored On -->
      <div class="card">
        <h3>Forecast Anchored On</h3>
        <p class="card-sub">Real comparable brands, weighted by similarity.</p>
        <ul class="anchor-list">
          <li v-for="a in data.anchored_on" :key="a.brand">
            <span class="brand mono">{{ a.brand }}</span>
            <span class="brand-rate mono">{{ (a.trial_rate * 100).toFixed(1) }}%</span>
            <span class="brand-grade" :class="`grade-${a.confidence_grade}`">
              {{ a.confidence_grade }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Right: Confidence reasons + Why might be wrong -->
      <div class="card">
        <h3>Confidence Notes</h3>
        <ul class="reason-list" v-if="data.confidence_reasons?.length">
          <li v-for="(r, i) in data.confidence_reasons" :key="`cr-${i}`">{{ r }}</li>
        </ul>
        <p v-else class="card-sub">Standard confidence — no caveats fired.</p>

        <h3 class="mt-3">Why This Forecast May Be Wrong</h3>
        <ul class="reason-list" v-if="data.why_might_be_wrong?.length">
          <li v-for="(w, i) in data.why_might_be_wrong" :key="`w-${i}`">{{ w }}</li>
        </ul>
        <p v-else class="card-sub">No specific weaknesses flagged.</p>
      </div>
    </section>

    <!-- Counterfactuals (full width) -->
    <section v-if="data?.counterfactuals?.length" class="card">
      <h3>Counterfactual Scenarios <span class="card-sub">(directional, not causal)</span></h3>
      <p class="card-sub">Current forecast: {{ ratePct }}%</p>
      <ul class="cf-list">
        <li v-for="(cf, i) in data.counterfactuals" :key="`cf-${i}`">
          <span class="cf-arrow">{{ cf.direction === 'improves' ? '↑' : (cf.direction === 'worsens' ? '↓' : '→') }}</span>
          <span class="cf-label mono">{{ cf.label }}</span>
          <span class="cf-prediction mono">could move toward {{ cf.new_prediction_pct }}%</span>
          <span class="cf-desc">{{ cf.description }}</span>
        </li>
      </ul>
      <p class="footer-note mono">
        Note: Counterfactuals are directional strategy simulations,
        not validated causal estimates. Treat as planning guidance,
        assuming execution matches comparable brands.
      </p>
    </section>

    <!-- Loading / empty -->
    <div v-if="!data && loading" class="loading">Loading…</div>
    <div v-if="!data && !loading" class="loading">No data.</div>

    <!-- Footer -->
    <footer class="footer mono">
      v3-lite · {{ baseUrl }} · YC demo route
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DEMO_PRODUCTS, forecastV3, loadCachedDemo, V3_BASE_URL } from '../api/assembly_v3.js'

const products = DEMO_PRODUCTS
const selectedKey = ref(DEMO_PRODUCTS[0].key)
const data = ref(null)
const loading = ref(false)
const isLive = ref(false)
const liveError = ref(false)
const baseUrl = V3_BASE_URL

const selected = computed(() => products.find(p => p.key === selectedKey.value))

const ratePct = computed(() => data.value?.trial_rate?.percentage?.toFixed(1) ?? '—')
const rateLow = computed(() => ((data.value?.trial_rate?.low ?? 0) * 100).toFixed(1))
const rateHigh = computed(() => ((data.value?.trial_rate?.high ?? 0) * 100).toFixed(1))

const VERDICT_DISPLAY = {
  launch_aggressively: '🚀 Strong Launch Candidate',
  launch:              '🚀 Launch',
  launch_with_changes: '⚠️ Launch With Changes',
  test_before_launch:  '🔬 Test Before Launch',
  reposition:          '🔄 Reposition',
  do_not_launch_yet:   '🛑 Do Not Launch Yet',
}

const verdictDisplay = computed(() =>
  VERDICT_DISPLAY[data.value?.verdict] ?? data.value?.verdict ?? '—'
)

const verdictClass = computed(() => `verdict-${data.value?.verdict ?? 'unknown'}`)

async function loadCached(p) {
  try {
    data.value = await loadCachedDemo(p.cachedFile)
    isLive.value = false
    liveError.value = false
  } catch (e) {
    console.error('Cache load failed', e)
    data.value = null
  }
}

async function onSelect() {
  liveError.value = false
  isLive.value = false
  await loadCached(selected.value)
}

async function runLive() {
  loading.value = true
  liveError.value = false
  try {
    const res = await forecastV3(selected.value.brief)
    data.value = res
    isLive.value = true
  } catch (e) {
    console.error('Live forecast failed', e)
    liveError.value = true
    // Keep cached data visible (do not clear)
    if (!data.value) {
      await loadCached(selected.value)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadCached(selected.value))
</script>

<style scoped>
.v3-demo {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #1a1a1a;
}
.mono { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 13px; }

.header { margin-bottom: 24px; }
.header h1 { font-size: 28px; margin: 0 0 8px; font-weight: 600; }
.tagline { color: #555; margin: 0; max-width: 720px; }

.selector-row {
  display: flex; gap: 12px; align-items: center;
  margin-bottom: 16px; flex-wrap: wrap;
}
.product-select {
  flex: 1; min-width: 280px;
  padding: 10px 14px; border: 1px solid #ccc; border-radius: 6px;
  font-size: 14px; background: white;
}
.run-btn {
  padding: 10px 20px; border: none; border-radius: 6px;
  background: #1a1a1a; color: white; cursor: pointer; font-size: 14px;
  font-weight: 500;
}
.run-btn:hover:not(:disabled) { background: #333; }
.run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.banner { padding: 10px 14px; border-radius: 6px; margin-bottom: 20px; }
.banner-warn { background: #fff3cd; color: #856404; border: 1px solid #ffeaa0; }
.banner-ok   { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.banner-info { background: #f0f0f0; color: #555;    border: 1px solid #e0e0e0; }

.forecast-card {
  display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;
  background: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px;
  padding: 24px; margin-bottom: 20px;
}
.rate-pct { font-size: 56px; font-weight: 700; line-height: 1; }
.rate-range { color: #666; margin-top: 6px; }
.confidence { color: #666; margin-top: 4px; }

.verdict-block { display: flex; flex-direction: column; gap: 10px; justify-content: center; }
.verdict-badge {
  display: inline-block; padding: 8px 14px; border-radius: 6px;
  font-weight: 600; font-size: 16px; align-self: flex-start;
}
.verdict-launch              { background: #d4edda; color: #155724; }
.verdict-launch_aggressively { background: #c3e6cb; color: #0f3617; }
.verdict-launch_with_changes { background: #fff3cd; color: #856404; }
.verdict-test_before_launch  { background: #d1ecf1; color: #0c5460; }
.verdict-reposition          { background: #e2d5f0; color: #4a235a; }
.verdict-do_not_launch_yet   { background: #f8d7da; color: #721c24; }
.headline { color: #333; font-size: 14px; line-height: 1.5; }

.body-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;
}
.card {
  background: white; border: 1px solid #e0e0e0; border-radius: 8px;
  padding: 16px 20px; margin-bottom: 16px;
}
.card h3 { margin: 0 0 6px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #444; }
.card-sub { color: #888; font-size: 12px; margin: 0 0 10px; }
.mt-3 { margin-top: 16px; }

.anchor-list { list-style: none; padding: 0; margin: 0; }
.anchor-list li {
  display: grid; grid-template-columns: 1fr auto auto; gap: 8px;
  padding: 6px 0; border-bottom: 1px solid #f0f0f0;
}
.brand { font-weight: 500; }
.brand-rate { color: #555; }
.brand-grade { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.grade-A { background: #d4edda; color: #155724; }
.grade-B { background: #fff3cd; color: #856404; }
.grade-C { background: #f8d7da; color: #721c24; }

.reason-list { padding-left: 20px; margin: 0; color: #555; font-size: 13px; line-height: 1.5; }
.reason-list li { margin-bottom: 4px; }

.cf-list { list-style: none; padding: 0; margin: 0; }
.cf-list li {
  display: grid; grid-template-columns: auto 200px auto 1fr; gap: 12px;
  padding: 8px 0; border-bottom: 1px solid #f0f0f0; align-items: center;
}
.cf-arrow { font-size: 18px; }
.cf-label { font-weight: 500; }
.cf-prediction { color: #155724; font-weight: 500; }
.cf-desc { color: #666; font-size: 12px; }

.footer-note {
  margin-top: 14px; color: #888; font-size: 12px; line-height: 1.5;
  border-top: 1px solid #e0e0e0; padding-top: 12px;
}
.footer { margin-top: 32px; color: #aaa; text-align: center; font-size: 12px; }
.loading { padding: 40px; text-align: center; color: #888; }
</style>
