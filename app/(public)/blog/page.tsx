import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Dicas financeiras, guias de investimentos e novidades sobre o Lemon para casais.",
  openGraph: {
    title: "Blog | Lemon Finanças",
    description:
      "Dicas financeiras, guias de investimentos e novidades sobre o Lemon para casais.",
    type: "website",
    url: "https://lemonfinancas.com.br/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Lemon Finanças",
    description:
      "Dicas financeiras, guias de investimentos e novidades sobre o Lemon para casais.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b bg-muted/30">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-[800px] text-center space-y-6">
            <Badge
              variant="secondary"
              className="px-4 py-1 text-sm rounded-full"
            >
              Blog do Lemon
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Finanças para quem{" "}
              <span className="text-primary">constrói junto</span>
            </h1>
            <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
              Conteúdos práticos sobre planejamento financeiro, investimentos e
              organização para casais. Sem "economês".
            </p>
          </div>
        </div>
      </section>

      <div className="container py-12 md:py-20">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" />
              Destaque
            </h2>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:border-primary/20"
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                <div className="relative aspect-video md:aspect-auto w-full h-full min-h-[300px] bg-muted overflow-hidden">
                  {featuredPost.coverImage && (
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 md:p-10 space-y-4">
                  <div className="flex items-center gap-2">
                    {featuredPost.tags.slice(0, 1).map((tag) => (
                      <Badge key={tag} className="text-xs font-medium">
                        {tag}
                      </Badge>
                    ))}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(featuredPost.date), "d 'de' MMM, yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-muted-foreground md:text-lg line-clamp-3">
                    {featuredPost.description}
                  </p>
                  <div className="pt-4">
                    <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
                      Ler artigo completo{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Últimas postagens
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="aspect-[1.6/1] relative bg-muted overflow-hidden">
                  {post.coverImage && (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="secondary"
                      className="shadow-sm backdrop-blur-sm bg-background/80"
                    >
                      {post.tags[0]}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(post.date), "d MMM, yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      {post.author}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {post.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
