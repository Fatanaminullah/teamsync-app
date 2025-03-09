"use client";

import { LoginForm } from "@/components/pages/login/login-form";
import Image from "next/image";
import logoMainDark from "@/public/img/img_logo-inverted.png";
import logoMain from "@/public/img/img_logo-main.png";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const { theme } = useTheme();
  return (
    <div className="grid min-h-svh lg:grid-cols-2 -mt-20">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block dark:bg-background light:bg-slate-300">
        <Image
          fill
          src={theme === "dark" ? logoMainDark : logoMain}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
