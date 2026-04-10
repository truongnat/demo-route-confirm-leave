"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Clock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const blogs = [
  { id: "1", title: "The Future of AI Architecture", author: "Antigravity", status: "Published", date: "2026-04-01", content: "Artificial Intelligence is evolving rapidly. The next phase of AI architecture will involve more agentic behavior and improved reasoning capabilities." },
  { id: "2", title: "Next.js 16: What's New?", author: "Vercel Enthusiast", status: "Review", date: "2026-04-05", content: "Next.js 16 introduces several performance enhancements and deeper integration with React 19 features." },
  { id: "3", title: "Modern CSS with Tailwind v4", author: "Stylist", status: "Draft", date: "2026-04-09", content: "Tailwind CSS v4 is a significant update that simplifies configuration and improves build performance." },
  { id: "4", title: "Building Scalable Dashboards", author: "Deepmind Team", status: "Published", date: "2026-03-25", content: "Scalability in dashboards requires careful consideration of data fetching patterns and component reusability." },
]

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const blog = blogs.find((b) => b.id === id)

  if (!blog) {
    return <div>Blog not found</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="hover:bg-accent -ml-2">
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Posts
          </Link>
        </Button>
      </div>

      <article className="space-y-6">
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="text-xs font-semibold uppercase tracking-widest px-3 py-1">
            {blog.status}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground/90">{blog.title}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>{blog.author}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{blog.date}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-xl leading-relaxed text-foreground/80 first-letter:text-4xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
            {blog.content}
          </p>
          <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-primary/10 shadow-inner">
             <p className="italic text-muted-foreground">
                This is a sample blog post content generated for the purpose of demonstrating the dashboard detail view. In a real application, this would be fetched from a CMS or database.
             </p>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Button className="w-full md:w-auto px-12 h-12 rounded-full gap-2 shadow-lg hover:shadow-primary/20 transition-all group" asChild>
            <Link href={`/blog/${blog.id}/edit`}>
              <Edit className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Edit This Post
            </Link>
          </Button>
        </div>
      </article>
    </div>
  )
}
