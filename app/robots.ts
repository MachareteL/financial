import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/account/"],
    },
    sitemap: "https://lemonfinancas.com.br/sitemap.xml",
  };
}
