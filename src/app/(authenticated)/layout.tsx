import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = cookies().get("auth_token");
  if (!token) {
    redirect("/login");
  }
  return <>{children}</>;
}
