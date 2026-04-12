<template>
  <div class="ls-overlay">
    <div class="ls-scan"></div>

    <div class="ls-box">
      <div class="ls-logo display">ASSEMBLY</div>
      <div class="ls-ver mono">Simulation Engine v0.1</div>
      <div class="ls-divider"></div>

      <div class="ls-status">
        <span class="ls-dot"></span>
        <span class="mono ls-lbl">{{ label }}</span>
      </div>

      <div v-if="showCount" class="ls-counter">
        <span class="ls-num display">{{ count }}</span>
        <span class="mono ls-clbl">agents initializing</span>
      </div>

      <div class="ls-track">
        <div class="ls-fill" :style="'width:' + pct + '%'"></div>
      </div>
      <div class="mono ls-pct">{{ Math.round(pct) }}%</div>

      <div class="ls-steps">
        <div v-for="s in steps" :key="s.id" class="ls-step"
          :class="{ done: s.done, active: s.active }">
          <span class="ls-icon mono">{{ s.done ? '✓' : s.active ? '›' : '·' }}</span>
          <span class="ls-stxt mono">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <div class="c-tl"></div>
    <div class="c-tr"></div>
    <div class="c-bl"></div>
    <div class="c-br"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({ numAgents: { type: Number, default: 20 } })
const emit  = defineEmits(['done'])

const label     = ref('Connecting to knowledge graph...')
const pct       = ref(0)
const showCount = ref(false)
const count     = ref(0)

const steps = ref([
  { id:1, label:'Ingesting real-world data from the web', done:false, active:false },
  { id:2, label:'Building NetworkX knowledge graph',    done:false, active:false },
  { id:3, label:'Spawning ' + props.numAgents + ' agent personas', done:false, active:false },
  { id:4, label:'Seeding agent memory with graph context', done:false, active:false },
  { id:5, label:'Calibrating debate engine',            done:false, active:false },
])

const timers = []
const t = (fn, ms) => timers.push(setTimeout(fn, ms))

onMounted(() => {
  t(() => { steps.value[0].active = true; label.value = 'Ingesting real-world data...'; pct.value = 8 }, 200)
  t(() => { steps.value[0].done = true; steps.value[0].active = false; pct.value = 22 }, 900)
  t(() => { steps.value[1].active = true; label.value = 'Building knowledge graph...'; pct.value = 28 }, 1000)
  t(() => { steps.value[1].done = true; steps.value[1].active = false; pct.value = 42 }, 2100)
  t(() => {
    steps.value[2].active = true
    label.value = 'Spawning ' + props.numAgents + ' agents...'
    showCount.value = true
    pct.value = 48
    let c = 0
    const iv = setInterval(() => {
      c += Math.ceil(props.numAgents / 18)
      count.value = Math.min(c, props.numAgents)
      if (c >= props.numAgents) clearInterval(iv)
    }, 80)
    timers.push(iv)
  }, 2200)
  t(() => { steps.value[2].done = true; steps.value[2].active = false; count.value = props.numAgents; pct.value = 65 }, 3600)
  t(() => { steps.value[3].active = true; label.value = 'Seeding agent memory...'; pct.value = 72 }, 3700)
  t(() => { steps.value[3].done = true; steps.value[3].active = false; pct.value = 84 }, 4500)
  t(() => { steps.value[4].active = true; label.value = 'Calibrating debate engine...'; pct.value = 90 }, 4600)
  t(() => { steps.value[4].done = true; steps.value[4].active = false; pct.value = 100; label.value = 'Assembly ready.' }, 5400)
  t(() => emit('done'), 6000)
})

onUnmounted(() => timers.forEach(clearTimeout))
</script>

<style scoped>
.ls-overlay { position:fixed; inset:0; background:var(--bg); z-index:1000; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.ls-scan { position:absolute; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(200,255,87,0.4),transparent); animation:scan 3s linear infinite; }
@keyframes scan { from{top:-1px} to{top:100%} }
.ls-box { display:flex; flex-direction:column; align-items:center; width:420px; z-index:2; animation:fadeUp 0.5s ease both; }
.ls-logo { font-size:60px; color:var(--accent); letter-spacing:0.06em; line-height:1; margin-bottom:6px; }
.ls-ver  { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dim); margin-bottom:28px; }
.ls-divider { width:100%; height:1px; background:var(--border); margin-bottom:24px; }
.ls-status { display:flex; align-items:center; gap:10px; margin-bottom:24px; }
.ls-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:pulse 1s ease-in-out infinite; flex-shrink:0; }
.ls-lbl { font-size:12px; color:var(--text-muted); letter-spacing:0.04em; }
.ls-counter { display:flex; flex-direction:column; align-items:center; margin-bottom:24px; }
.ls-num  { font-size:80px; line-height:1; color:var(--accent); letter-spacing:-0.02em; }
.ls-clbl { font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-muted); margin-top:4px; }
.ls-track { width:100%; height:2px; background:var(--surface-2); border-radius:1px; margin-bottom:6px; overflow:hidden; }
.ls-fill  { height:100%; background:var(--accent); transition:width 0.6s cubic-bezier(0.16,1,0.3,1); border-radius:1px; }
.ls-pct   { font-size:10px; color:var(--text-dim); text-align:right; margin-bottom:24px; width:100%; letter-spacing:0.06em; }
.ls-steps { width:100%; display:flex; flex-direction:column; gap:5px; }
.ls-step  { display:flex; align-items:center; gap:10px; padding:5px 8px; border-radius:4px; transition:all 0.3s ease; border:1px solid transparent; }
.ls-step.active { background:rgba(200,255,87,0.06); border-color:rgba(200,255,87,0.15); }
.ls-icon  { font-size:11px; width:12px; text-align:center; color:var(--text-dim); flex-shrink:0; transition:color 0.3s; }
.ls-step.done .ls-icon   { color:var(--for); }
.ls-step.active .ls-icon { color:var(--accent); }
.ls-stxt  { font-size:11px; color:var(--text-dim); letter-spacing:0.03em; transition:color 0.3s; }
.ls-step.done .ls-stxt   { color:var(--text-muted); }
.ls-step.active .ls-stxt { color:var(--text); }
.c-tl,.c-tr,.c-bl,.c-br { position:absolute; width:20px; height:20px; border-color:rgba(200,255,87,0.25); border-style:solid; }
.c-tl { top:20px; left:20px; border-width:1px 0 0 1px; }
.c-tr { top:20px; right:20px; border-width:1px 1px 0 0; }
.c-bl { bottom:20px; left:20px; border-width:0 0 1px 1px; }
.c-br { bottom:20px; right:20px; border-width:0 1px 1px 0; }
</style>