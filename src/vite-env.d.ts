/// <reference types="vite/client" />

declare module "virtual:blog-posts" {
  import type { BlogPostMetadata } from "./lib/posts";

  export const posts: BlogPostMetadata[];
}