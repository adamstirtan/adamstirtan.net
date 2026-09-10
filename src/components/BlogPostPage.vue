<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { BlogPost } from "../lib/posts";
import { getPost, renderPost } from "../lib/posts";

const route = useRoute();
const post = ref<BlogPost>();
const renderedContent = ref("");

watch(
  () => route.params.slug,
  async (slug) => {
    post.value = await getPost(String(slug));
    renderedContent.value = post.value ? await renderPost(post.value) : "";
  },
  { immediate: true },
);
</script>

<template>
  <section v-if="post" class="inner-view post-view">
    <RouterLink class="back-link" :to="{ name: 'blog' }"
      >Back to notes <span>←</span></RouterLink
    >
    <p class="eyebrow">{{ post.date }}</p>
    <h1>{{ post.title }}</h1>
    <p class="post-summary">{{ post.summary }}</p>
    <div class="post-content" v-html="renderedContent"></div>
  </section>
  <section v-else class="inner-view post-view">
    <p class="eyebrow">Not found</p>
    <h1>That note has moved on.</h1>
    <RouterLink class="back-link" :to="{ name: 'blog' }"
      >Back to notes <span>←</span></RouterLink
    >
  </section>
</template>
