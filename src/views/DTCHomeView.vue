<template>
  <div class="dtc-home">

    <!-- ── BETA BANNER ── -->
    <div class="beta-banner">
      <span class="beta-tag mono">MARKET MODE</span>
      <span class="beta-text">
        Assembly simulates your real market using verified Amazon reviews, Reddit communities,
        and competitor intelligence — grounded in actual purchase behavior, not surveys.
      </span>
    </div>

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-eyebrow fade-up mono">
        <span class="live-dot"></span>
        DTC Market Intelligence Engine
      </div>

      <div class="hero-logo-wrap fade-up fade-up-1">
        <div class="hero-logo-bg">
          <div class="logo-grid-lines"></div>
        </div>
        <div class="hero-logo-inner">
          <div class="hero-bracket">[</div>
          <div class="display hero-wordmark">MARKET</div>
          <div class="hero-bracket">]</div>
        </div>
        <h1 class="hero-h1">
          Know exactly where your market lands<br/>before you spend a dollar.
        </h1>
        <div class="hero-tagline display">SIMULATE BEFORE YOU LAUNCH.</div>
      </div>

      <p class="hero-sub fade-up fade-up-2">
        Assembly spawns real buyer personas grounded in verified Amazon reviews and Reddit communities.
        They discuss your product, compare it to your competitors, negotiate on price —
        and tell you the truth your survey respondents never will.
      </p>

      <!-- Stats row -->
      <div class="stats-row fade-up fade-up-3">
        <div class="hero-stat-card">
          <div class="hsc-icon">◎</div>
          <div class="hsc-title mono">Real Buyers</div>
          <div class="hsc-desc">Agents initialized from actual purchase behavior — not hypothetical survey respondents</div>
        </div>
        <div class="hero-stat-card">
          <div class="hsc-icon">⟳</div>
          <div class="hsc-title mono">Competitor Intel</div>
          <div class="hsc-desc">Auto-analyzes your competitors' reviews, pricing, and weaknesses before the simulation runs</div>
        </div>
        <div class="hero-stat-card">
          <div class="hsc-icon">◈</div>
          <div class="hsc-title mono">Price Precision</div>
          <div class="hsc-desc">Van Westendorp PSM reveals your optimal price point and acceptable range mathematically</div>
        </div>
      </div>
    </section>

    <!-- ── LAUNCH FORM ── -->
    <section class="launch-section fade-up fade-up-4">
      <div class="launch-card">

        <div class="launch-header">
          <span class="mono" style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted)">
            Market Simulation Setup
          </span>
          <div class="launch-step-pills">
            <span class="step-pill" :class="{ active: currentSection >= 1 }">01 Product</span>
            <span class="step-divider">→</span>
            <span class="step-pill" :class="{ active: currentSection >= 2 }">02 Customer</span>
            <span class="step-divider">→</span>
            <span class="step-pill" :class="{ active: currentSection >= 3 }">03 Competitors</span>
          </div>
        </div>

        <div class="divider" style="margin:16px 0;"></div>

        <!-- ── SECTION 1: PRODUCT ── -->
        <div class="form-section" id="section-product">
          <div class="section-label">
            <span class="section-num mono">01</span>
            <span class="section-title display">YOUR PRODUCT</span>
          </div>

          <div class="form-group">
            <label class="form-label mono">Product Name</label>
            <input
              v-model="form.product_name"
              type="text"
              class="input"
              placeholder="e.g. Collagen Boost Daily Serum"
              :disabled="loading"
              @focus="currentSection = 1"
            />
          </div>

          <div class="form-group">
            <label class="form-label mono">
              Product Description
              <span class="form-label-hint mono">What makes it different?</span>
            </label>
            <textarea
              v-model="form.product_description"
              class="textarea"
              placeholder="Describe your product, its key features, what problem it solves, and what makes it different from existing products on the market."
              rows="4"
              :disabled="loading"
              @focus="currentSection = 1"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label mono">
                Price (USD)
                <span class="accent mono">${{ form.price || '—' }}</span>
              </label>
              <div class="price-input-wrap">
                <span class="price-symbol">$</span>
                <input
                  v-model.number="form.price"
                  type="number"
                  class="input price-input"
                  placeholder="49"
                  min="1"
                  :disabled="loading"
                  @focus="currentSection = 1"
                />
              </div>
              <p class="field-hint mono">Assembly will also test ±30% price variants</p>
            </div>

            <div class="form-group">
              <label class="form-label mono">Product Category</label>
              <select
                v-model="form.category"
                class="select"
                :disabled="loading"
                @focus="currentSection = 1"
              >
                <option value="">Auto-detect from description</option>
                <option value="beauty_skincare">Beauty & Skincare</option>
                <option value="supplements_health">Supplements & Health</option>
                <option value="fitness_sports">Fitness & Sports</option>
                <option value="food_beverage">Food & Beverage</option>
                <option value="home_lifestyle">Home & Lifestyle</option>
                <option value="fashion_apparel">Fashion & Apparel</option>
                <option value="saas_software">SaaS / Software</option>
                <option value="electronics_tech">Electronics & Tech</option>
                <option value="pet_products">Pet Products</option>
                <option value="baby_kids">Baby & Kids</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div class="divider section-divider"></div>

        <!-- ── SECTION 2: TARGET CUSTOMER ── -->
        <div class="form-section" id="section-customer">
          <div class="section-label">
            <span class="section-num mono">02</span>
            <span class="section-title display">YOUR CUSTOMER</span>
          </div>

          <div class="form-group">
            <label class="form-label mono">Age Range <span class="form-label-hint mono">select all that apply</span></label>
            <div class="chip-group">
              <button
                v-for="range in AGE_RANGES"
                :key="range.value"
                class="chip"
                :class="{ selected: form.age_ranges.includes(range.value) }"
                :disabled="loading"
                @click="toggleChip('age_ranges', range.value)"
                @focus="currentSection = 2"
              >{{ range.label }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label mono">Gender Focus</label>
            <div class="chip-group">
              <button
                v-for="g in GENDERS"
                :key="g.value"
                class="chip"
                :class="{ selected: form.gender === g.value }"
                :disabled="loading"
                @click="form.gender = g.value"
                @focus="currentSection = 2"
              >{{ g.label }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label mono">Household Income <span class="form-label-hint mono">select all that apply</span></label>
            <div class="chip-group">
              <button
                v-for="inc in INCOME_RANGES"
                :key="inc.value"
                class="chip"
                :class="{ selected: form.income_ranges.includes(inc.value) }"
                :disabled="loading"
                @click="toggleChip('income_ranges', inc.value)"
                @focus="currentSection = 2"
              >{{ inc.label }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label mono">
              Customer Interests & Lifestyle
              <span class="form-label-hint mono">press Enter to add</span>
            </label>
            <div class="tag-input-wrap" @click="$refs.interestInput.focus()">
              <span
                v-for="(tag, i) in form.interests"
                :key="i"
                class="tag-pill"
              >
                {{ tag }}
                <button class="tag-remove" @click.stop="removeTag('interests', i)" :disabled="loading">×</button>
              </span>
              <input
                ref="interestInput"
                v-model="interestDraft"
                class="tag-input"
                placeholder="e.g. clean beauty, plant-based, fitness..."
                :disabled="loading"
                @keydown.enter.prevent="addTag('interests', interestDraft)"
                @keydown.comma.prevent="addTag('interests', interestDraft)"
                @focus="currentSection = 2"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label mono">
              Additional Context
              <span class="form-label-hint mono">optional — anything else about your customer</span>
            </label>
            <textarea
              v-model="form.customer_context"
              class="textarea context-area"
              placeholder="e.g. Our customer has tried at least 3 skincare brands. They shop on Amazon Prime. They follow skincare influencers on TikTok and trust peer reviews over brand claims."
              rows="3"
              :disabled="loading"
              @focus="currentSection = 2"
              maxlength="500"
            ></textarea>
            <div class="context-counter mono">{{ form.customer_context.length }}/500</div>
          </div>
        </div>

        <div class="divider section-divider"></div>

        <!-- ── SECTION 3: COMPETITORS ── -->
        <div class="form-section" id="section-competitors">
          <div class="section-label">
            <span class="section-num mono">03</span>
            <span class="section-title display">YOUR COMPETITORS</span>
            <span class="section-badge mono">Assembly auto-analyzes their reviews & pricing</span>
          </div>

          <div class="competitor-grid">
            <div
              v-for="(comp, i) in form.competitors"
              :key="i"
              class="competitor-slot"
              :class="{ filled: comp.name }"
            >
              <div class="competitor-num mono">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="competitor-inputs">
                <input
                  v-model="form.competitors[i].name"
                  type="text"
                  class="input"
                  :placeholder="`Competitor ${i + 1} name or Amazon product`"
                  :disabled="loading"
                  @focus="currentSection = 3"
                />
                <input
                  v-model="form.competitors[i].asin"
                  type="text"
                  class="input input-sm"
                  placeholder="Amazon ASIN (optional — e.g. B08XY1234Z)"
                  :disabled="loading"
                  @focus="currentSection = 3"
                />
              </div>
              <div class="competitor-status mono" v-if="comp.name">
                <span class="live-dot"></span>
                Will analyze {{ comp.name }}
              </div>
            </div>
          </div>

          <p class="field-hint mono" style="margin-top:12px;">
            No competitors? Assembly will still simulate market reception —
            it just won't include competitive switching analysis.
          </p>
        </div>

        <div class="divider section-divider"></div>

        <!-- ── SIMULATION SETTINGS ── -->
        <div class="form-section">
          <div class="section-label">
            <span class="section-num mono">04</span>
            <span class="section-title display">SIMULATION</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label mono">Buyer Agents <span class="accent mono">{{ form.num_agents }}</span></label>
              <input
                v-model.number="form.num_agents"
                type="range"
                min="20"
                max="50"
                step="5"
                class="range"
                :disabled="loading"
              />
              <div class="range-labels mono"><span>20</span><span>50</span></div>
              <p class="field-hint mono">More agents = broader demographic coverage</p>
            </div>

            <div class="form-group">
              <label class="form-label mono">
                Debate Rounds
                <span class="mono muted" style="font-size:9px;">locked at 3 for DTC</span>
              </label>
              <div class="locked-rounds">
                <div class="round-badge active mono">Round 1 — First Impression</div>
                <div class="round-badge active mono">Round 2 — Competitor Comparison</div>
                <div class="round-badge active mono">Round 3 — Consensus Building</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── VALIDATION ── -->
        <p v-if="error" class="error-msg mono">⚠ {{ error }}</p>

        <!-- ── LAUNCH ── -->
        <button
          class="btn btn-primary launch-btn"
          :disabled="!isFormValid || loading"
          @click="launch"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>▶</span>
          {{ loading ? 'Launching Market Simulation...' : 'Launch Market Simulation' }}
        </button>

        <p class="launch-hint mono">
          ⏱ Assembly analyzes competitors, builds buyer personas, and runs 3 rounds of market debate.
          ~10–15 minutes. Keep this tab open.
        </p>

      </div>
    </section>

    <!-- ── WHAT YOU GET ── -->
    <section class="deliverable-section fade-up">
      <div class="deliverable-header">
        <div class="deliverable-eyebrow mono">
          <span style="color:var(--accent);">◈</span>
          What Assembly delivers
        </div>
        <h2 class="deliverable-title display">MARKET GOD'S EYE VIEW</h2>
        <p class="deliverable-desc">
          Eight specific outputs. Every one grounded in real buyer data, not survey respondents.
          This is what a $50,000 Conjoint study gives you — in 15 minutes.
        </p>
      </div>

      <div class="deliverable-grid">
        <div class="deliverable-card" v-for="d in DELIVERABLES" :key="d.title">
          <div class="d-icon">{{ d.icon }}</div>
          <div class="d-title mono">{{ d.title }}</div>
          <div class="d-desc">{{ d.desc }}</div>
          <div class="d-example mono">{{ d.example }}</div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { assembly } from '../api/assembly.js'

const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const currentSection = ref(1)
const interestDraft = ref('')

// ── Form State ──────────────────────────────────────────────────
const form = ref({
  // Mode flag — tells backend this is a DTC simulation
  mode: 'dtc',

  // Product
  product_name:        '',
  product_description: '',
  price:               null,
  category:            '',

  // Customer
  age_ranges:       [],
  gender:           'all',
  income_ranges:    [],
  interests:        [],
  customer_context: '',

  // Competitors
  competitors: [
    { name: '', asin: '' },
    { name: '', asin: '' },
    { name: '', asin: '' },
  ],

  // Simulation
  num_agents: 20,
  num_rounds: 3, // locked for DTC — 3 structured rounds
})

// ── Config ──────────────────────────────────────────────────────
const AGE_RANGES = [
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45-54', label: '45–54' },
  { value: '55+',   label: '55+'   },
]

const GENDERS = [
  { value: 'all',    label: 'All genders' },
  { value: 'women',  label: 'Primarily women' },
  { value: 'men',    label: 'Primarily men' },
  { value: 'nb',     label: 'Non-binary inclusive' },
]

const INCOME_RANGES = [
  { value: 'under_50k',    label: 'Under $50K' },
  { value: '50k_75k',      label: '$50K–$75K' },
  { value: '75k_100k',     label: '$75K–$100K' },
  { value: '100k_150k',    label: '$100K–$150K' },
  { value: 'over_150k',    label: 'Over $150K' },
]

const DELIVERABLES = [
  {
    icon: '◎',
    title: 'Predicted Trial Rate',
    desc: 'What % of your target market will actually buy — derived from the Juster 11-point probability scale.',
    example: 'e.g. 34% predicted trial rate among women 35-44',
  },
  {
    icon: '⬤',
    title: 'Optimal Price Point',
    desc: 'Van Westendorp PSM reveals the exact price where demand is highest without triggering "too expensive" resistance.',
    example: 'e.g. OPP: $42. Acceptable range: $35–$55',
  },
  {
    icon: '▲',
    title: 'Most Receptive Segment',
    desc: 'Which demographic cluster showed the highest buying intent and what drove their decision.',
    example: 'e.g. Women 25-34, income $50-75K, highest at 61% intent',
  },
  {
    icon: '⟳',
    title: 'Competitive Positioning',
    desc: 'Head-to-head vs each competitor: where you win, where you lose, and how many loyalists would switch.',
    example: 'e.g. Beat Competitor A on price, lost on ingredient trust',
  },
  {
    icon: '◈',
    title: 'Top Purchase Drivers',
    desc: 'The exact arguments that converted skeptical agents — your real marketing copy is in here.',
    example: 'e.g. "No synthetic fragrance" was the decisive argument',
  },
  {
    icon: '◻',
    title: 'Top Objections',
    desc: 'What kept AGAINST agents from buying — ranked by frequency across the simulated population.',
    example: 'e.g. Price vs volume ratio mentioned by 8/12 skeptics',
  },
  {
    icon: '⬡',
    title: 'Winning Message',
    desc: 'The exact language that shifted the most agents — pulled directly from the debate, not generated.',
    example: 'e.g. "Clinically tested, not just clean-labeled"',
  },
  {
    icon: '⚠',
    title: 'Risk Factors',
    desc: 'What would kill this product in market — from holdout agent reasoning.',
    example: 'e.g. "Packaging looks untrustworthy at this price point"',
  },
]

// ── Validation ──────────────────────────────────────────────────
const isFormValid = computed(() => {
  return (
    form.value.product_name.trim().length > 0 &&
    form.value.product_description.trim().length > 0 &&
    form.value.price > 0
  )
})

// ── Helpers ──────────────────────────────────────────────────────
function toggleChip(field, value) {
  const arr = form.value[field]
  const idx = arr.indexOf(value)
  if (idx === -1) arr.push(value)
  else arr.splice(idx, 1)
}

function addTag(field, value) {
  const clean = value.trim().replace(/,$/, '')
  if (clean && !form.value[field].includes(clean)) {
    form.value[field].push(clean)
  }
  if (field === 'interests') interestDraft.value = ''
}

function removeTag(field, index) {
  form.value[field].splice(index, 1)
}

// ── Build topic string for backend ──────────────────────────────
// The existing backend expects a "topic" string.
// We encode the DTC context into it until the backend is upgraded.
// Format: [DTC] {product_name} | {price} | {description}
function buildDTCTopic() {
  const { product_name, price, product_description } = form.value
  return `[DTC] ${product_name} at $${price} — ${product_description.slice(0, 200)}`
}

function buildDTCContext() {
  const f = form.value
  const parts = []

  // Demographic context
  parts.push(`DTC MARKET SIMULATION MODE.`)
  parts.push(`Product: ${f.product_name} priced at $${f.price}.`)

  if (f.category) parts.push(`Category: ${f.category}.`)

  const demo = []
  if (f.age_ranges.length)   demo.push(`Age: ${f.age_ranges.join(', ')}`)
  if (f.gender !== 'all')    demo.push(`Gender focus: ${f.gender}`)
  if (f.income_ranges.length) demo.push(`Income: ${f.income_ranges.join(', ')}`)
  if (f.interests.length)    demo.push(`Interests: ${f.interests.join(', ')}`)
  if (demo.length)           parts.push(`Target customer — ${demo.join('. ')}.`)

  if (f.customer_context) parts.push(f.customer_context)

  // Competitor context
  const validComps = f.competitors.filter(c => c.name.trim())
  if (validComps.length) {
    const compStr = validComps.map(c =>
      c.asin ? `${c.name} (ASIN: ${c.asin})` : c.name
    ).join(', ')
    parts.push(`Competitors to analyze: ${compStr}.`)
  }

  parts.push(`Run Van Westendorp PSM with price anchors at $${Math.round(f.price * 0.5)}, $${f.price}, $${Math.round(f.price * 1.3)}.`)
  parts.push(`Compute Juster predicted trial rate. Identify most receptive demographic segment. Output DTC God's Eye View.`)

  return parts.join(' ')
}

// ── Launch ──────────────────────────────────────────────────────
async function launch() {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    const res = await assembly.startSimulation({
      topic:      buildDTCTopic(),
      context:    buildDTCContext(),
      num_agents: form.value.num_agents,
      num_rounds: 3, // DTC always 3 structured rounds
      uploads:    [],
    })

    router.push(
      `/dtc/simulation/${res.simulation_id}` +
      `?agents=${form.value.num_agents}` +
      `&product=${encodeURIComponent(form.value.product_name)}` +
      `&price=${form.value.price}`
    )
  } catch (e) {
    error.value = e.message || 'Failed to start simulation. Please try again.'
    loading.value = false
  }
}
</script>

<style scoped>
.dtc-home {
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 60px;
}

/* ── Beta banner ── */
.beta-banner {
  width: 100%;
  background: rgba(200,255,87,0.04);
  border-bottom: 1px solid rgba(200,255,87,0.12);
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 52px;
  z-index: 90;
  backdrop-filter: blur(8px);
}
.beta-tag {
  font-size: 9px;
  letter-spacing: 0.14em;
  padding: 3px 8px;
  border-radius: 100px;
  background: rgba(200,255,87,0.12);
  border: 1px solid rgba(200,255,87,0.25);
  color: var(--accent);
  flex-shrink: 0;
}
.beta-text { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

/* ── Hero ── */
.hero {
  text-align: center;
  max-width: 720px;
  width: 100%;
  margin-bottom: 48px;
  padding-top: 60px;
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
.hero-logo-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.hero-logo-bg {
  position: absolute;
  inset: -20px -60px;
  border: 1px solid rgba(200,255,87,0.06);
  border-radius: 4px;
  overflow: hidden;
  pointer-events: none;
}
.logo-grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(200,255,87,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,255,87,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
}
.hero-logo-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.hero-bracket {
  font-family: var(--mono);
  font-size: clamp(24px, 5vw, 56px);
  color: var(--accent);
  opacity: 0.4;
  line-height: 1;
  font-weight: 300;
}
.hero-wordmark {
  font-size: clamp(48px, 10vw, 100px);
  line-height: 0.9;
  letter-spacing: -0.02em;
  background: linear-gradient(180deg, #fff 0%, rgba(228,234,245,0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-h1 {
  font-family: var(--body);
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 300;
  line-height: 1.3;
  color: var(--text);
  margin-top: 20px;
  margin-bottom: 0;
  letter-spacing: -0.01em;
}
.hero-tagline {
  font-size: clamp(11px, 1.5vw, 16px);
  letter-spacing: 0.25em;
  color: var(--accent);
  margin-top: 12px;
  opacity: 0.6;
}
.hero-tagline::after {
  content: '';
  display: block;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  margin-top: 6px;
  opacity: 0.4;
}
.hero-sub {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  font-weight: 300;
  margin-bottom: 36px;
}
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
.hero-stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  text-align: left;
  transition: border-color var(--transition);
}
.hero-stat-card:hover { border-color: rgba(200,255,87,0.2); }
.hsc-icon  { font-size: 18px; color: var(--accent); margin-bottom: 10px; display: block; }
.hsc-title { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; font-family: var(--mono); }
.hsc-desc  { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

/* ── Launch Card ── */
.launch-section { width: 100%; max-width: 720px; margin-bottom: 60px; }
.launch-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
}
.launch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.launch-step-pills {
  display: flex;
  align-items: center;
  gap: 6px;
}
.step-pill {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 100px;
  border: 1px solid var(--border);
  color: var(--text-dim);
  transition: all var(--transition);
}
.step-pill.active {
  border-color: rgba(200,255,87,0.3);
  color: var(--accent);
  background: rgba(200,255,87,0.06);
}
.step-divider { font-size: 10px; color: var(--text-dim); }

/* ── Form Sections ── */
.form-section { margin-bottom: 8px; }
.section-divider { margin: 24px 0; }
.section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.section-num {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.08em;
}
.section-title {
  font-size: 18px;
  color: var(--text);
  letter-spacing: 0.06em;
}
.section-badge {
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--accent);
  background: rgba(200,255,87,0.08);
  border: 1px solid rgba(200,255,87,0.2);
  padding: 3px 8px;
  border-radius: 100px;
  margin-left: auto;
}

/* ── Form Elements ── */
.form-group { margin-bottom: 20px; }
.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-family: var(--mono);
}
.form-label-hint {
  font-size: 10px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-dim);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.field-hint {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 6px;
  letter-spacing: 0.02em;
}

/* ── Price Input ── */
.price-input-wrap { position: relative; }
.price-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}
.price-input { padding-left: 28px !important; }

/* ── Select ── */
.select {
  width: 100%;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--text);
  font-size: 13px;
  font-family: var(--body);
  appearance: none;
  cursor: pointer;
  transition: border-color var(--transition);
}
.select:focus { outline: none; border-color: rgba(200,255,87,0.4); }

