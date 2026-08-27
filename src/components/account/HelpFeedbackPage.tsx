import { useState } from "react";
import {
  CircleHelp,
  Bug,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import HelpOption from "./HelpOption";

type HelpView = "menu" | "faq" | "bug" | "feature" | "feedback";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "How do I add a show to my list?",
    answer:
      "Select Add, search for the show you want, choose its streaming service and status, then save it to your list.",
  },
  {
    question: "Can I move a show to a different status?",
    answer:
      "Yes. Edit the show and change its status to Currently Watching, Want to Watch, Completed, or On Hold.",
  },
  {
    question: "Can I change the app theme?",
    answer:
      "Yes. Use the Theme selector in the navigation menu to switch between the available themes.",
  },
  {
    question: "Where does the show information come from?",
    answer:
      "Show search results and basic show information are provided by TVmaze.",
  },
];

function HelpFeedbackPage() {
  const [helpView, setHelpView] = useState<HelpView>("menu");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const goBack = () => {
    setHelpView("menu");
    setOpenFaq(null);
  };

  if (helpView === "faq") {
    return (
      <HelpPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Answers to common questions about Where I'm Watching.
        </p>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={item.question}
                className="nav-item rounded-lg border border-black/10 dark:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex-1 font-semibold">{item.question}</span>

                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-sm leading-6 opacity-70">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </HelpPageContainer>
    );
  }

  if (helpView === "bug") {
    return (
      <HelpPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Tell us what went wrong so we can fix it.
        </p>

        <form
          className="max-w-2xl space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="pretty-placeholder">
            <input
              required
              id="bug-subject"
              type="text"
              className="app-input w-full rounded-lg border px-4 py-2.5 outline-none"
            />

            <label htmlFor="bug-subject">Subject</label>
          </div>

          <div className="pretty-placeholder">
            <textarea
              required
              id="bug-description"
              rows={6}
              className="app-input w-full resize-y rounded-lg border px-4 py-3 outline-none"
            />

            <label htmlFor="bug-description">What happened?</label>
          </div>

          <div className="pretty-placeholder">
            <textarea
              id="bug-expected"
              rows={4}
              className="app-input w-full resize-y rounded-lg border px-4 py-3 outline-none"
            />

            <label htmlFor="bug-expected">What did you expect to happen?</label>
          </div>

          <FormActions submitLabel="Submit Bug Report" onCancel={goBack} />
        </form>
      </HelpPageContainer>
    );
  }

  if (helpView === "feature") {
    return (
      <HelpPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Have an idea that would make Where I'm Watching better?
        </p>

        <form
          className="max-w-2xl space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="pretty-placeholder">
            <input
              required
              id="feature-title"
              type="text"
              className="app-input w-full rounded-lg border px-4 py-2.5 outline-none"
            />

            <label htmlFor="feature-title">Feature idea</label>
          </div>

          <div className="pretty-placeholder">
            <textarea
              required
              id="feature-description"
              rows={7}
              className="app-input w-full resize-y rounded-lg border px-4 py-3 outline-none"
            />

            <label htmlFor="feature-description">
              Tell us more about your idea
            </label>
          </div>

          <FormActions submitLabel="Submit Feature Request" onCancel={goBack} />
        </form>
      </HelpPageContainer>
    );
  }

  if (helpView === "feedback") {
    return (
      <HelpPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Tell us what you like, what you don't, or what we could do better.
        </p>

        <form
          className="max-w-2xl space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="pretty-placeholder">
            <textarea
              required
              id="general-feedback"
              rows={8}
              className="app-input w-full resize-y rounded-lg border px-4 py-3 outline-none"
            />

            <label htmlFor="general-feedback">Your feedback</label>
          </div>

          <FormActions submitLabel="Submit Feedback" onCancel={goBack} />
        </form>
      </HelpPageContainer>
    );
  }

  return (
    <HelpPageContainer>
      <p className="mb-7 opacity-70">
        Need help, found a problem, or have an idea?
      </p>

      <div className="space-y-3">
        <HelpOption
          icon={CircleHelp}
          title="Help & FAQ"
          description="Find answers to common questions."
          onClick={() => setHelpView("faq")}
        />

        <HelpOption
          icon={Bug}
          title="Report a Bug"
          description="Something not working the way it should?"
          onClick={() => setHelpView("bug")}
        />

        <HelpOption
          icon={Lightbulb}
          title="Feature Request"
          description="Suggest something you'd like us to add."
          onClick={() => setHelpView("feature")}
        />

        <HelpOption
          icon={MessageSquare}
          title="General Feedback"
          description="Tell us what you like or what could be better."
          onClick={() => setHelpView("feedback")}
        />
      </div>

      <div className="mt-8 border-t pt-5 text-sm opacity-50">
        Where I'm Watching · Version 0.1.0
      </div>
    </HelpPageContainer>
  );
}

type HelpPageContainerProps = {
  children: React.ReactNode;
};

function HelpPageContainer({ children }: HelpPageContainerProps) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="max-w-4xl">{children}</div>
    </main>
  );
}

type BackButtonProps = {
  label: string;
  onClick: () => void;
};

function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 text-sm font-medium opacity-70 hover:opacity-100"
    >
      ← {label}
    </button>
  );
}

type FormActionsProps = {
  submitLabel: string;
  onCancel: () => void;
};

function FormActions({ submitLabel, onCancel }: FormActionsProps) {
  return (
    <>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>

        <button type="button" onClick={onCancel} className="btn btn-default">
          Cancel
        </button>
      </div>

      <p className="text-sm opacity-50">
        This form isn't being sent anywhere yet.
      </p>
    </>
  );
}

export default HelpFeedbackPage;
