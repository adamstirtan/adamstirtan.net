import MarkdownIt from "markdown-it";
import { posts } from "virtual:blog-posts";

export type BlogPostMetadata = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

export type BlogPost = BlogPostMetadata & {
  content: string;
};

const markdownFiles = import.meta.glob<string>("../content/blog/*.md", {
  query: "?raw",
  import: "default",
});

function contentFromSource(source: string) {
  const frontMatterMatch = /^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/.exec(
    source,
  );

  if (!frontMatterMatch) {
    throw new Error("Missing front matter");
  }

  return frontMatterMatch[1];
}

export { posts };

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const metadata = posts.find((post) => post.slug === slug);
  const entry = Object.entries(markdownFiles).find(([path]) =>
    path.endsWith(`/${slug}.md`),
  );

  if (!metadata || !entry) return undefined;

  const content = contentFromSource(await entry[1]());
  return { ...metadata, content };
}

export async function renderPost(post: BlogPost) {
  const markdown = new MarkdownIt({
    breaks: true,
    linkify: true,
    typographer: true,
  });

  return markdown.render(post.content);
}
