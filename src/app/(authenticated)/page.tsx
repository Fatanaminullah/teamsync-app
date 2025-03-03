import Chat from "@/components/pages/home/chat";
import { cookies } from "next/headers";
import Image from "next/image";

export default function Home() {
  const auth_token = cookies().get("auth_token")?.value;
  return (
    <div className="container py-20">
      <Chat token={`${auth_token}`} />
    </div>
  );
}
