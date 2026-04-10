"use client"

import * as React from "react"
import { ArrowLeft, Save } from "lucide-react"

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const todos = [
  { id: "1", title: "Complete design system", description: "Design all major components for the new platform.", status: "In Progress", priority: "High", dueDate: "2026-05-15" },
  { id: "2", title: "Implement authentication", description: "Add login and signup using NextAuth.js.", status: "Todo", priority: "Medium", dueDate: "2026-05-20" },
  { id: "3", title: "Setup database schema", description: "Design the relational schema and implement it in Postgres.", status: "Done", priority: "High", dueDate: "2026-05-10" },
  { id: "4", title: "Create API documentation", description: "Write Swagger/OpenAPI docs for the core endpoints.", status: "Todo", priority: "Low", dueDate: "2026-05-30" },
]

export default function TodoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const todo = todos.find((t) => t.id === id)

  const { showDialog, setShowDialog, confirmLeave, requestLeave } = useUnsavedChanges(`/todo/${id}`)

  if (!todo) return <div>Todo not found</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => requestLeave()}
          className="hover:bg-accent -ml-2 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Detail
        </Button>
      </div>

      <Card className="max-w-2xl border-none shadow-2xl bg-card/50 backdrop-blur mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Task</CardTitle>
          <CardDescription>Update the details of your task.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider">
              Title
            </Label>
            <Input
              id="title"
              defaultValue={todo.title}
              className="bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-300"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              id="description"
              defaultValue={todo.description}
              className="min-h-[120px] bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-sm font-semibold uppercase tracking-wider">
                Status
              </Label>
              <Input
                id="status"
                defaultValue={todo.status}
                className="bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-300"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority" className="text-sm font-semibold uppercase tracking-wider">
                Priority
              </Label>
              <Input
                id="priority"
                defaultValue={todo.priority}
                className="bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-300"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button variant="outline" className="flex-1" onClick={() => requestLeave()}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2 group">
            <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
