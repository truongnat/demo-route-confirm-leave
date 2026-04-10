"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckSquare, LayoutDashboard, MessageSquare, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./theme-toggle"

const navItems = [
  {
    name: "Todo List",
    href: "/todo",
    icon: CheckSquare,
  },
  {
    name: "Blog Posts",
    href: "/blog",
    icon: MessageSquare,
  },
  {
    name: "Menu 3",
    href: "/menu-3",
    icon: LayoutDashboard,
  },
  {
    name: "Menu 4",
    href: "/menu-4",
    icon: Settings,
  },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl tracking-tight">Antigravity Dash</span>
          </Link>
          <div className="hidden md:flex gap-1 group">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  pathname.startsWith(item.href)
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}
