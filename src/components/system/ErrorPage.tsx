import { useEffect } from "react";
import { ArrowLeft, Home, LifeBuoy, RefreshCw } from "lucide-react";
import wiwLogo from "../../assets/wiw_logo.png";
import { APP_VERSION } from "../../constants/appVersion";
import type { Theme } from "../../types/theme";
import "../../theme.scss";

type ErrorPageProps = {
  status: 404 | 500;
  onRetry?: () => void;
};

const errorContent = {
  404: {
    eyebrow: "404 · Not Found",
    title: "This episode isn’t in the lineup.",
    message:
      "The page you’re looking for wandered off somewhere between seasons.",
    screenLabel: "NO SIGNAL",
  },
  500: {
    eyebrow: "500 · Technical Difficulties",
    title: "Well, that wasn’t in the script.",
    message:
      "Something went off-air behind the scenes. Your watchlist should still be waiting for you when things are back on track.",
    screenLabel: "PLEASE STAND BY",
  },
} as const;

const validThemes: Theme[] = ["light", "dark", "blues"];

function getSavedTheme(): Theme {
  const savedTheme = localStorage.getItem("theme");
  return validThemes.includes(savedTheme as Theme) ? (savedTheme as Theme) : "light";
}

function ErrorPage({ status, onRetry }: ErrorPageProps) {
  const content = errorContent[status];
  const theme = getSavedTheme();

  useEffect(() => {
    document.title = `${status} | Where I'm Watching`;
  }, [status]);

  return (
    <div data-theme={theme} className="error-page-shell min-h-screen">
      <header className="error-page-header">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <a href="/marketing" className="error-brand flex items-center gap-3 font-bold">
            <img src={wiwLogo} alt="" className="h-11 w-11 object-contain" />
            <span>Where I&apos;m Watching</span>
          </a>
          <a className="error-header-link text-sm font-semibold" href="/support">
            Support
          </a>
        </div>
      </header>

      <main className="error-page-main mx-auto grid w-full max-w-5xl items-center gap-10 px-5 py-12 md:grid-cols-[1fr_0.9fr] md:py-20">
        <section className="error-copy">
          <p className="error-eyebrow">{content.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="error-message mt-5 max-w-xl text-lg leading-8">
            {content.message}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/" className="error-primary-action">
              <Home size={18} aria-hidden="true" />
              Back to my watchlist
            </a>

            {status === 500 && onRetry ? (
              <button type="button" onClick={onRetry} className="error-secondary-action">
                <RefreshCw size={18} aria-hidden="true" />
                Try again
              </button>
            ) : (
              <button type="button" onClick={() => window.history.back()} className="error-secondary-action">
                <ArrowLeft size={18} aria-hidden="true" />
                Go back
              </button>
            )}
          </div>

          <a href="/support" className="error-support-link mt-6 inline-flex items-center gap-2 text-sm font-semibold">
            <LifeBuoy size={16} aria-hidden="true" />
            Need help? Visit Support
          </a>
        </section>

        <section className="error-tv-card" aria-label={`${status} error illustration`}>
          <div className="error-static" aria-hidden="true" />
          <img src={wiwLogo} alt="" className="error-mascot" />
          <div className="error-screen-message" aria-hidden="true">
            <span className="error-code">{status}</span>
            <span className="error-signal">{content.screenLabel}</span>
          </div>
        </section>
      </main>

      <footer className="error-page-footer">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm">
          <span>Where I&apos;m Watching · Version {APP_VERSION}</span>
          <span>© 2026 Carole Zieler</span>
        </div>
      </footer>
    </div>
  );
}

export default ErrorPage;
