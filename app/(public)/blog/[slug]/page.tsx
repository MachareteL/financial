import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import { NewsletterCTA } from "@/components/blog/newsletter-cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, UserIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Metadata } from "next";
import Image from "next/image";

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
    const url = `https://lemonfinancas.com.br/blog/${slug}`;
    const ogImage = post.coverImage
      ? `https://lemonfinancas.com.br${post.coverImage}`
      : "https://lemonfinancas.com.br/og-blog.jpg";

    return {
      title: `${post.title} | Blog Lemon`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        url,
        publishedTime: post.date,
        authors: [post.author],
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: [ogImage],
      },
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
    <article className="min-h-screen bg-background">
      {/* Header / Hero */}
      <div className="bg-muted/30 border-b">
        <div className="container max-w-4xl py-10 md:py-16">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-8 pl-0 hover:bg-transparent hover:text-primary transition-colors"
          >
            <Link href="/blog">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar para o blog
            </Link>
          </Button>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {post.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">
                  {post.author}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(post.date), "d 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.coverImage && (
        <div className="container max-w-4xl -mt-8 mb-12 relative z-10">
          <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-lg border">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container max-w-3xl py-8 md:py-12">
        <div
          className="prose prose-lg prose-zinc dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight 
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-md"
        >
          <MDXRemote source={post.content} />
        </div>

        <div className="mt-20 border-t pt-10">
          <NewsletterCTA />
        </div>
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
            publisher: {
              "@type": "Organization",
              name: "Lemon Finanças",
              logo: {
                "@type": "ImageObject",
                url: "https://lemonfinancas.com.br/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://lemonfinancas.com.br/blog/${slug}`,
            },
          }),
        }}
      />
    </article>
  );
}
