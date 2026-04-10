"use client"

import { Settings, Shield, Bell, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Menu4Page() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-lg">Configure your environment preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur ring-1 ring-primary/5">
           <CardHeader>
              <CardTitle className="flex items-center gap-3">
                 <Shield className="h-5 w-5 text-primary" />
                 Privacy & Security
              </CardTitle>
              <CardDescription>Manage how your data is handled.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4">
                 <div className="grid gap-1">
                    <Label className="text-sm font-semibold uppercase tracking-widest">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                 </div>
                 <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-4">
                 <div className="grid gap-1">
                    <Label className="text-sm font-semibold uppercase tracking-widest">Log activities</Label>
                    <p className="text-sm text-muted-foreground">Monitor all login attempts and API usage.</p>
                 </div>
                 <Switch />
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card/50 backdrop-blur ring-1 ring-primary/5">
           <CardHeader>
              <CardTitle className="flex items-center gap-3">
                 <Bell className="h-5 w-5 text-primary" />
                 Notifications
              </CardTitle>
              <CardDescription>Stay updated with system events.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4">
                 <div className="grid gap-1">
                    <Label className="text-sm font-semibold uppercase tracking-widest">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summaries of your tasks.</p>
                 </div>
                 <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-4">
                 <div className="grid gap-1">
                    <Label className="text-sm font-semibold uppercase tracking-widest">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get real-time updates while you work.</p>
                 </div>
                 <Switch />
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
