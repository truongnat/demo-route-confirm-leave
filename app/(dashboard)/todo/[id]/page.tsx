"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const todos = [
  { id: "1", title: "Complete design system", description: "Design all major components for the new platform.", status: "In Progress", priority: "High", dueDate: "2026-05-15" },
  { id: "2", title: "Implement authentication", description: "Add login and signup using NextAuth.js.", status: "Todo", priority: "Medium", dueDate: "2026-05-20" },
  { id: "3", title: "Setup database schema", description: "Design the relational schema and implement it in Postgres.", status: "Done", priority: "High", dueDate: "2026-05-10" },
  { id: "4", title: "Create API documentation", description: "Write Swagger/OpenAPI docs for the core endpoints.", status: "Todo", priority: "Low", dueDate: "2026-05-30" },
]

export default function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    return <div>Todo not found</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="hover:bg-accent -ml-2">
          <Link href="/todo" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{todo.title}</CardTitle>
              <Badge variant={todo.status === "Done" ? "default" : "secondary"}>
                {todo.priority}
              </Badge>
            </div>
            <CardDescription className="text-lg">Full details of the task.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Description</span>
              <p className="text-foreground leading-relaxed">{todo.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
                <p className="font-medium">{todo.status}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Due Date</span>
                <p className="font-medium">{todo.dueDate}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2">
              <Link href={`/todo/${todo.id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit Task
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="hidden md:block">
          <div className="aspect-video rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border shadow-inner flex items-center justify-center">
            <span className="text-muted-foreground italic">Visual representation of the task</span>
          </div>
        </div>
      </div>
    </div>
  )
}
