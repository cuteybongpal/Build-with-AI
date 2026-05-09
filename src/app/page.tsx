import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <div className="user-profile">
        <span className="user-name">
          {session.user.name ?? session.user.email}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="logout-btn">
            로그아웃
          </button>
        </form>
      </div>

      <HomeClient />
    </>
  );
}
