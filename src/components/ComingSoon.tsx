import type { Theme } from "../types/theme";
import comingSoonLight from "../assets/coming_soon_light.png";
import comingSoonDark from "../assets/coming_soon_dark.png";
import IllustratedMessage from "./IllustratedMessage";

type ComingSoonProps = {
  theme: Theme;
  title?: string;
  message?: string;
};

function ComingSoon({
  theme,
  title = "Coming next season...",
  message = "This feature isn't available yet, but it's on our watchlist for a future release.",
}: ComingSoonProps) {
  const image = theme === "dark" ? comingSoonDark : comingSoonLight;

  return <IllustratedMessage image={image} title={title} message={message} />;
}

export default ComingSoon;
