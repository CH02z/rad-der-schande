import { signIn } from "@/auth";
import BrandMark from "@/components/BrandMark";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md">
        {/* Floating mark above the card */}
        <div className="flex justify-center mb-6">
          <div className="animate-float">
            <BrandMark size={64} />
          </div>
        </div>

        <div className="glass-strong rounded-[28px] p-8 sm:p-10 text-center shadow-glass">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none">
            Rad der <span className="gradient-shame">Schande</span>
          </h1>
          <p className="mt-3 text-white/55 text-sm sm:text-base">
            Melde dich an, um zu drehen und die ewige Schande-Tabelle zu sehen.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
            className="mt-7"
          >
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-3 w-full
                         rounded-2xl px-5 py-3.5 font-semibold text-[15px]
                         bg-white text-[#1a1a1a] transition-all
                         hover:-translate-y-0.5 hover:shadow-pop active:translate-y-0"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z" />
                <path fill="#FBBC05" d="M10.4 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6.1C.9 16.1 0 19.9 0 23.5s.9 7.4 2.6 10.9l7.8-6.1z" />
                <path fill="#34A853" d="M24 47c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.4 0-11.7-3.7-13.6-9l-7.8 6.1C6.5 42.6 14.6 47 24 47z" />
              </svg>
              Mit Google anmelden
            </button>
          </form>

          <p className="mt-6 text-xs text-white/35">
            Nur Mitglieder der Crew. Niemand sonst sieht eure Schande.
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-white/30">
          rad-der-schande.ch
        </p>
      </div>
    </main>
  );
}
