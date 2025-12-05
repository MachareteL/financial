import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import { NewsletterCTA } from "@/app/(public)/blog/_components/newsletter-cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, UserIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getPostSlugs();
  return posts.map((slug) => ({
    slug: slug.replace(/\.mdx$/, ""),
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} | Blog Lemon`,
      description: post.description,
    };
  } catch {
    return {
      title: "Post não encontrado",
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="container max-w-3xl py-12 md:py-24">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 -ml-2 text-muted-foreground"
        >
          <Link href="/blog">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar para o blog
          </Link>
        </Button>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground border-b pb-8 mb-8">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {format(new Date(post.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" />
            {post.author}
          </div>
        </div>
      </div>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <MDXRemote source={post.content} />
      </div>

      <div className="mt-16 border-t pt-8">
        <NewsletterCTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            image: post.coverImage
              ? [`https://lemonfinancas.com.br${post.coverImage}`]
              : [],
            datePublished: post.date,
            author: {
              "@type": "Person",
              name: post.author,
            },
          }),
        }}
      />
    </article>
  );
}
