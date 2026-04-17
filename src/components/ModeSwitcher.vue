<template>
  <div class="mode-switcher">
    <div class="switcher-label mono">Choose your simulation mode</div>
    <div class="mode-cards">

      <!-- ── DEBATE MODE ── -->
      <router-link to="/" class="mode-card" :class="{ active: currentMode === 'debate' }">
        <div class="mode-card-inner">
          <div class="mode-icon display">DEBATE</div>
          <div class="mode-tag mono">Tier 1</div>
          <h3 class="mode-title">Public Opinion Simulator</h3>
          <p class="mode-desc">
            Simulate where public opinion lands on any policy, social,
            or campus question — before it actually does.
          </p>
          <div class="mode-features">
            <span class="feature mono">✓ Policy & social topics</span>
            <span class="feature mono">✓ Multi-stakeholder debate</span>
            <span class="feature mono">✓ Validated at Brier 0.0069</span>
          </div>
          <div class="mode-cta mono">
            {{ currentMode === 'debate' ? '← You are here' : 'Simulate opinion →' }}
          </div>
        </div>
      </router-link>

      <!-- ── MARKET MODE ── -->
      <router-link to="/dtc" class="mode-card mode-card-market" :class="{ active: currentMode === 'market' }">
        <div class="mode-card-inner">
          <div class="mode-icon display">MARKET</div>
          <div class="mode-tag mode-tag-market mono">Tier 2 · NEW</div>
          <h3 class="mode-title">DTC Market Simulator</h3>
          <p class="mode-desc">
            Simulate how your target market responds to your product,
            price, and positioning — before you launch.
          </p>
          <div class="mode-features">
            <span class="feature mono">✓ Product & pricing research</span>
            <span class="feature mono">✓ Competitor intelligence</span>
            <span class="feature mono">✓ Van Westendorp price PSM</span>
          </div>
          <div class="mode-cta mono">
            {{ currentMode === 'market' ? '← You are here' : 'Simulate your market →' }}
          </div>
        </div>
      </router-link>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentMode = computed(() =>
  route.path.startsWith('/dtc') ? 'market' : 'debate'
)
</script>

<style scoped>
.mode-switcher {
  width: 100%;
  max-width: 720px;
  margin: 0 auto 32px;
  padding-top: 32px;
}
.switcher-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 12px;
  text-align: center;
}
.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.mode-card {
  display: block;
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  overflow: hidden;
}
.mode-card:hover {
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-1px);
}
.mode-card.active {
  border-color: rgba(200,255,87,0.35);
  background: rgba(200,255,87,0.04);
}
.mode-card-market:hover { border-color: rgba(200,255,87,0.3); }
.mode-card-market.active { border-color: rgba(200,255,87,0.5); }

.mode-card-inner { padding: 20px 20px 16px; }

.mode-icon {
  font-size: 28px;
  letter-spacing: 0.08em;
  color: var(--text);
  margin-bottom: 6px;
  display: block;
  opacity: 0.6;
}
.mode-card.active .mode-icon { opacity: 1; }
.mode-card-market .mode-icon { color: var(--accent); }

.mode-tag {
  display: inline-block;
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 2px 7px;
  border-radius: 100px;
  border: 1px solid var(--border);
  color: var(--text-dim);
  margin-bottom: 12px;
}
.mode-tag-market {
  border-color: rgba(200,255,87,0.3);
  color: var(--accent);
  background: rgba(200,255,87,0.08);
}

.mode-title {
  font-family: var(--body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.3;
}
.mode-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 14px;
}
.mode-features {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}
.feature {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}
.mode-card.active .feature { color: var(--text); }

.mode-cta {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  text-transform: uppercase;
}
.mode-card-market .mode-cta { color: var(--accent); opacity: 0.7; }
.mode-card-market:hover .mode-cta { opacity: 1; }

@media (max-width: 560px) {
  .mode-cards { grid-template-columns: 1fr; }
}
</style>