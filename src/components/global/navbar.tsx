"use client";

import { useAuthStore } from "@/lib/store";
import { GalleryVerticalEnd, UserCircle } from "lucide-react";

export default function Navbar() {
  const { user } = useAuthStore();
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
          <div className="flex gap-2">
            <UserCircle />
            {user.name}
          </div>
        )}
      </div>
    </div>
  );
}
