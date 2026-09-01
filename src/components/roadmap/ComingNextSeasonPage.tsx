import { Bell, Camera, Film, Smartphone, Users } from "lucide-react";
import AccountPageContainer from "../account/AccountPageContainer";

type RoadmapItem = {
  title: string;
  description: string;
  icon: typeof Bell;
};

const nextSeason: RoadmapItem[] = [
  {
    title: "Smarter streaming services",
    description:
      "Choose the services you use, remember your recent selection, and help grow the shared service catalog.",
    icon: Film,
  },
  {
    title: "New-season alerts",
    description: "Get a heads-up when a show you follow is returning.",
    icon: Bell,
  },
  {
    title: "Mobile apps",
    description: "Capacitor-powered iPhone/iOS packaging first, followed by Android.",
    icon: Smartphone,
  },
];

const futureSeasons: RoadmapItem[] = [
  {
    title: "Screenshot import",
    description:
      "Upload a Continue Watching screenshot and turn recognized shows into importable entries.",
    icon: Camera,
  },
  {
    title: "Recommendations & sharing",
    description: "Send show recommendations with your own notes by email or text.",
    icon: Users,
  },
  {
    title: "Streaming integrations",
    description:
      "Explore direct service integrations where APIs, permissions, and terms make them possible.",
    icon: Film,
  },
];

function RoadmapSection({ title, items }: { title: string; items: RoadmapItem[] }) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 text-lg font-bold">{title}</h3>
      <div className="space-y-3">
        {items.map(({ title: itemTitle, description, icon: Icon }) => (
          <div key={itemTitle} className="app-section-card rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-semibold">{itemTitle}</div>
                <p className="mt-1 text-sm leading-6 opacity-65">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComingNextSeasonPage() {
  return (
    <AccountPageContainer>
      <p className="mb-7 opacity-70">
        A peek at what we're planning. Have another idea? Send it through Help & Feedback.
      </p>
      <RoadmapSection title="Coming Next Season" items={nextSeason} />
      <RoadmapSection title="Future Seasons" items={futureSeasons} />
    </AccountPageContainer>
  );
}

export default ComingNextSeasonPage;
