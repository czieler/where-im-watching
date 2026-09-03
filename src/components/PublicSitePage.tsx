import { useEffect, useState, type ReactNode } from "react";
import { CircleHelp, ShieldCheck, Tv, CheckCircle2 } from "lucide-react";
import wiwLogo from "../assets/wiw_logo.png";
import { supabase } from "../lib/supabaseClient";
import { APP_VERSION } from "../constants/appVersion";
import { TextInput } from "./component-library/TextInput";
import { Textarea } from "./component-library/Textarea";

type PublicPage = "support" | "privacy" | "marketing";

type PublicSitePageProps = {
  page: PublicPage;
};

const faqItems = [
  ["How do I add a show?", "Open My List, select Add, search for a show, choose its status and streaming service, then save it."],
  ["Can I use the app without an account?", "Yes. Continue as Guest lets you use Where I'm Watching without signing up. Guest data stays in that browser or app installation."],
  ["How do I sync my list across devices?", "Create an account or sign in. Your account watchlist is stored securely so it can be available on your signed-in devices."],
  ["Can I move a show to another list?", "Yes. Edit the show and change its status to Currently Watching, Want to Watch, Completed, or On Hold."],
  ["Where does show information come from?", "Show search results and basic show information are provided by TVmaze."],
];

function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="light" className="min-h-screen bg-[#f3fbfa] text-slate-800">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <a href="/marketing" className="flex items-center gap-3 font-bold text-slate-900">
            <img src={wiwLogo} alt="" className="h-11 w-11 object-contain" />
            <span>Where I&apos;m Watching</span>
          </a>
          <nav className="flex gap-4 text-sm font-semibold" aria-label="Public pages">
            <a className="hover:underline" href="/support">Support</a>
            <a className="hover:underline" href="/privacy">Privacy</a>
          </nav>
        </div>
      </header>

      {children}

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-slate-500">
          <span>Where I&apos;m Watching · Version {APP_VERSION}</span>
          <span>
            Show information and artwork provided by{" "}
            <a
              href="https://www.tvmaze.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-teal-700 underline"
            >
              TVmaze
            </a>
            .
          </span>
          <span>© 2026 Carole Zieler</span>
        </div>
      </footer>
    </div>
  );
}

function PublicSitePage({ page }: PublicSitePageProps) {
  useEffect(() => {
    const titles: Record<PublicPage, string> = {
      support: "Support | Where I'm Watching",
      privacy: "Privacy Policy | Where I'm Watching",
      marketing: "Where I'm Watching | Your streaming watchlist",
    };
    document.title = titles[page];
  }, [page]);

  return (
    <PublicPageLayout>
      {page === "support" && <SupportContent />}
      {page === "privacy" && <PrivacyContent />}
      {page === "marketing" && <MarketingContent />}
    </PublicPageLayout>
  );
}

