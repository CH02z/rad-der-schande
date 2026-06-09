"use client";

import { useState } from "react";
import { Trophy, History } from "lucide-react";
import Leaderboard from "@/components/Leaderboard";
import SpinHistory from "@/components/SpinHistory";
import { useT } from "@/lib/i18n";

type Tab = "ranking" | "history";

export default function TabelleTabs() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("ranking");

  const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: "ranking", label: t("tabelle.tabs.ranking"), icon: Trophy },
    { id: "history", label: t("tabelle.tabs.history"), icon: History },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="segmented w-full mb-5 grid grid-cols-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            data-active={tab === id}
            className="segmented-btn inline-flex items-center justify-center gap-1.5 !py-2"
          >
            <Icon size={14} strokeWidth={2.3} />
            {label}
          </button>
        ))}
      </div>

      {tab === "ranking" ? <Leaderboard /> : <SpinHistory />}
    </div>
  );
}
