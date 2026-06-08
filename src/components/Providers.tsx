"use client";

import { ThemeProvider } from "@/lib/theme";
import { SoundProvider } from "@/lib/sound";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider>{children}</SoundProvider>
    </ThemeProvider>
  );
}
