"use client"

import Link from "next/link"
import { Eye, Plus, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const blogs = [
  { id: "1", title: "The Future of AI Architecture", author: "Antigravity", status: "Published", date: "2026-04-01" },
  { id: "2", title: "Next.js 16: What's New?", author: "Vercel Enthusiast", status: "Review", date: "2026-04-05" },
  { id: "3", title: "Modern CSS with Tailwind v4", author: "Stylist", status: "Draft", date: "2026-04-09" },
  { id: "4", title: "Building Scalable Dashboards", author: "Deepmind Team", status: "Published", date: "2026-03-25" },
]

export default function BlogListPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your content and editorial calendar.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Recent Posts
          </CardTitle>
          <CardDescription>A list of blog posts and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{blog.title}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>
                    <Badge variant={blog.status === "Published" ? "default" : "outline"}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{blog.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="hover:bg-accent group">
                      <Link href={`/blog/${blog.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
