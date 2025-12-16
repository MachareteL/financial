import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { DateUtils } from "@/domain/utils/date.utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://lemonfinancas.com.br/blog/${post.slug}`,
    lastModified: DateUtils.parse(post.date) || new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://lemonfinancas.com.br",
      lastModified: DateUtils.now(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://lemonfinancas.com.br/auth",
      lastModified: DateUtils.now(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://lemonfinancas.com.br/terms",
      lastModified: DateUtils.now(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://lemonfinancas.com.br/privacy",
      lastModified: DateUtils.now(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...blogEntries,
  ];
}
