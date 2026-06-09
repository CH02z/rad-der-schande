import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Impressum · Rad der Schande",
  description: "Impressum und rechtliche Angaben zu Rad der Schande.",
};

export default function ImpressumPage() {
  return <LegalPage doc="impressum" />;
}
