import { useState } from "react";
import { APP_VERSION } from "../../constants/appVersion";
import { supabase } from "../../lib/supabaseClient";
import type { Theme } from "../../types/theme";
import {
  CircleHelp,
  Bug,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import HelpOption from "./HelpOption";
import AccountPageContainer from "./AccountPageContainer";
import FeedbackForm from "./FeedbackForm";
import FeedbackSuccess from "./FeedbackSuccess";
import { TextInput } from "../component-library/TextInput";
import { Textarea } from "../component-library/Textarea";

type HelpView = "menu" | "faq" | "bug" | "feature" | "feedback";
type FeedbackType = "bug" | "feature" | "feedback";

type HelpFeedbackPageProps = {
  theme: Theme;
};

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

function HelpFeedbackPage({ theme }: HelpFeedbackPageProps) {
  const [helpView, setHelpView] = useState<HelpView>("menu");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = async (
    event: React.FormEvent<HTMLFormElement>,
    type: FeedbackType,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      const fields = Object.fromEntries(formData.entries());
      const { error } = await supabase.functions.invoke("submit-feedback", {
        body: { type, fields },
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error("Unable to submit feedback:", error);
      setSubmitError("Unable to send your message right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSubmission = () => {
    setSubmitError("");
    setIsSubmitted(false);
  };

  const goBack = () => {
    setHelpView("menu");
    setOpenFaq(null);
    resetSubmission();
  };

  const renderFeedbackSuccess = () => (
    <FeedbackSuccess theme={theme} onSendAnother={resetSubmission} />
  );

  if (helpView === "faq") {
    return (
      <AccountPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Answers to common questions about Where I'm Watching.
        </p>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            const answerId = `faq-answer-${index}`;

            return (
              <div
                key={item.question}
                className="nav-item rounded-lg border app-section-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="flex-1 font-semibold">{item.question}</span>

                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    className="px-4 pb-4 text-sm leading-6 opacity-70"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AccountPageContainer>
    );
  }

  if (helpView === "bug") {
    return (
      <AccountPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Tell us what went wrong so we can fix it.
        </p>

        {isSubmitted ? (
          renderFeedbackSuccess()
        ) : (
          <FeedbackForm
            submitLabel="Submit Bug Report"
            onCancel={goBack}
            isSubmitting={isSubmitting}
            error={submitError}
            onSubmit={(event) => submitFeedback(event, "bug")}
          >
            <TextInput
              required
              id="bug-subject"
              name="subject"
              type="text"
              label="Subject"
            />

            <Textarea
              required
              id="bug-description"
              name="description"
              rows={6}
              label="What happened?"
            />

            <Textarea
              id="bug-expected"
              name="expected"
              rows={4}
              label="What did you expect to happen?"
            />
          </FeedbackForm>
        )}
      </AccountPageContainer>
    );
  }

  if (helpView === "feature") {
    return (
      <AccountPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Have an idea that would make Where I'm Watching better?
        </p>

        {isSubmitted ? (
          renderFeedbackSuccess()
        ) : (
          <FeedbackForm
            submitLabel="Submit Feature Request"
            onCancel={goBack}
            isSubmitting={isSubmitting}
            error={submitError}
            onSubmit={(event) => submitFeedback(event, "feature")}
          >
            <TextInput
              required
              id="feature-title"
              name="title"
              type="text"
              label="Feature idea"
            />

            <Textarea
              required
              id="feature-description"
              name="description"
              rows={7}
              label="Tell us more about your idea"
            />
          </FeedbackForm>
        )}
      </AccountPageContainer>
    );
  }

  if (helpView === "feedback") {
    return (
      <AccountPageContainer>
        <BackButton onClick={goBack} label="Back to Help & Feedback" />

        <p className="mb-6 opacity-70">
          Tell us what you like, what you don't, or what we could do better.
        </p>

        {isSubmitted ? (
          renderFeedbackSuccess()
        ) : (
          <FeedbackForm
            submitLabel="Submit Feedback"
            onCancel={goBack}
            isSubmitting={isSubmitting}
            error={submitError}
            onSubmit={(event) => submitFeedback(event, "feedback")}
          >
            <Textarea
              required
              id="general-feedback"
              name="feedback"
              rows={8}
              label="Your feedback"
            />
          </FeedbackForm>
        )}
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer>
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
        Where I'm Watching · Version {APP_VERSION}
      </div>
    </AccountPageContainer>
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

export default HelpFeedbackPage;
