type GuestMigrationPromptProps = {
  isMigrating: boolean;
  error: string;
  onMigrate: () => void;
  onDismiss: () => void;
};

function GuestMigrationPrompt({
  isMigrating,
  error,
  onMigrate,
  onDismiss,
}: GuestMigrationPromptProps) {
  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal w-full max-w-sm rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold">Bring your guest list with you?</h2>

        <p className="mt-4">
          You have shows saved in Guest Mode. Would you like to add them to your
          account so they&apos;re available when you sign in on other devices?
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="btn btn-default"
            disabled={isMigrating}
          >
            Not Now
          </button>

          <button
            type="button"
            onClick={onMigrate}
            className="btn btn-primary"
            disabled={isMigrating}
          >
            {isMigrating ? "Bringing Your List..." : "Bring My List"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestMigrationPrompt;
