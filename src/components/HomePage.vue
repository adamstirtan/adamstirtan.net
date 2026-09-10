<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const atmosphere = ref<HTMLCanvasElement>();
let stopAtmosphere: (() => void) | undefined;

onBeforeUnmount(() => stopAtmosphere?.());

onMounted(() => {
  const canvasElement = atmosphere.value;

  if (!canvasElement) return;

  const canvas: HTMLCanvasElement = canvasElement;
  const drawingContext = canvas.getContext("2d");
  if (!drawingContext) return;
  const context: CanvasRenderingContext2D = drawingContext;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const pointer = { x: -300, y: -300, targetX: -300, targetY: -300 };
  const particles = Array.from({ length: 68 }, (_, index) => ({
    x: (Math.sin(index * 37.1) + 1) / 2,
    y: (Math.sin(index * 71.7 + 2) + 1) / 2,
    phase: index * 0.67,
  }));
  let frameId = 0;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function onPointerMove(event: PointerEvent) {
    const bounds = canvas.getBoundingClientRect();
    pointer.targetX = event.clientX - bounds.left;
    pointer.targetY = event.clientY - bounds.top;
  }

  function render(timestamp: number) {
    pointer.x += (pointer.targetX - pointer.x) * 0.075;
    pointer.y += (pointer.targetY - pointer.y) * 0.075;
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      const baseX = particle.x * width;
      const baseY = particle.y * height;
      const drift = prefersReducedMotion
        ? 0
        : Math.sin(timestamp * 0.0008 + particle.phase) * 8;
      const distance = Math.hypot(baseX - pointer.x, baseY - pointer.y);
      const influence = Math.max(0, 1 - distance / 340);
      const angle = Math.atan2(baseY - pointer.y, baseX - pointer.x);
      const x = baseX + Math.cos(angle) * influence * 46;
      const y = baseY + drift + Math.sin(angle) * influence * 46;

      if (influence > 0) {
        context.beginPath();
        context.moveTo(baseX, baseY + drift * 0.35);
        context.lineTo(x, y);
        context.strokeStyle = `rgba(235, 114, 83, ${0.08 + influence * 0.3})`;
        context.lineWidth = 0.65 + influence * 0.7;
        context.stroke();
      }

      context.beginPath();
      context.arc(x, y, 1.35 + influence * 2.6, 0, Math.PI * 2);
      context.fillStyle = `rgba(235, 114, 83, ${0.17 + influence * 0.42})`;
      context.fill();
    });

    if (!prefersReducedMotion) frameId = requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove);
  frameId = requestAnimationFrame(render);

  stopAtmosphere = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
  };
});
</script>

<template>
  <section class="home-view">
    <canvas
      ref="atmosphere"
      class="home-atmosphere"
      aria-hidden="true"
    ></canvas>
    <div class="home-identity">
      <p class="eyebrow">www.adamstirtan.net</p>
      <h1>Adam<br />Stirtan</h1>
      <p class="roles">Software Engineer<br />Husband<br />Father</p>
    </div>
    <div class="home-intro">
      <p class="eyebrow">Hello there</p>
      <p class="intro-copy">
        I've been writing software for 15+ years, turning good ideas into things
        that actually work. I like hard problems, clean solutions, and
        explaining nerdy things to people who didn't ask to become nerds.
      </p>
      <RouterLink class="text-link" :to="{ name: 'blog' }">
        Read the latest <span aria-hidden="true">↗</span>
      </RouterLink>
    </div>
    <div class="home-footer">
      <p>© {{ new Date().getFullYear() }} Adam Stirtan</p>
      <RouterLink :to="{ name: 'contact' }">
        Say hello <span aria-hidden="true">↗</span>
      </RouterLink>
    </div>
  </section>
</template>
