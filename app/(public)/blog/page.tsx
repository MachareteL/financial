import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata = {
  title: "Blog | Lemon Finanças",
  description: "Dicas de finanças, investimentos e novidades sobre o Lemon.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Blog do Lemon
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Conteúdos para transformar sua vida financeira.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-md">
              {post.coverImage && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted relative">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex gap-2 mb-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {post.description}
                </p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(post.date), "d 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {post.author}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