/* ── Chips ── */
.chip-group { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-family: var(--mono);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--bg-2);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}
.chip:hover:not(:disabled) {
  border-color: rgba(200,255,87,0.3);
  color: var(--accent);
  background: rgba(200,255,87,0.06);
}
.chip.selected {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(200,255,87,0.12);
}

/* ── Tag Input ── */
.tag-input-wrap {
  min-height: 44px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  cursor: text;
  transition: border-color var(--transition);
}
.tag-input-wrap:focus-within { border-color: rgba(200,255,87,0.4); }
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--mono);
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 100px;
  background: rgba(200,255,87,0.12);
  border: 1px solid rgba(200,255,87,0.25);
  color: var(--accent);
}
.tag-remove {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-size: 12px;
  opacity: 0.7;
}
.tag-remove:hover { opacity: 1; }
.tag-input {
  flex: 1;
  min-width: 120px;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13px;
  font-family: var(--body);
}

/* ── Textarea ── */
.context-area { font-size: 12px; resize: none; }
.context-counter {
  font-size: 10px;
  color: var(--text-muted);
  text-align: right;
  margin-top: 4px;
  letter-spacing: 0.04em;
}

/* ── Competitors ── */
.competitor-grid { display: flex; flex-direction: column; gap: 12px; }
.competitor-slot {
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: border-color var(--transition);
}
.competitor-slot.filled { border-color: rgba(200,255,87,0.2); }
.competitor-num { font-size: 11px; color: var(--text-dim); margin-top: 11px; flex-shrink: 0; }
.competitor-inputs { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.input-sm { font-size: 11px; padding: 6px 12px; }
.competitor-status {
  font-size: 9px;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  letter-spacing: 0.04em;
}

/* ── Rounds ── */
.locked-rounds { display: flex; flex-direction: column; gap: 6px; }
.round-badge {
  font-size: 10px;
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  color: var(--text-dim);
  letter-spacing: 0.06em;
}
.round-badge.active {
  border-color: rgba(200,255,87,0.2);
  color: var(--accent);
  background: rgba(200,255,87,0.05);
}

/* ── Range ── */
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
.range-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-dim); }

