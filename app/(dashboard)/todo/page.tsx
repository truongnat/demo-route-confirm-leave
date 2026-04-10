"use client"

import Link from "next/link"
import { Eye, Plus } from "lucide-react"

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

const todos = [
  { id: "1", title: "Complete design system", status: "In Progress", priority: "High" },
  { id: "2", title: "Implement authentication", status: "Todo", priority: "Medium" },
  { id: "3", title: "Setup database schema", status: "Done", priority: "High" },
  { id: "4", title: "Create API documentation", status: "Todo", priority: "Low" },
]

export default function TodoListPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground">Manage your tasks and track progress.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>A list of your current tasks and their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos.map((todo) => (
                <TableRow key={todo.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{todo.title}</TableCell>
                  <TableCell>{todo.status}</TableCell>
                  <TableCell>{todo.priority}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="hover:bg-accent group">
                      <Link href={`/todo/${todo.id}`} className="flex items-center gap-2">
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
