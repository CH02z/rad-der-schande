"use client";

import { ThemeProvider } from "@/lib/theme";
import { SoundProvider } from "@/lib/sound";
import { CrewProvider } from "@/lib/crew-context";
import { I18nProvider } from "@/lib/i18n";
import CookieConsent from "@/components/CookieConsent";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <SoundProvider>
          <CrewProvider>
            {children}
            <CookieConsent />
          </CrewProvider>
        </SoundProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
