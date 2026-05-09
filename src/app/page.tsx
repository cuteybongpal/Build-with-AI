import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import HomeClient from "./components/HomeClient";

const getInitial = (value: string | null | undefined) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "U";
  }

  return trimmed.charAt(0).toUpperCase();
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name ?? session.user.email ?? "User";
  const avatarUrl = session.user.image ?? null;

  return (
    <>
      <div className="user-profile">
        <div className="user-card">
          <div className="user-avatar">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} 프로필 이미지`}
                width={32}
                height={32}
                className="user-avatar-image"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="user-avatar-fallback" aria-hidden="true">
                {getInitial(displayName)}
              </span>
            )}
          </div>
          <span className="user-name" title={displayName}>
            {displayName}
          </span>
        </div>
        <Link href="/recipes" className="history-btn">
          기록
        </Link>
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
