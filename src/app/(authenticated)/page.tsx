import Chat from "@/components/pages/home/chat";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";

export default function Home() {
  const auth_token = cookies().get("auth_token")?.value;
  return (
    <>
      <Toaster position="top-right" />
      <div className="container">
        <Chat token={`${auth_token}`} />
      </div>
    </>
  );
}
