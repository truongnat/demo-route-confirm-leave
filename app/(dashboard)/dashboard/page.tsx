import Link from "next/link"
import { CheckSquare, MessageSquare, TrendingUp, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Welcome Back,</h1>
        <p className="text-muted-foreground text-lg">Here's what's happening in your workspace today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Tasks", value: "12", description: "+2 since yesterday", icon: CheckSquare, color: "text-blue-500" },
          { title: "Blog Views", value: "1.2k", description: "+15% this week", icon: MessageSquare, color: "text-green-500" },
          { title: "Team Members", value: "8", description: "All online", icon: Users, color: "text-purple-500" },
          { title: "Efficiency", value: "94%", description: "+4% improvement", icon: TrendingUp, color: "text-orange-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-card/40 backdrop-blur hover:bg-card/60 transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-xl bg-card/30 backdrop-blur overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>You have 5 updates since check-in.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                    {i}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">New comment on "Future of AI"</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-xl bg-primary/5 backdrop-blur">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcut to main modules.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-md">
              <Link href="/todo">Manage Todos</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-md">
              <Link href="/blog">Write Blog Post</Link>
            </Button>
            <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 text-md">
              Launch System Wide Sync
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
