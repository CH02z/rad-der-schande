import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz · Rad der Schande",
  description: "Datenschutzerklärung von Rad der Schande (revDSG/DSGVO).",
};

export default function DatenschutzPage() {
  return <LegalPage doc="datenschutz" />;
}
