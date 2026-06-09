import { auth } from "@/auth";
import TopNav from "@/components/TopNav";
import CrewList from "./CrewList";
import CrewHero from "./CrewHero";

export const dynamic = "force-dynamic";

export default async function CrewListPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />
      <CrewHero />
      <section className="max-w-xl mx-auto">
        <CrewList />
      </section>
    </main>
  );
}
