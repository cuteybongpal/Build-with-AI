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
      {/* 사용자 프로필 */}
      <div className="user-profile">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name ?? ""}
            className="user-avatar"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="user-name">{session.user.name}</span>
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
