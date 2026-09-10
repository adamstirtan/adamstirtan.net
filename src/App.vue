<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { navigationRoutes } from "./router";

const menuOpen = ref(false);
const route = useRoute();
const activeRouteName = computed(() => route.name);

function closeMenu() {
  menuOpen.value = false;
}
</script>

<template>
  <div class="site-shell" :class="{ 'is-menu-open': menuOpen }">
    <header class="site-header">
      <RouterLink
        class="wordmark"
        aria-label="Go to home"
        :to="{ name: 'home' }"
      >
        ADAM<br />STIRTAN
      </RouterLink>
      <button
        class="menu-button"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="site-menu"
        @click="menuOpen = !menuOpen"
      >
        <span>{{ menuOpen ? "Close" : "Menu" }}</span
        ><i aria-hidden="true"></i>
      </button>
    </header>

    <nav id="site-menu" class="menu" :aria-hidden="!menuOpen">
      <RouterLink
        v-for="page in navigationRoutes"
        :key="page.name"
        :to="{ name: page.name }"
        :class="{ active: activeRouteName === page.name }"
        @click="closeMenu"
      >
        {{ page.label }}
      </RouterLink>
    </nav>

    <main><RouterView /></main>
  </div>
</template>
