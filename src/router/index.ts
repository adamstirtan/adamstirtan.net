import { createRouter, createWebHashHistory } from "vue-router";
import BlogPage from "../components/BlogPage.vue";
import BlogPostPage from "../components/BlogPostPage.vue";
import ContactPage from "../components/ContactPage.vue";
import HomePage from "../components/HomePage.vue";
import LinksPage from "../components/LinksPage.vue";
import PhotographyPage from "../components/PhotographyPage.vue";

export const navigationRoutes = [
  { name: "home", label: "Home", path: "/", component: HomePage },
  { name: "blog", label: "Blog", path: "/blog", component: BlogPage },
  {
    name: "photography",
    label: "Photography",
    path: "/photography",
    component: PhotographyPage,
  },
  { name: "links", label: "Links", path: "/links", component: LinksPage },
  {
    name: "contact",
    label: "Contact",
    path: "/contact",
    component: ContactPage,
  },
] as const;

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...navigationRoutes,
    { name: "blog-post", path: "/blog/:slug", component: BlogPostPage },
  ],
});

export default router;
