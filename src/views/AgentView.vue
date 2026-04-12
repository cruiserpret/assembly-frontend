<template>
  <div class="agent-page">
    <div v-if="loading" class="loading-screen">
      <span class="spinner" style="width:24px;height:24px;border-width:3px;"></span>
      <span class="mono muted">Loading agent memory...</span>
    </div>

    <div v-else-if="profile" class="agent-wrap">

      <header class="agent-header fade-up">
        <div class="agent-big-avatar" :class="`avatar-big`">
          {{ profile.name.charAt(0) }}
        </div>
        <div>
          <h1 class="display" style="font-size:48px; color:var(--text);">{{ profile.name }}</h1>
          <p class="mono muted" style="font-size:12px; margin-top:4px;">{{ profile.persona }}</p>
          <div class="mono muted" style="font-size:10px; letter-spacing:0.06em; margin-top:8px;">
            Agent ID: {{ profile.agent_id }}
          </div>
        </div>
      </header>

      <div class="divider"></div>

      <div class="memory-grid fade-up fade-up-1">
        <div class="section-label mono" style="margin-bottom:20px; grid-column:1/-1;">
          Simulation Memory · {{ profile.memory.length }} runs
        </div>
        <div v-for="mem in profile.memory" :key="mem.simulation_id" class="memory-card">
          <div class="mem-header">
            <span class="mono muted" style="font-size:10px;">{{ mem.date }}</span>
            <div class="shift-badge" :class="mem.shifted ? 'shifted-badge' : 'held-badge'">
              {{ mem.shifted ? '↻ Shifted' : '— Held' }}
            </div>
          </div>
          <p class="mem-topic">{{ mem.topic }}</p>
          <p class="mem-opinion">{{ mem.final_opinion }}</p>
          <div class="mem-score mono">
            <span class="muted">Final score</span>
            <span class="accent">{{ (mem.final_score * 100).toFixed(0) }}</span>
          </div>
        </div>

        <div v-if="!profile.memory.length" class="mono muted" style="grid-column:1/-1; text-align:center; padding:40px;">
          No prior simulations found for this agent.
        </div>
      </div>

    </div>

    <div v-else-if="error" class="loading-screen mono" style="color:var(--against);">
      ⚠ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { assembly } from '../api/assembly.js'

const props = defineProps({ id: String })

const profile = ref(null)
const loading = ref(true)
const error   = ref('')

onMounted(async () => {
  try {
    profile.value = await assembly.getAgentMemory(props.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.agent-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}
.loading-screen {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; min-height: 50vh;
  font-size: 12px; color: var(--text-muted);
}
.agent-header {
  display: flex; align-items: flex-start; gap: 24px; margin-bottom: 32px;
}
.agent-big-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(200,255,87,0.1);
  border: 2px solid rgba(200,255,87,0.3);
  color: var(--accent);
  font-family: var(--display);
  font-size: 32px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.section-label {
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 8px;
}
.memory-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;
}
.memory-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 18px;
  transition: border-color var(--transition);
}
.memory-card:hover { border-color: var(--border-hi); }
.mem-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.mem-topic { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 8px; }
.mem-opinion { font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-bottom: 12px; }
.mem-score { display: flex; justify-content: space-between; font-size: 11px; }
.shift-badge { font-family: var(--mono); font-size: 9px; padding: 3px 8px; border-radius: 100px; }
.shifted-badge { background: rgba(62,232,160,0.12); color: var(--for); border: 1px solid rgba(62,232,160,0.25); }
.held-badge    { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
</style>
