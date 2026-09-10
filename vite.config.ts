import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { parse as parseYaml } from "yaml";

const blogDirectory = fileURLToPath(
  new URL("./src/content/blog", import.meta.url),
);
const virtualBlogPostsId = "virtual:blog-posts";
const resolvedVirtualBlogPostsId = `\0${virtualBlogPostsId}`;

type BlogPostMetadata = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

function getBlogPostMetadata(): BlogPostMetadata[] {
  return readdirSync(blogDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const source = readFileSync(`${blogDirectory}/${filename}`, "utf8");
      const frontMatterMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);

      if (!frontMatterMatch) {
        throw new Error(`Missing front matter in ${filename}`);
      }

      const frontMatter = parseYaml(
        frontMatterMatch[1],
      ) as Partial<BlogPostMetadata>;
      const slug = filename.replace(/\.md$/, "");

      if (!frontMatter.title || !frontMatter.date || !frontMatter.summary) {
        throw new Error(`Invalid front matter in ${filename}`);
      }

      return {
        slug,
        title: frontMatter.title,
        date: frontMatter.date,
        summary: frontMatter.summary,
      };
    })
    .sort((first, second) => second.date.localeCompare(first.date));
}

function blogMetadataPlugin(): Plugin {
  return {
    name: "blog-metadata-index",
    resolveId(id) {
      return id === virtualBlogPostsId ? resolvedVirtualBlogPostsId : undefined;
    },
    load(id) {
      if (id !== resolvedVirtualBlogPostsId) return undefined;

      return `export const posts = ${JSON.stringify(getBlogPostMetadata())};`;
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(blogDirectory) || !file.endsWith(".md")) return;

      const module = server.moduleGraph.getModuleById(
        resolvedVirtualBlogPostsId,
      );
      if (module) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: "full-reload" });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), blogMetadataPlugin()],
});
