import type { Theme } from "../types/theme";

import comingSoonLight from "../assets/coming_soon_light.png";
import comingSoonDark from "../assets/coming_soon_dark.png";

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

  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <img src={image} alt="" className="mb-5 w-40 max-w-full" />

      <h3 className="text-xl font-bold">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 opacity-70">{message}</p>
    </div>
  );
}

export default ComingSoon;
