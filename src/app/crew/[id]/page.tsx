import { auth } from "@/auth";
import TopNav from "@/components/TopNav";
import CrewDetail from "./CrewDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CrewPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />
      <CrewDetail crewId={id} />
    </main>
  );
}
