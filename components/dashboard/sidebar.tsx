"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarClock,
  CalendarDays,
  Building2,
  UserPlus,
  Settings,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: UserPlus,
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: UserRound,
  },
  {
    name: "Follow-ups",
    href: "/dashboard/follow-ups",
    icon: CalendarClock,
  },
  {
    name: "Appointments",
    href: "/dashboard/appointments",
    icon: CalendarDays,
  },
  {
    name: "Properties",
    href: "/dashboard/properties",
    icon: Building2,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Lead<span className="text-primary">Flow</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />

              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
