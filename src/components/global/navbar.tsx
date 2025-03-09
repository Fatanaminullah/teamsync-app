"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import { useAuthStore } from "@/lib/store";
import {
  LogOut,
  Moon,
  Sun,
  UserCircle
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

import favicon from "@/public/img/favicon.png";
import Image from "next/image";

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    setUser({ name: "", room: "" });
    window.location.reload();
  };
  return (
    <div className="w-full fixed top-0 left-0 bg-white">
      <div className="container flex justify-between items-center h-20">
        <a href="#" className="flex items-center gap-1 font-medium">
          <Image src={favicon} alt="Image" className="w-6 h-6" />
          TeamSync.
        </a>
        <div className="flex items-center gap-4">
          {user.name && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80">
                <UserCircle />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <UserCircle />
                  {user.name}
                </DropdownMenuItem>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
