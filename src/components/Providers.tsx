"use client";

import { ThemeProvider } from "@/lib/theme";
import { SoundProvider } from "@/lib/sound";
import { CrewProvider } from "@/lib/crew-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider>
        <CrewProvider>{children}</CrewProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