function SupportContent() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const submitSupport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-feedback", {
        body: { type: "feedback", fields: { subject, feedback: message, source: "public-support" } },
      });
      if (error) throw error;
      setSubject("");
      setMessage("");
      setStatus("Thanks — your message has been sent.");
    } catch (error) {
      console.error("Unable to submit support request:", error);
      setStatus("We couldn't send your message right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-10">
        <CircleHelp className="mb-4 text-teal-700" size={34} />
        <h1 className="text-4xl font-bold text-slate-900">Support</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">Need help with Where I&apos;m Watching? Start with the common questions below, or send a message.</p>
      </div>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
        <div className="mt-5 space-y-4">
          {faqItems.map(([question, answer]) => (
            <div key={question} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900">{question}</h3>
              <p className="mt-2 leading-7 text-slate-600">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-2xl font-bold text-slate-900">Contact support</h2>
        <p className="mt-2 text-slate-600">Found a bug, have a question, or want to share feedback? Send it here.</p>
        <form onSubmit={submitSupport} className="mt-6">
          <TextInput
            label="Subject"
            required
            requiredIndicatorPosition="bottom"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            autoComplete="off"
          />
          <Textarea
            label="Message"
            required
            requiredIndicatorPosition="bottom"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            disabled={isSubmitting}
            className="rounded-lg bg-teal-700 px-5 py-3 font-bold disabled:opacity-60 hover:bg-teal-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-700"
            style={{ color: "#ffffff" }}
          >
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
          {status && <p role="status" className="mt-4 text-sm text-slate-600">{status}</p>}
        </form>
      </section>
    </main>
  );
}

function PrivacyContent() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <ShieldCheck className="mb-4 text-teal-700" size={34} />
      <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-3 text-slate-500">Effective September 3, 2026</p>
      <div className="mt-10 space-y-4 leading-7 text-slate-600">
        <PolicySection title="Overview">Where I&apos;m Watching collects and stores only the information needed to provide its watchlist, account, support, and synchronization features. We do not sell your personal information or use your data for third-party advertising.</PolicySection>
        <PolicySection title="Guest Mode">You can use Where I&apos;m Watching without creating an account. In Guest Mode, your watchlist, service preferences, theme, and related app settings are stored locally in your browser or app installation. Guest data is not synced to an account and may be lost if local app or browser data is cleared.</PolicySection>
        <PolicySection title="Account data">If you create an account, we process your email address for authentication. Your saved watchlist may include show titles, status, streaming service, season and episode progress, streaming profile labels, personal notes, and related timestamps. Account and synchronized watchlist data are stored using Supabase.</PolicySection>
        <PolicySection title="Show search and email services">Show searches and basic show information are provided by TVmaze, so search terms may be sent to TVmaze when you use show search. Authentication emails are delivered using Resend. These providers process information according to their own privacy practices.</PolicySection>
        <PolicySection title="Support and feedback">If you submit a bug report, feature request, support request, or other feedback, we process the information you choose to provide so we can respond to or improve the app.</PolicySection>
        <PolicySection title="Data control and deletion">Signed-in users can download a copy of their account information and saved watchlist from Privacy & Data in the app. You can also permanently delete your account and saved account data there. Guest users can clear locally stored guest data from the same area.</PolicySection>
        <PolicySection title="Data security and retention">We use service providers and reasonable technical measures designed to protect account data. Account data is retained while your account is active and is deleted when you use the in-app account deletion feature, subject to limited retention that may be required for security, legal, or operational purposes.</PolicySection>
        <PolicySection title="Children">Where I&apos;m Watching is a general-audience watchlist app and is not designed to collect personal information from children.</PolicySection>
        <PolicySection title="Changes to this policy">We may update this policy as the app changes. The effective date above will be updated when material changes are made.</PolicySection>
        <PolicySection title="Contact">Questions about privacy or your data can be submitted through our <a href="/support" className="font-semibold text-teal-700 underline">Support page</a>.</PolicySection>
      </div>
    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function MarketingContent() {
  const features = [
    "Organize shows by Watching, Want to Watch, Completed, and On Hold",
    "Track season and episode progress",
    "Remember which streaming service and profile you're using",
    "Add personal notes to your shows",
    "Search for shows instead of entering details manually",
    "Use the app as a guest or sign in to sync your watchlist",
  ];

  return (
    <main>
      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_.8fr] md:items-center">
        <div>
          <p className="font-bold uppercase tracking-widest text-teal-700">Your streaming watchlist</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-slate-900">Your watchlist, all in one place.</h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-600">Keep track of what you&apos;re watching, where you&apos;re watching it, and what you want to watch next.</p>
          <a
            href="/"
            className="mt-8 inline-block rounded-lg bg-teal-700 px-6 py-3 font-bold hover:bg-teal-800 hover:no-underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-700"
            style={{ color: "#ffffff" }}
          >
            Open Where I&apos;m Watching
          </a>
        </div>
        <div className="flex justify-center"><img src={wiwLogo} alt="Where I'm Watching TV mascot" className="w-52 max-w-full object-contain" /></div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="text-3xl font-bold text-slate-900">Never wonder where you left off.</h2>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">One simple list keeps your shows, progress, streaming services, profiles, and notes together.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map((feature) => <div key={feature} className="flex gap-3 rounded-xl border border-slate-200 p-4"><CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={20}/><span>{feature}</span></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <Tv className="text-teal-700" size={30}/>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Use it your way.</h2>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">Jump right in as a guest with no sign-up required, or create an account to keep your watchlist synced across signed-in devices.</p>
      </section>
    </main>
  );
}

export default PublicSitePage;
