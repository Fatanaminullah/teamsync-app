import { GalleryVerticalEnd } from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full fixed top-0 left-0">
      <div className="container flex justify-between items-center h-20">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          TeamSync.
        </a>
      </div>
    </div>
  );
}