/* ── Error ── */
.error-msg {
  font-size: 12px;
  color: var(--against);
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(255,77,109,0.08);
  border: 1px solid rgba(255,77,109,0.2);
  border-radius: var(--radius);
}

/* ── Launch Btn ── */
.launch-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 12px;
  margin-bottom: 12px;
}
.launch-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
.launch-hint { text-align: center; font-size: 11px; color: var(--text-muted); letter-spacing: 0.02em; }

/* ── Deliverables ── */
.deliverable-section { width: 100%; max-width: 720px; margin-bottom: 60px; }
.deliverable-header { text-align: center; margin-bottom: 28px; }
.deliverable-eyebrow {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--mono);
}
.deliverable-title { font-size: clamp(32px, 5vw, 56px); color: var(--text); line-height: 1; margin-bottom: 14px; }
.deliverable-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto;
  font-weight: 300;
}
.deliverable-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.deliverable-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: border-color var(--transition);
}
.deliverable-card:hover { border-color: rgba(200,255,87,0.2); }
.d-icon  { font-size: 20px; color: var(--accent); margin-bottom: 10px; display: block; }
.d-title { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text); margin-bottom: 8px; }
.d-desc  { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px; }
.d-example {
  font-size: 10px;
  color: var(--accent);
  opacity: 0.7;
  letter-spacing: 0.02em;
  border-left: 2px solid rgba(200,255,87,0.3);
  padding-left: 8px;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .dtc-home { padding: 0 16px 40px; }
  .stats-row { grid-template-columns: 1fr; }
  .form-row  { grid-template-columns: 1fr; }
  .deliverable-grid { grid-template-columns: 1fr; }
  .launch-card { padding: 20px 16px; }
  .launch-header { flex-direction: column; align-items: flex-start; }
}
</style>