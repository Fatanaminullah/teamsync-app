"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/store";
import { GalleryVerticalEnd, LogOut, UserCircle } from "lucide-react";

export default function Navbar() {
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setUser({ name: "", room: "" });
    window.location.reload();
  };
  return (
    <div className="w-full fixed top-0 left-0">
      <div className="container flex justify-between items-center h-20">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          TeamSync.
        </a>
        {user.name && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80">
              <UserCircle />
              {user.name}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
