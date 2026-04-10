"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Save, FileText, ChevronRight } from "lucide-react"

import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const blogs = [
  { id: "1", title: "The Future of AI Architecture", author: "Antigravity", status: "Published", date: "2026-04-01", content: "Artificial Intelligence is evolving rapidly. The next phase of AI architecture will involve more agentic behavior and improved reasoning capabilities." },
  { id: "2", title: "Next.js 16: What's New?", author: "Vercel Enthusiast", status: "Review", date: "2026-04-05", content: "Next.js 16 introduces several performance enhancements and deeper integration with React 19 features." },
  { id: "3", title: "Modern CSS with Tailwind v4", author: "Stylist", status: "Draft", date: "2026-04-09", content: "Tailwind CSS v4 is a significant update that simplifies configuration and improves build performance." },
  { id: "4", title: "Building Scalable Dashboards", author: "Deepmind Team", status: "Published", date: "2026-03-25", content: "Scalability in dashboards requires careful consideration of data fetching patterns and component reusability." },
]

export default function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const blog = blogs.find((b) => b.id === id)

  const { showDialog, setShowDialog, confirmLeave, requestLeave } = useUnsavedChanges(`/blog/${id}`)

  if (!blog) return <div>Blog not found</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Unsaved-changes dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you go back now, all edits will be
              lost. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on page</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeave}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/blog">Blog List</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/blog/${blog.id}`}>View Post</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Post</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground italic">Updating "{blog.title}"</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg group">
          <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
          Publish Update
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Content editor */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur ring-1 ring-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Content Editor
              </CardTitle>
              <CardDescription>Compose and refine your message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider opacity-70">
                  Main Title
                </Label>
                <Input
                  id="title"
                  defaultValue={blog.title}
                  className="text-lg font-medium bg-background/50 border-muted-foreground/20 focus:ring-primary focus:border-primary transition-all h-12"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content" className="text-sm font-semibold uppercase tracking-wider opacity-70">
                  Full Content
                </Label>
                <Textarea
                  id="content"
                  defaultValue={blog.content}
                  className="min-h-[400px] text-lg bg-background/50 border-muted-foreground/20 focus:ring-primary focus:border-primary transition-all resize-none shadow-inner"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-secondary/20 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Publishing Details</CardTitle>
              <CardDescription>Configure visibility and meta data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="author" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Author
                </Label>
                <Input id="author" defaultValue={blog.author} className="bg-background/80" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Publication Status
                </Label>
                <Input id="status" defaultValue={blog.status} className="bg-background/80" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Schedule Date
                </Label>
                <Input id="date" defaultValue={blog.date} type="date" className="bg-background/80" />
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs gap-1 group"
                onClick={() => requestLeave()}
              >
                <ArrowLeft className="h-3 w-3" />
                Back to detail
              </Button>
              <Link
                href={`/blog/${blog.id}`}
                className="inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground group"
              >
                View current version
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardFooter>
          </Card>

          <div className="p-4 rounded-xl border border-dashed text-center text-sm text-muted-foreground italic bg-muted/5">
            Draft saved at 21:54
          </div>
        </div>
      </div>
    </div>
  )
}
