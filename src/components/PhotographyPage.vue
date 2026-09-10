<script setup lang="ts">
import { photos } from "../content/photos";
</script>

<template>
  <section class="inner-view">
    <p class="eyebrow">Photography</p>
    <h1>Things caught<br />in passing.</h1>
    <div v-if="photos.length" class="photo-grid">
      <figure v-for="photo in photos" :key="photo.filename">
        <img :src="photo.src" :alt="photo.title" />
        <figcaption>{{ photo.title }} / {{ photo.year }}</figcaption>
      </figure>
    </div>
    <p v-else class="photo-empty">Photographs coming soon.</p>
  </section>
</template>
