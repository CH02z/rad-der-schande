import { auth } from "@/auth";
import Wheel from "@/components/Wheel";
import TopNav from "@/components/TopNav";
import Landing from "@/components/Landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  // Nicht eingeloggt → Public-Landing-Page
  if (!user) {
    return <Landing />;
  }

  // Eingeloggt → App
  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />
      <Wheel />
    </main>
  );
}
