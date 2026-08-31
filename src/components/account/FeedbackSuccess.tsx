import type { Theme } from "../../types/theme";
import comingSoonLight from "../../assets/coming_soon_light.png";
import comingSoonDark from "../../assets/coming_soon_dark.png";
import IllustratedMessage from "../IllustratedMessage";

type FeedbackSuccessProps = {
  theme: Theme;
  onSendAnother: () => void;
};

function FeedbackSuccess({ theme, onSendAnother }: FeedbackSuccessProps) {
  const image = theme === "dark" ? comingSoonDark : comingSoonLight;

  return (
    <div className="app-section-card max-w-2xl rounded-xl border p-4 sm:p-6">
      <IllustratedMessage
        image={image}
        title="Thanks for the feedback!"
        message="Your message was sent successfully. We appreciate you helping make Where I'm Watching better."
      >
        <button type="button" className="btn btn-default" onClick={onSendAnother}>
          Send another message
        </button>
      </IllustratedMessage>
    </div>
  );
}

export default FeedbackSuccess;
