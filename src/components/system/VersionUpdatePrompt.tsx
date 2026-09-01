type VersionUpdatePromptProps = {
  latestVersion: string;
  onRefresh: () => void;
};

function VersionUpdatePrompt({ latestVersion, onRefresh }: VersionUpdatePromptProps) {
  return (
    <div className="fixed bottom-5 left-1/2 z-[70] w-[min(92vw,34rem)] -translate-x-1/2 rounded-xl border app-section-card p-4 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="font-bold">A new season has been deployed 📺</div>
          <p className="mt-1 text-sm opacity-70">
            Version {latestVersion} is ready. Refresh to see the latest updates.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </div>
  );
}

export default VersionUpdatePrompt;
