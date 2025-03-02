import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function UnauthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = cookies().get("auth_token");
  if (token) {
    redirect("/");
  }
  return <>{children}</>;
}
