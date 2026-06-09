import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "AGB · Rad der Schande",
  description: "Allgemeine Geschäftsbedingungen / Nutzungsbedingungen von Rad der Schande.",
};

export default function AGBPage() {
  return <LegalPage doc="agb" />;
}
