<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { posts } from "../lib/posts";

const postsPerPage = 25;
const route = useRoute();
const searchTerm = ref("");
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const filteredPosts = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase();

  if (!query) return posts;

  return posts.filter((post) =>
    `${post.title} ${post.summary}`.toLocaleLowerCase().includes(query),
  );
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPosts.value.length / postsPerPage)),
);
const currentPage = computed(() => {
  const page = route.query.page;
  const requestedPage = typeof page === "string" ? Number(page) : 1;

  if (!Number.isInteger(requestedPage)) return 1;
  return Math.min(Math.max(requestedPage, 1), totalPages.value);
});
const pagePosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  return filteredPosts.value.slice(start, start + postsPerPage);
});

function pageLocation(page: number) {
  return { name: "blog", query: page === 1 ? {} : { page } };
}
</script>

<template>
  <section class="inner-view">
    <p class="eyebrow">Blog</p>
    <h1>Notes from the workbench.</h1>
    <label class="blog-search">
      <span>Search notes</span>
      <input v-model="searchTerm" type="search" placeholder="Search notes" />
    </label>
    <p v-if="searchTerm" class="search-result">
      {{ filteredPosts.length }}
      {{ filteredPosts.length === 1 ? "note" : "notes" }} found
    </p>
    <div v-if="pagePosts.length" class="entry-list">
      <article v-for="post in pagePosts" :key="post.slug">
        <p>
          {{
            dateFormatter
              .format(new Date(`${post.date}T12:00:00`))
              .replaceAll("/", ".")
          }}
        </p>
        <div>
          <h2>{{ post.title }}</h2>
          <p class="entry-summary">{{ post.summary }}</p>
        </div>
        <RouterLink :to="{ name: 'blog-post', params: { slug: post.slug } }"
          >Read note <span>↗</span></RouterLink
        >
      </article>
    </div>
    <p v-else class="search-empty">No notes matched that search.</p>
    <nav v-if="totalPages > 1" class="pagination" aria-label="Blog pagination">
      <RouterLink v-if="currentPage > 1" :to="pageLocation(currentPage - 1)"
        >Previous</RouterLink
      >
      <p>Page {{ currentPage }} of {{ totalPages }}</p>
      <RouterLink
        v-if="currentPage < totalPages"
        :to="pageLocation(currentPage + 1)"
        >Next</RouterLink
      >
    </nav>
  </section>
</template>
