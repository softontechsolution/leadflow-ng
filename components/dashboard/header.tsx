"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth/auth-client";

type DashboardHeaderProps = {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email[0].toUpperCase();

  async function handleSignOut() {
    await authClient.signOut();

    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-white/95 px-4 backdrop-blur sm:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="aspect-square h-full w-full object-cover"
              />
            ) : null}

            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2">
            <p className="font-medium">{user.name || "User"}</p>

            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              window.location.href = "/dashboard/settings";
            }}
          >
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
